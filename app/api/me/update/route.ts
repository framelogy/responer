import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "../../../../lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ message: "Belum login" }, { status: 401 });
  }

  const body = await req.json();

  const updatedUser = await prisma.user.update({
    where: { email: session.user.email },
    data: {
      username: body.username,
      avatarUrl: body.avatarUrl,
    },
    select: {
      username: true,
      avatarUrl: true,
      credit: true,
      surveysFilled: true,
      surveysPosted: true,
    },
  });

  return NextResponse.json(updatedUser);
}