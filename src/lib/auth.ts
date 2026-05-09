import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { prisma } from "./prisma";
import { Role } from "@prisma/client";
import type { Adapter } from "next-auth/adapters";

// Proxy every adapter method so the real exception is printed to Vercel
// function logs before NextAuth converts it to the opaque [Callback] code.
function withLogging(adapter: Adapter): Adapter {
  return new Proxy(adapter, {
    get(target, prop) {
      const val = (target as Record<string | symbol, unknown>)[prop];
      if (typeof val !== "function") return val;
      return async (...args: unknown[]) => {
        try {
          return await (val as (...a: unknown[]) => unknown).apply(target, args);
        } catch (err) {
          console.error(`[AUTH ADAPTER ERROR] ${String(prop)}:`, err);
          throw err;
        }
      };
    },
  });
}

export const authOptions: NextAuthOptions = {
  adapter: withLogging(PrismaAdapter(prisma) as Adapter),
  secret: process.env.NEXTAUTH_SECRET,
  // Enable debug logs in production temporarily to surface the Callback error
  debug: true,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    EmailProvider({
      server: {
        host: "smtp.resend.com",
        port: 465,
        auth: {
          user: "resend",
          pass: process.env.RESEND_API_KEY,
        },
      },
      from: process.env.EMAIL_FROM ?? "noreply@axis.community",
    }),
  ],
  session: {
    strategy: "database",
  },
  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/auth/verify",
    error: "/auth/error",
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user && user) {
        session.user.id = user.id;
        session.user.role = (user as any).role as Role;
        session.user.school = (user as any).school;
        session.user.banned = (user as any).banned;
      }
      return session;
    },
    async signIn({ user }) {
      // Guard: Google occasionally omits email on first-time sign-in edge cases
      if (!user.email) return false;
      try {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
          select: { banned: true },
        });
        if (dbUser?.banned) return false;
        return true;
      } catch (err) {
        // DB unreachable — log and allow sign-in rather than blocking all auth
        console.error("[NextAuth] signIn callback DB error:", err);
        return true;
      }
    },
  },
  events: {
    async createUser(_event) {
      await prisma.impactStat.upsert({
        where: { key: "total_students" },
        update: { value: { increment: 1 } },
        create: { key: "total_students", value: 1 },
      });
    },
  },
};
