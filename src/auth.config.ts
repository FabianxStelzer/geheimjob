import type { NextAuthConfig } from "next-auth";
import type { Role } from "@prisma/client";
import Credentials from "next-auth/providers/credentials";

/**
 * Edge-tauglich (Middleware): keine Prisma/bcrypt-Aufrufe.
 * Muss dieselben JWT/Session-Callbacks wie auth.ts verwenden.
 */
export const authConfig = {
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "E-Mail" },
        password: { label: "Passwort", type: "password" },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as { id?: string; role?: Role };
        if (u.id) token.sub = u.id;
        if (u.role) token.role = u.role;
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
} satisfies NextAuthConfig;
