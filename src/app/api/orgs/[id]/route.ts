import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { requireSession, sanitizeUrl, safeError, safeString } from "@/lib/security";

const updateSchema = z.object({
  name:            z.string().min(2).max(100).optional(),
  mission:         z.string().min(20).max(1000).optional(),
  activitySummary: z.string().max(2000).optional(),
  location:        z.string().max(100).optional(),
  focusArea:       z.array(z.string().max(50)).max(20).optional(),
  activityType:    z.array(z.string().max(50)).max(20).optional(),
  schoolLevel:     z.array(z.string().max(50)).max(10).optional(),
  isNational:      z.boolean().optional(),
  website:         z.string().max(500).optional(),
  instagram:       z.string().max(100).optional(),
  twitter:         z.string().max(100).optional(),
  memberCount:     z.number().int().positive().max(100_000).optional(),
  logoUrl:         z.string().max(2048).optional(),
  bannerUrl:       z.string().max(2048).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { session, error } = await requireSession();
    if (error) return error;

    const org = await prisma.organization.findUnique({
      where: { id: params.id },
      select: { id: true, leaderId: true },
    });
    if (!org) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const isLeader = org.leaderId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";
    if (!isLeader && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid update" }, { status: 400 });
    }
    const data: Record<string, unknown> = { ...parsed.data };

    // Validate every URL field — reject javascript:, data:, malformed
    for (const field of ["website", "logoUrl", "bannerUrl"] as const) {
      if (data[field]) {
        const safe = sanitizeUrl(data[field] as string);
        if (!safe) return NextResponse.json({ error: `Invalid ${field}` }, { status: 400 });
        data[field] = safe;
      }
    }

    // Length-cap every text field
    if (data.name)            data.name = safeString(data.name as string, 100);
    if (data.mission)         data.mission = safeString(data.mission as string, 1000);
    if (data.activitySummary) data.activitySummary = safeString(data.activitySummary as string, 2000);
    if (data.location)        data.location = safeString(data.location as string, 100);
    if (data.instagram)       data.instagram = safeString(data.instagram as string, 100).replace(/^@/, "");
    if (data.twitter)         data.twitter = safeString(data.twitter as string, 100).replace(/^@/, "");

    const updated = await prisma.organization.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json(updated);
  } catch (err) {
    return safeError(err);
  }
}
