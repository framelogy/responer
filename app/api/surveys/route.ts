import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "../../../lib/prisma";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);

  const user = session?.user?.email
    ? await prisma.user.findUnique({
        where: { email: session.user.email },
      })
    : null;

  const surveys = await prisma.survey.findMany({
    where: { status: "active" },
    orderBy: { createdAt: "desc" },
    include: {
      clicks: user
        ? {
            where: {
              userId: user.id,
              claimedAt: { not: null },
            },
            select: { id: true },
          }
        : false,
    },
  });

const result = surveys.map((survey) => {
  const clicks = "clicks" in survey ? survey.clicks : [];

  return {
    ...survey,
    isClaimed: Array.isArray(clicks) && clicks.length > 0,
    isOwner: user ? survey.userId === user.id : false,
  };
});

  return NextResponse.json(result);
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
      return NextResponse.json({ message: "User tidak ditemukan" }, { status: 404 });
    }

    if (user.credit < 3) {
      return NextResponse.json({ message: "Kredit belum cukup" }, { status: 400 });
    }

    const normalizedLink =
  body.googleFormLink.startsWith("http://") ||
  body.googleFormLink.startsWith("https://")
    ? body.googleFormLink
    : `https://${body.googleFormLink}`;

    const survey = await prisma.survey.create({
      data: {
        userId: user.id,
        title: body.title,
        description: body.description,
        category: body.category,
        targetRespondent: body.targetRespondent,
        deadline: body.deadline ? new Date(body.deadline) : null,
        googleFormLink: normalizedLink,
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: {
        credit: { decrement: 3 },
        surveysPosted: { increment: 1 },
      },
    });

    await prisma.creditLog.create({
      data: {
        userId: user.id,
        amount: -3,
        type: "UPLOAD_SURVEY",
        description: "Upload survey baru",
      },
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