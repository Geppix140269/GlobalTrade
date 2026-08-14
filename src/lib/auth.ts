import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import type { Role } from "@/lib/authz";

/** bcrypt hash of a random string; used only to equalise failed-login timing. */
const DUMMY_HASH = "$2a$12$C6UzMDM.H6dfI/f/IKcEe.wpJlrM4bE9Km2h5b3Zc6zvE7L1QhVzq";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      role: Role;
      memberId: string | null;
    };
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const email = parsed.data.email.trim().toLowerCase();
        const user = await prisma.user.findUnique({
          where: { email },
          select: { id: true, email: true, passwordHash: true, role: true, isActive: true, memberId: true },
        });

        // Compare against a dummy hash when the user is missing so that a wrong
        // email and a wrong password take a comparable amount of time.
        const hash = user?.passwordHash ?? DUMMY_HASH;
        const passwordOk = await bcrypt.compare(parsed.data.password, hash);

        // Never log the submitted credentials — only a non-identifying outcome.
        if (!user || !passwordOk || !user.isActive) return null;

        return { id: user.id, email: user.email, role: user.role, memberId: user.memberId };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.uid = user.id;
      }
      return token;
    },
    session({ session, token }) {
      // Identity only. Role, active state and profile ownership are re-read from
      // the database on every request in getCurrentUser() so that an admin
      // disabling an account takes effect immediately rather than at token expiry.
      if (typeof token.uid === "string") {
        session.user.id = token.uid;
      }
      return session;
    },
  },
});
