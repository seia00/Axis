import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { requireSession, safeError, safeString } from "@/lib/security";

const schema = z.object({
  opportunityId: z.string().min(1).max(100),
  status:        z.enum(["saved", "applied", "interested", "completed"]).optional(),
  notes:         z.string().max(2000).optional(),
});

export async function GET(_req: NextRequest) {
  try {
    const { session, error } = await requireSession();
    if (error) return error;

    const saved = await prisma.savedOpportunity.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(saved);
  } catch (err) {
    return safeError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { session, error } = await requireSession();
    if (error) return error;

    const body = await req.json().catch(() => ({}));
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    const { opportunityId, status, notes } = parsed.data;

    // Verify opportunity exists — prevents orphan rows
    const opp = await prisma.opportunity.findUnique({
      where: { id: opportunityId },
      select: { id: true },
    });
    if (!opp) return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });

    // Toggle: if already saved, unsave
    const existing = await prisma.savedOpportunity.findUnique({
      where: { userId_opportunityId: { userId: session.user.id, opportunityId } },
    });

    if (existing) {
      await prisma.savedOpportunity.delete({ where: { id: existing.id } });
      await prisma.opportunity.update({
        where: { id: opportunityId },
        data: { savedCount: { decrement: 1 } },
      });
      return NextResponse.json({ saved: false });
    }

    const saved = await prisma.savedOpportunity.create({
      data: {
        userId: session.user.id,
        opportunityId,
        status: status ?? "saved",
        notes: notes ? safeString(notes, 2000) : null,
      },
    });
    await prisma.opportunity.update({
      where: { id: opportunityId },
      data: { savedCount: { increment: 1 } },
    });

    return NextResponse.json({ saved: true, data: saved }, { status: 201 });
  } catch (err) {
    return safeError(err);
  }
}
