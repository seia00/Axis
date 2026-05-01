import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OrgTier } from "@prisma/client";
import { z } from "zod";
import { requireSession, rateLimit, safeError, safeString } from "@/lib/security";

const schema = z.object({
  orgId:      z.string().min(1).max(100),
  targetTier: z.nativeEnum(OrgTier),
  notes:      z.string().max(2000).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const { session, error } = await requireSession();
    if (error) return error;

    const limited = rateLimit(req, "verify-apply", 5, 3600_000, session.user.id);
    if (limited) return limited;

    const body = await req.json().catch(() => ({}));
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const org = await prisma.organization.findFirst({
      where: { id: parsed.data.orgId, leaderId: session.user.id },
      select: { id: true },
    });
    if (!org) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const application = await prisma.verificationApplication.upsert({
      where: { orgId: parsed.data.orgId },
      update: {
        targetTier: parsed.data.targetTier,
        notes: parsed.data.notes ? safeString(parsed.data.notes, 2000) : null,
        status: "pending",
        submittedAt: new Date(),
      },
      create: {
        orgId: parsed.data.orgId,
        targetTier: parsed.data.targetTier,
        notes: parsed.data.notes ? safeString(parsed.data.notes, 2000) : null,
      },
    });

    return NextResponse.json(application);
  } catch (err) {
    return safeError(err);
  }
}
