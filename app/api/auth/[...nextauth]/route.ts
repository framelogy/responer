import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "../../../../lib/prisma";

function makeUsername(email: string) {
  const name = email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "");
  return `@${name}${Math.floor(Math.random() * 999)}`;
}

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async signIn({ user, account }: any) {
      if (!user.email) return false;

      await prisma.user.upsert({
        where: { email: user.email },
        update: {
          googleId: account?.providerAccountId,
          name: user.name,
        },
        create: {
          email: user.email,
          googleId: account?.providerAccountId,
          name: user.name,
          username: makeUsername(user.email),
        },
      });

      return true;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };