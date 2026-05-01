import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { requireSession, sanitizeUrl, safeError, safeString } from "@/lib/security";

// Whitelist editable fields. Previous version did `data: { ...body }` which
// allowed mass-assignment attacks (overwriting userId, createdAt, etc.).
const updateSchema = z.object({
  title:         z.string().min(1).max(200).optional(),
  type:          z.string().min(1).max(50).optional(),
  organization:  z.string().max(200).optional().nullable(),
  role:          z.string().max(100).optional().nullable(),
  description:   z.string().max(5000).optional().nullable(),
  startDate:     z.string().datetime().optional(),
  endDate:       z.string().datetime().optional().nullable(),
  isCurrent:     z.boolean().optional(),
  hoursPerWeek:  z.number().int().min(0).max(168).optional().nullable(),
  peopleReached: z.number().int().min(0).max(10_000_000).optional().nullable(),
  awards:        z.array(z.string().max(200)).max(20).optional(),
  tags:          z.array(z.string().max(50)).max(20).optional(),
  proofUrl:      z.string().max(2048).optional().nullable(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { session, error } = await requireSession();
    if (error) return error;

    const activity = await prisma.activity.findUnique({ where: { id: params.id } });
    if (!activity) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (activity.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid update" }, { status: 400 });
    }
    const input = parsed.data;
    const data: Record<string, unknown> = {};

    if (input.title !== undefined)        data.title = safeString(input.title, 200);
    if (input.type !== undefined)         data.type = input.type;
    if (input.organization !== undefined) data.organization = input.organization ? safeString(input.organization, 200) : null;
    if (input.role !== undefined)         data.role = input.role ? safeString(input.role, 100) : null;
    if (input.description !== undefined)  data.description = input.description ? safeString(input.description, 5000) : null;
    if (input.startDate !== undefined)    data.startDate = new Date(input.startDate);
    if (input.endDate !== undefined)      data.endDate = input.endDate ? new Date(input.endDate) : null;
    if (input.isCurrent !== undefined)    data.isCurrent = input.isCurrent;
    if (input.hoursPerWeek !== undefined) data.hoursPerWeek = input.hoursPerWeek;
    if (input.peopleReached !== undefined) data.peopleReached = input.peopleReached;
    if (input.awards !== undefined)       data.awards = input.awards;
    if (input.tags !== undefined)         data.tags = input.tags;
    if (input.proofUrl !== undefined) {
      if (input.proofUrl === null || input.proofUrl === "") {
        data.proofUrl = null;
      } else {
        const safe = sanitizeUrl(input.proofUrl);
        if (!safe) return NextResponse.json({ error: "Invalid proof URL" }, { status: 400 });
        data.proofUrl = safe;
      }
    }

    const updated = await prisma.activity.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json(updated);
  } catch (err) {
    return safeError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { session, error } = await requireSession();
    if (error) return error;

    const activity = await prisma.activity.findUnique({ where: { id: params.id } });
    if (!activity) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (activity.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.activity.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return safeError(err);
  }
}
