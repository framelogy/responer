import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "../../../../lib/prisma";
import { authOptions } from "../../auth/[...nextauth]/route";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(req: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ message: "Belum login" }, { status: 401 });
  }

  const { id } = await context.params;
  const surveyId = Number(id);

  if (Number.isNaN(surveyId)) {
    return NextResponse.json({ message: "ID survey tidak valid" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ message: "User tidak ditemukan" }, { status: 404 });
  }

  const survey = await prisma.survey.findFirst({
    where: {
      id: surveyId,
      userId: user.id,
      status: "active",
    },
  });

  if (!survey) {
    return NextResponse.json(
      { message: "Survey tidak ditemukan atau bukan milik kamu" },
      { status: 404 }
    );
  }

  return NextResponse.json(survey);
}

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Belum login" }, { status: 401 });
    }

    const { id } = await context.params;
    const surveyId = Number(id);

    if (Number.isNaN(surveyId)) {
      return NextResponse.json({ message: "ID survey tidak valid" }, { status: 400 });
    }

    const body = await req.json();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ message: "User tidak ditemukan" }, { status: 404 });
    }

    const normalizedLink =
  body.googleFormLink.startsWith("http://") ||
  body.googleFormLink.startsWith("https://")
    ? body.googleFormLink
    : `https://${body.googleFormLink}`;

    const result = await prisma.survey.updateMany({
      where: {
        id: surveyId,
        userId: user.id,
        status: "active",
      },
      data: {
        title: body.title,
        description: body.description,
        category: body.category,
        targetRespondent: body.targetRespondent,
        deadline: body.deadline ? new Date(body.deadline) : null,
        googleFormLink: normalizedLink,
      },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { message: "Survey tidak ditemukan atau bukan milik kamu" },
        { status: 403 }
      );
    }

    return NextResponse.json({ message: "Survey berhasil diupdate" });
  } catch (error) {
    console.error("UPDATE_SURVEY_ERROR:", error);

    return NextResponse.json(
      { message: "Terjadi error saat update survey" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Belum login" }, { status: 401 });
    }

    const { id } = await context.params;
    const surveyId = Number(id);

    if (Number.isNaN(surveyId)) {
      return NextResponse.json({ message: "ID survey tidak valid" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ message: "User tidak ditemukan" }, { status: 404 });
    }

    const result = await prisma.survey.updateMany({
      where: {
        id: surveyId,
        userId: user.id,
        status: "active",
      },
      data: {
        status: "deleted",
        deletedAt: new Date(),
      },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { message: "Survey tidak ditemukan atau bukan milik kamu" },
        { status: 403 }
      );
    }

    return NextResponse.json({ message: "Survey berhasil dihapus" });
  } catch (error) {
    console.error("DELETE_SURVEY_ERROR:", error);

    return NextResponse.json(
      { message: "Terjadi error saat hapus survey" },
      { status: 500 }
    );
  }
}