import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { userHasActiveSubscription } from "@/lib/billing";
import { requireSession, sanitizeUrlOnHosts, safeError } from "@/lib/security";

// Resource files live in Supabase Storage. Restrict redirects to that host
// to prevent the endpoint from becoming an open-redirect vector if a row
// ever ends up with an attacker-controlled URL.
const ALLOWED_HOSTS = ["supabase.co", "supabase.in"];

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { session, error } = await requireSession();
    if (error) return NextResponse.redirect(new URL("/auth/signin", req.url));

    const canDownload = await userHasActiveSubscription(session.user.id);
    if (!canDownload) {
      return NextResponse.json({ error: "An active subscription is required" }, { status: 403 });
    }

    const resource = await prisma.resource.findUnique({ where: { id: params.id } });
    if (!resource) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Validate URL — must be http(s) AND on a trusted host.
    const safeUrl = sanitizeUrlOnHosts(resource.fileUrl, ALLOWED_HOSTS);
    if (!safeUrl) {
      return NextResponse.json({ error: "Resource has an invalid file URL" }, { status: 502 });
    }

    // Increment counter (best-effort — don't block the redirect on failure).
    void prisma.resource.update({
      where: { id: params.id },
      data: { downloadCount: { increment: 1 } },
    }).catch(() => {});

    void prisma.impactStat.upsert({
      where: { key: "total_downloads" },
      update: { value: { increment: 1 } },
      create: { key: "total_downloads", value: 1 },
    }).catch(() => {});

    return NextResponse.redirect(safeUrl);
  } catch (err) {
    return safeError(err);
  }
}
