import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import type { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  providers: [
    Credentials({
      credentials: {
        email: { label: "E-Mail" },
        password: { label: "Passwort", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) return null;
        const email = String(credentials.email).toLowerCase().trim();
        const user = await prisma.user.findFirst({
          where: { email, deletedAt: null },
        });
        if (!user) return null;
        const ok = await bcrypt.compare(String(credentials.password), user.passwordHash);
        if (!ok) return null;

        let role = user.role as Role;
        const bootstrap = process.env.ADMIN_BOOTSTRAP_EMAIL?.toLowerCase().trim();
        if (bootstrap && email === bootstrap && role !== "ADMIN") {
          await prisma.user.update({
            where: { id: user.id },
            data: { role: "ADMIN" },
          });
          role = "ADMIN";
        }

        return {
          id: user.id,
          email: user.email,
          role,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      const userId =
        (user as { id?: string } | undefined)?.id ?? (token.sub as string | undefined);

      if (userId) {
        token.sub = userId;
        const dbUser = await prisma.user.findUnique({
          where: { id: userId },
          select: { role: true, deletedAt: true },
        });
        if (dbUser && !dbUser.deletedAt) {
          token.role = dbUser.role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.role = (token.role as Role) ?? "WORKER";
      }
      return session;
    },
  },
});
