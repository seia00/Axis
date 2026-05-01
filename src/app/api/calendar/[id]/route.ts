import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { requireSession, sanitizeUrl, safeError, safeString } from "@/lib/security";

const updateSchema = z.object({
  title:       z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  date:        z.string().datetime().optional(),
  endDate:     z.string().datetime().optional().nullable(),
  type:        z.string().min(1).max(50).optional(),
  url:         z.string().max(2048).optional().nullable(),
  color:       z.string().max(20).optional().nullable(),
});

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { session, error } = await requireSession();
    if (error) return error;

    const event = await prisma.calendarEvent.findUnique({ where: { id: params.id } });
    if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (event.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.calendarEvent.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return safeError(err);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { session, error } = await requireSession();
    if (error) return error;

    const event = await prisma.calendarEvent.findUnique({ where: { id: params.id } });
    if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (event.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid update" }, { status: 400 });
    }
    const input = parsed.data;
    const data: Record<string, unknown> = {};

    if (input.title !== undefined)       data.title = safeString(input.title, 200);
    if (input.description !== undefined) data.description = input.description ? safeString(input.description, 2000) : null;
    if (input.date !== undefined)        data.date = new Date(input.date);
    if (input.endDate !== undefined)     data.endDate = input.endDate ? new Date(input.endDate) : null;
    if (input.type !== undefined)        data.type = input.type;
    if (input.color !== undefined)       data.color = input.color;
    if (input.url !== undefined) {
      if (input.url === null || input.url === "") {
        data.url = null;
      } else {
        const safe = sanitizeUrl(input.url);
        if (!safe) return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
        data.url = safe;
      }
    }

    const updated = await prisma.calendarEvent.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json(updated);
  } catch (err) {
    return safeError(err);
  }
}
