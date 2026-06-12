import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "../../../lib/prisma";
import { authOptions } from "../auth/[...nextauth]/route";

function normalizeLink(link: string) {
  if (link.startsWith("http://") || link.startsWith("https://")) {
    return link;
  }

  return `https://${link}`;
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ message: "Belum login" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ message: "User tidak ditemukan" }, { status: 404 });
  }

  const requests = await prisma.balasBantuRequest.findMany({
    where: {
      receiverId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      requester: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      sourceSurvey: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  return NextResponse.json(requests);
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Belum login" }, { status: 401 });
    }

    const body = await req.json();

    const requester = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!requester) {
      return NextResponse.json({ message: "User tidak ditemukan" }, { status: 404 });
    }

    const sourceSurveyId = Number(body.sourceSurveyId);

    if (Number.isNaN(sourceSurveyId)) {
      return NextResponse.json({ message: "ID survey tidak valid" }, { status: 400 });
    }

    if (!body.title || !body.googleFormLink) {
      return NextResponse.json(
        { message: "Judul dan link survey wajib diisi" },
        { status: 400 }
      );
    }

    const sourceSurvey = await prisma.survey.findFirst({
      where: {
        id: sourceSurveyId,
        status: "active",
      },
    });

    if (!sourceSurvey) {
      return NextResponse.json({ message: "Survey asal tidak ditemukan" }, { status: 404 });
    }

    if (sourceSurvey.userId === requester.id) {
      return NextResponse.json(
        { message: "Kamu tidak bisa minta balas bantu ke survey sendiri" },
        { status: 400 }
      );
    }

    const claimed = await prisma.surveyClick.findFirst({
      where: {
        surveyId: sourceSurvey.id,
        userId: requester.id,
        claimedAt: {
          not: null,
        },
      },
    });

    if (!claimed) {
      return NextResponse.json(
        { message: "Kamu perlu klik Sudah Mengisi dulu sebelum minta Balas Bantu" },
        { status: 403 }
      );
    }

    const existing = await prisma.balasBantuRequest.findFirst({
      where: {
        requesterId: requester.id,
        receiverId: sourceSurvey.userId,
        sourceSurveyId: sourceSurvey.id,
        status: "pending",
      },
    });

    if (existing) {
      return NextResponse.json(
        { message: "Kamu sudah mengirim permintaan Balas Bantu untuk survey ini" },
        { status: 400 }
      );
    }

    const request = await prisma.balasBantuRequest.create({
      data: {
        requesterId: requester.id,
        receiverId: sourceSurvey.userId,
        sourceSurveyId: sourceSurvey.id,
        title: body.title,
        googleFormLink: normalizeLink(body.googleFormLink),
        note: body.note || null,
      },
    });

    return NextResponse.json({
      message: "Permintaan Balas Bantu berhasil dikirim",
      request,
    });
  } catch (error) {
    console.error("BALAS_BANTU_POST_ERROR:", error);

    return NextResponse.json(
      { message: "Terjadi error saat mengirim Balas Bantu" },
      { status: 500 }
    );
  }
}