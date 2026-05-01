import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MergeType } from "@prisma/client";
import { z } from "zod";
import { requireSession, rateLimit, safeError, safeString } from "@/lib/security";

const schema = z.object({
  initiatorOrgId: z.string().min(1).max(100),
  mergeType:      z.nativeEnum(MergeType),
  description:    z.string().max(5000).optional(),
  targetOrgId:    z.string().max(100).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const { session, error } = await requireSession();
    if (error) return error;

    const limited = rateLimit(req, "merge-create", 5, 3600_000, session.user.id);
    if (limited) return limited;

    const body = await req.json().catch(() => ({}));
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid merge request" }, { status: 400 });
    }

    const org = await prisma.organization.findFirst({
      where: { id: parsed.data.initiatorOrgId, leaderId: session.user.id },
      select: { id: true },
    });
    if (!org) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // If target specified, ensure it exists (prevents orphan merge rows)
    if (parsed.data.targetOrgId) {
      const target = await prisma.organization.findUnique({
        where: { id: parsed.data.targetOrgId },
        select: { id: true },
      });
      if (!target) return NextResponse.json({ error: "Target org not found" }, { status: 404 });
    }

    const request = await prisma.mergeRequest.create({
      data: {
        initiatorOrgId: parsed.data.initiatorOrgId,
        mergeType:      parsed.data.mergeType,
        description:    parsed.data.description ? safeString(parsed.data.description, 5000) : null,
        targetOrgId:    parsed.data.targetOrgId,
      },
    });

    return NextResponse.json(request);
  } catch (err) {
    return safeError(err);
  }
}
