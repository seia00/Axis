import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { requireSession, requireAdmin, sanitizeUrl, safeError, safeString } from "@/lib/security";

const querySchema = z.object({
  type:         z.string().max(50).optional(),
  region:       z.string().max(50).optional(),
  tags:         z.string().max(500).optional(),
  verifiedOnly: z.string().max(10).optional(),
  deadlineFrom: z.string().datetime().optional(),
  deadlineTo:   z.string().datetime().optional(),
  search:       z.string().max(200).optional(),
  ids:          z.string().max(2000).optional(),
});

const createSchema = z.object({
  title:        z.string().min(3).max(200),
  type:         z.string().min(1).max(50),
  organization: z.string().min(2).max(200),
  description:  z.string().min(20).max(10_000),
  eligibility:  z.string().max(2000).optional(),
  location:     z.string().max(100).optional(),
  isRemote:     z.boolean().optional(),
  url:          z.string().max(2048).optional(),
  deadline:     z.string().datetime().optional(),
  startDate:    z.string().datetime().optional(),
  endDate:      z.string().datetime().optional(),
  tags:         z.array(z.string().max(50)).max(20).optional(),
  regions:      z.array(z.string().max(50)).max(20).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { error } = await requireSession();
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const parsed = querySchema.safeParse(Object.fromEntries(searchParams.entries()));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid filters" }, { status: 400 });
    }
    const q = parsed.data;
    const tags = q.tags?.split(",").filter(Boolean).slice(0, 20) ?? [];
    const ids = q.ids?.split(",").filter(Boolean).slice(0, 100) ?? [];
    const verifiedOnly = q.verifiedOnly === "true";

    const opportunities = await prisma.opportunity.findMany({
      where: {
        ...(ids.length > 0 ? { id: { in: ids } } : {}),
        ...(q.type ? { type: q.type } : {}),
        ...(q.region ? { regions: { has: q.region } } : {}),
        ...(tags.length > 0 ? { tags: { hasSome: tags } } : {}),
        ...(verifiedOnly ? { isVerified: true } : {}),
        ...(q.deadlineFrom || q.deadlineTo ? {
          deadline: {
            ...(q.deadlineFrom ? { gte: new Date(q.deadlineFrom) } : {}),
            ...(q.deadlineTo ? { lte: new Date(q.deadlineTo) } : {}),
          },
        } : {}),
        ...(q.search ? {
          OR: [
            { title: { contains: q.search, mode: "insensitive" } },
            { organization: { contains: q.search, mode: "insensitive" } },
            { description: { contains: q.search, mode: "insensitive" } },
          ],
        } : {}),
      },
      orderBy: [{ isVerified: "desc" }, { deadline: "asc" }],
      take: 500,
    });

    return NextResponse.json(opportunities);
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
      return NextResponse.json({ error: "Invalid opportunity" }, { status: 400 });
    }
    const data = parsed.data;

    let safeUrlValue: string | null = null;
    if (data.url) {
      safeUrlValue = sanitizeUrl(data.url);
      if (!safeUrlValue) return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    const opportunity = await prisma.opportunity.create({
      data: {
        title:        safeString(data.title, 200),
        type:         data.type,
        organization: safeString(data.organization, 200),
        description:  safeString(data.description, 10_000),
        eligibility:  data.eligibility ? safeString(data.eligibility, 2000) : null,
        location:     data.location ? safeString(data.location, 100) : null,
        isRemote:     data.isRemote ?? false,
        url:          safeUrlValue,
        deadline:     data.deadline ? new Date(data.deadline) : null,
        startDate:    data.startDate ? new Date(data.startDate) : null,
        endDate:      data.endDate ? new Date(data.endDate) : null,
        tags:         data.tags ?? [],
        regions:      data.regions ?? [],
      },
    });

    return NextResponse.json(opportunity, { status: 201 });
  } catch (err) {
    return safeError(err);
  }
}
