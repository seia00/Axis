import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { slugify } from "@/lib/utils";

const createSchema = z.object({
  name: z.string().min(2).max(100),
  mission: z.string().min(20).max(1000),
  location: z.string().min(2),
  focusArea: z.array(z.string()).min(1),
  activityType: z.array(z.string()),
  schoolLevel: z.array(z.string()),
  isNational: z.boolean().default(false),
  website: z.string().url().optional().or(z.literal("")),
  instagram: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 400 });

  let slug = slugify(parsed.data.name);
  const existing = await prisma.organization.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now()}`;

  const org = await prisma.organization.create({
    data: {
      ...parsed.data,
      slug,
      leaderId: session.user.id,
      website: parsed.data.website || null,
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
}
