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

  const click = await prisma.surveyClick.upsert({
    where: {
      userId_surveyId: {
        userId: user.id,
        surveyId: Number(surveyId),
      },
    },
    update: {},
    create: {
      userId: user.id,
      surveyId: Number(surveyId),
    },
  });

  return NextResponse.json(click);
}