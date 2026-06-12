import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "../../../../lib/prisma";
import { authOptions } from "../../auth/[...nextauth]/route";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Belum login" }, { status: 401 });
    }

    const { id } = await context.params;
    const requestId = Number(id);

    if (Number.isNaN(requestId)) {
      return NextResponse.json({ message: "ID request tidak valid" }, { status: 400 });
    }

    const body = await req.json();

    const allowedStatus = ["pending", "completed", "declined"];

    if (!allowedStatus.includes(body.status)) {
      return NextResponse.json({ message: "Status tidak valid" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ message: "User tidak ditemukan" }, { status: 404 });
    }

    const request = await prisma.balasBantuRequest.findFirst({
      where: {
        id: requestId,
        receiverId: user.id,
      },
    });

    if (!request) {
      return NextResponse.json(
        { message: "Request tidak ditemukan atau bukan untuk kamu" },
        { status: 403 }
      );
    }

    if (request.status === "completed") {
      return NextResponse.json(
        { message: "Request ini sudah pernah diselesaikan" },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.balasBantuRequest.update({
        where: {
          id: request.id,
        },
        data: {
          status: body.status,
        },
      });

      if (body.status === "completed") {
        await tx.user.update({
          where: {
            id: user.id,
          },
          data: {
            credit: {
              increment: 2,
            },
            surveysFilled: {
              increment: 1,
            },
          },
        });

        await tx.creditLog.create({
          data: {
            userId: user.id,
            amount: 2,
            type: "BALAS_BANTU_COMPLETED",
            description: "Menyelesaikan survey dari fitur Balas Bantu",
          },
        });
      }
    });

    return NextResponse.json({
      message:
        body.status === "completed"
          ? "Balas Bantu selesai. Kamu mendapat 2 kredit."
          : "Status Balas Bantu berhasil diupdate",
    });
  } catch (error) {
    console.error("BALAS_BANTU_PATCH_ERROR:", error);

    return NextResponse.json(
      { message: "Terjadi error saat update Balas Bantu" },
      { status: 500 }
    );
  }
}