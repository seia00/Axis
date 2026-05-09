import { NextResponse } from "next/server";

// Temporary diagnostic endpoint — remove after auth is confirmed working.
// Hit: GET /api/debug/db-check
export async function GET() {
  const checks: Record<string, string> = {};

  // 1. Env vars
  checks.DATABASE_URL = process.env.DATABASE_URL
    ? `set (starts with: ${process.env.DATABASE_URL.slice(0, 20)}...)`
    : "MISSING";
  checks.NEXTAUTH_URL = process.env.NEXTAUTH_URL ?? "MISSING";
  checks.NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET ? "set" : "MISSING";
  checks.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID ? "set" : "MISSING";
  checks.GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET ? "set" : "MISSING";

  // 2. DB connection
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ checks, db: "skipped — no DATABASE_URL" });
  }

  try {
    const { prisma } = await import("@/lib/prisma");
    // Simple query to verify connection and that tables exist
    const userCount = await prisma.user.count();
    const accountCount = await prisma.account.count();
    const sessionCount = await prisma.session.count();
    checks.db_connection = "OK";
    checks.db_users = String(userCount);
    checks.db_accounts = String(accountCount);
    checks.db_sessions = String(sessionCount);
  } catch (err: unknown) {
    checks.db_connection = "FAILED";
    checks.db_error = err instanceof Error ? err.message : String(err);
  }

  return NextResponse.json(checks, { status: 200 });
}
