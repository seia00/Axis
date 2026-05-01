import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { requireSession, safeError, safeString } from "@/lib/security";

const updateSchema = z.object({
  status: z.enum(["saved", "applied", "interested", "completed"]).optional(),
  notes:  z.string().max(2000).optional().nullable(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { session, error } = await requireSession();
    if (error) return error;

    const saved = await prisma.savedOpportunity.findUnique({ where: { id: params.id } });
    if (!saved) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (saved.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid update" }, { status: 400 });
    }
    const data: Record<string, unknown> = {};
    if (parsed.data.status !== undefined) data.status = parsed.data.status;
    if (parsed.data.notes !== undefined) {
      data.notes = parsed.data.notes ? safeString(parsed.data.notes, 2000) : null;
    }

    const updated = await prisma.savedOpportunity.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json(updated);
  } catch (err) {
    return safeError(err);
  }
}
