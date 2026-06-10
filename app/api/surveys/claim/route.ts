import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "../../../../lib/prisma";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ message: "Belum login" }, { status: 401 });
  }

  const { surveyId } = await req.json();

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ message: "User tidak ditemukan" }, { status: 404 });
  }

  const click = await prisma.surveyClick.findUnique({
    where: {
      userId_surveyId: {
        userId: user.id,
        surveyId: Number(surveyId),
      },
    },
  });

  if (!click) {
    return NextResponse.json({ message: "Survey belum dibuka" }, { status: 400 });
  }

  if (click.claimedAt) {
    return NextResponse.json({ message: "Kredit sudah pernah diklaim" }, { status: 400 });
  }

  await prisma.surveyClick.update({
    where: { id: click.id },
    data: { claimedAt: new Date() },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: {
      credit: { increment: 1 },
      surveysFilled: { increment: 1 },
    },
  });

  await prisma.creditLog.create({
    data: {
      userId: user.id,
      amount: 1,
      type: "FILL_SURVEY",
      description: "Mengisi survey",
    },
  });

  return NextResponse.json({ message: "Kredit berhasil diklaim" });
}