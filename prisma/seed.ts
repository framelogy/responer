import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const systemUser = await prisma.user.upsert({
    where: { email: "system@responer.local" },
    update: {},
    create: {
      email: "system@responer.local",
      username: "@Framelogy",
      name: "Framelogy",
      credit: 0,
    },
  });

  await prisma.survey.upsert({
    where: { id: 1 },
    update: {
      title: "Survei Pengembangan Platform Framelogy",
      description:
        "Bantu kami mengembangkan platform komunitas responden survei agar lebih sesuai dengan kebutuhan mahasiswa dan peneliti.",
      category: "Platform",
      targetRespondent: "Mahasiswa, peneliti, dan pengguna aktif Google Form",
      googleFormLink: "https://forms.gle/DhFviGCmc6aRHj6F9",
      status: "active",
    },
    create: {
      id: 1,
      userId: systemUser.id,
      title: "Survei Pengembangan Platform Framelogy",
      description:
        "Bantu kami mengembangkan platform komunitas responden survei agar lebih sesuai dengan kebutuhan mahasiswa dan peneliti.",
      category: "Platform",
      targetRespondent: "Mahasiswa, peneliti, dan pengguna aktif Google Form",
      googleFormLink: "https://forms.gle/DhFviGCmc6aRHj6F9",
      status: "active",
    },
  });
}

main()
  .then(() => {
    console.log("Seed berhasil");
  })
  .finally(async () => {
    await prisma.$disconnect();
  });