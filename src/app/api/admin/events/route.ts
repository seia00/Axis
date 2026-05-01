import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { requireAdmin, sanitizeUrl, safeError, safeString } from "@/lib/security";

const createSchema = z.object({
  title:       z.string().min(1).max(200),
  description: z.string().max(2000).optional().nullable(),
  date:        z.string().datetime(),
  endDate:     z.string().datetime().optional().nullable(),
  type:        z.string().min(1).max(50),
  url:         z.string().max(2048).optional().nullable(),
  color:       z.string().max(20).optional().nullable(),
});

export async function GET(_req: NextRequest) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const events = await prisma.calendarEvent.findMany({
      where: { isGlobal: true },
      orderBy: { date: "asc" },
      take: 1000,
    });

    return NextResponse.json(events);
  } catch (err) {
    return safeError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const body = await req.json().catch(() => ({}));
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid event" }, { status: 400 });
    }
    const data = parsed.data;

    let safeUrlValue: string | null = null;
    if (data.url) {
      safeUrlValue = sanitizeUrl(data.url);
      if (!safeUrlValue) return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    const event = await prisma.calendarEvent.create({
      data: {
        title:       safeString(data.title, 200),
        description: data.description ? safeString(data.description, 2000) : null,
        date:        new Date(data.date),
        endDate:     data.endDate ? new Date(data.endDate) : null,
        type:        data.type,
        url:         safeUrlValue,
        color:       data.color ?? null,
        isGlobal:    true,
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (err) {
    return safeError(err);
  }
}
