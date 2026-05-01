import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { requireSession, sanitizeUrl, safeError, safeString } from "@/lib/security";

const createSchema = z.object({
  title:         z.string().min(1).max(200),
  type:          z.string().min(1).max(50),
  organization:  z.string().max(200).optional(),
  role:          z.string().max(100).optional(),
  description:   z.string().max(5000).optional(),
  startDate:     z.string().datetime(),
  endDate:       z.string().datetime().optional().nullable(),
  isCurrent:     z.boolean().optional(),
  hoursPerWeek:  z.number().int().min(0).max(168).optional().nullable(),
  peopleReached: z.number().int().min(0).max(10_000_000).optional().nullable(),
  awards:        z.array(z.string().max(200)).max(20).optional(),
  tags:          z.array(z.string().max(50)).max(20).optional(),
  proofUrl:      z.string().max(2048).optional(),
});

export async function GET(_req: NextRequest) {
  try {
    const { session, error } = await requireSession();
    if (error) return error;

    const activities = await prisma.activity.findMany({
      where: { userId: session.user.id },
      orderBy: { startDate: "desc" },
    });

    return NextResponse.json(activities);
  } catch (err) {
    return safeError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { session, error } = await requireSession();
    if (error) return error;

    const body = await req.json().catch(() => ({}));
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid activity" }, { status: 400 });
    }
    const data = parsed.data;

    let safeProof: string | null = null;
    if (data.proofUrl) {
      safeProof = sanitizeUrl(data.proofUrl);
      if (!safeProof) return NextResponse.json({ error: "Invalid proof URL" }, { status: 400 });
    }

    const activity = await prisma.activity.create({
      data: {
        userId:        session.user.id,
        title:         safeString(data.title, 200),
        type:          data.type,
        organization:  data.organization ? safeString(data.organization, 200) : null,
        role:          data.role ? safeString(data.role, 100) : null,
        description:   data.description ? safeString(data.description, 5000) : null,
        startDate:     new Date(data.startDate),
        endDate:       data.endDate ? new Date(data.endDate) : null,
        isCurrent:     data.isCurrent ?? false,
        hoursPerWeek:  data.hoursPerWeek ?? null,
        peopleReached: data.peopleReached ?? null,
        awards:        data.awards ?? [],
        tags:          data.tags ?? [],
        proofUrl:      safeProof,
      },
    });

    return NextResponse.json(activity, { status: 201 });
  } catch (err) {
    return safeError(err);
  }
}
