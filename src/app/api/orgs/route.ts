import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { slugify } from "@/lib/utils";
import { requireSession, sanitizeUrl, rateLimit, safeError, safeString } from "@/lib/security";

const createSchema = z.object({
  name:         z.string().min(2).max(100),
  mission:      z.string().min(20).max(1000),
  location:     z.string().min(2).max(100),
  focusArea:    z.array(z.string().max(50)).min(1).max(20),
  activityType: z.array(z.string().max(50)).max(20),
  schoolLevel:  z.array(z.string().max(50)).max(10),
  isNational:   z.boolean().default(false),
  website:      z.string().max(500).optional().or(z.literal("")),
  instagram:    z.string().max(100).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const { session, error } = await requireSession();
    if (error) return error;

    // Prevent abuse: cap orgs created per user per hour
    const limited = rateLimit(req, "org-create", 3, 3600_000, session.user.id);
    if (limited) return limited;

    const body = await req.json().catch(() => ({}));
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid org data" }, { status: 400 });
    }
    const data = parsed.data;

    let safeWebsite: string | null = null;
    if (data.website && data.website.length > 0) {
      safeWebsite = sanitizeUrl(data.website);
      if (!safeWebsite) {
        return NextResponse.json({ error: "Invalid website URL" }, { status: 400 });
      }
    }

    let slug = slugify(data.name);
    const existing = await prisma.organization.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (existing) slug = `${slug}-${Date.now()}`;

    const org = await prisma.organization.create({
      data: {
        name:         safeString(data.name, 100),
        mission:      safeString(data.mission, 1000),
        location:     safeString(data.location, 100),
        focusArea:    data.focusArea,
        activityType: data.activityType,
        schoolLevel:  data.schoolLevel,
        isNational:   data.isNational,
        website:      safeWebsite,
        instagram:    data.instagram ? safeString(data.instagram, 100).replace(/^@/, "") : null,
        slug,
        leaderId:     session.user.id,
      },
    });

    await prisma.user.update({
      where: { id: session.user.id },
      data: { role: "ORG_LEADER" },
    });

    await prisma.impactStat.upsert({
      where: { key: "total_orgs" },
      update: { value: { increment: 1 } },
      create: { key: "total_orgs", value: 1 },
    });

    return NextResponse.json(org);
  } catch (err) {
    return safeError(err);
  }
}
