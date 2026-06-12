import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "../../../lib/prisma";
import { authOptions } from "../auth/[...nextauth]/route";

function getReciprocityBadge(score: number | null) {
  if (score === null) return "Baru";
  if (score >= 90) return "Sangat Aktif";
  if (score >= 75) return "Aktif";
  if (score >= 55) return "Cukup Aktif";
  if (score >= 30) return "Perlu Meningkatkan";
  return "Kurang Responsif";
}

function normalizeLink(link: string) {
  if (link.startsWith("http://") || link.startsWith("https://")) {
    return link;
  }

  return `https://${link}`;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    const user = session?.user?.email
      ? await prisma.user.findUnique({
          where: { email: session.user.email },
        })
      : null;

    const now = new Date();

    const surveys = await prisma.survey.findMany({
      where: {
        status: "active",
        OR: [{ deadline: null }, { deadline: { gte: now } }],
      },
      orderBy: { createdAt: "desc" },
      include: {
        clicks: {
          where: {
            userId: user?.id ?? -1,
            claimedAt: { not: null },
          },
          select: { id: true },
        },
      },
    });

    const result = await Promise.all(
      surveys.map(async (survey) => {
        const totalReceived = await prisma.balasBantuRequest.count({
          where: {
            receiverId: survey.userId,
          },
        });

        const completedReceived = await prisma.balasBantuRequest.count({
          where: {
            receiverId: survey.userId,
            status: "completed",
          },
        });

        const reciprocityScore =
          totalReceived === 0
            ? null
            : Math.round((completedReceived / totalReceived) * 100);

        return {
          ...survey,
          isClaimed: survey.clicks.length > 0,
          isOwner: user ? survey.userId === user.id : false,
          reciprocityScore,
          reciprocityBadge: getReciprocityBadge(reciprocityScore),
        };
      })
    );

    const sortedResult = result.sort((a, b) => {
      const scoreA = a.reciprocityScore ?? 50;
      const scoreB = b.reciprocityScore ?? 50;

      if (scoreB !== scoreA) return scoreB - scoreA;

      return (
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });

    return NextResponse.json(sortedResult);
  } catch (error) {
    console.error("GET_SURVEYS_ERROR:", error);

    return NextResponse.json(
      { message: "Terjadi error saat mengambil survey" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Belum login" }, { status: 401 });
    }

    const body = await req.json();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    if (user.credit < 3) {
      return NextResponse.json(
        { message: "Kredit belum cukup" },
        { status: 400 }
      );
    }

    if (!body.title || !body.category || !body.googleFormLink) {
      return NextResponse.json(
        { message: "Judul, kategori, dan link survey wajib diisi" },
        { status: 400 }
      );
    }

    const normalizedLink = normalizeLink(body.googleFormLink);

    const survey = await prisma.$transaction(async (tx) => {
      const createdSurvey = await tx.survey.create({
        data: {
          userId: user.id,
          title: body.title,
          description: body.description || null,
          category: body.category,
          targetRespondent: body.targetRespondent || null,
          deadline: body.deadline ? new Date(body.deadline) : null,
          googleFormLink: normalizedLink,
        },
      });

      await tx.user.update({
        where: { id: user.id },
        data: {
          credit: { decrement: 3 },
          surveysPosted: { increment: 1 },
        },
      });

      await tx.creditLog.create({
        data: {
          userId: user.id,
          amount: -3,
          type: "UPLOAD_SURVEY",
          description: "Upload survey baru",
        },
      });

      return createdSurvey;
    });

    return NextResponse.json({
      message: "Survey berhasil diupload",
      survey,
    });
  } catch (error) {
    console.error("UPLOAD_SURVEY_ERROR:", error);

    return NextResponse.json(
      { message: "Terjadi error saat upload survey" },
      { status: 500 }
    );
  }
}