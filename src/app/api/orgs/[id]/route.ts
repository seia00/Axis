import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  mission: z.string().min(20).max(1000).optional(),
  activitySummary: z.string().max(2000).optional(),
  location: z.string().optional(),
  focusArea: z.array(z.string()).optional(),
  activityType: z.array(z.string()).optional(),
  schoolLevel: z.array(z.string()).optional(),
  isNational: z.boolean().optional(),
  website: z.string().optional(),
  instagram: z.string().optional(),
  twitter: z.string().optional(),
  memberCount: z.number().int().positive().optional(),
  logoUrl: z.string().optional(),
  bannerUrl: z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const org = await prisma.organization.findUnique({ where: { id: params.id } });
  if (!org) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isLeader = org.leaderId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";
  if (!isLeader && !isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 400 });

  const updated = await prisma.organization.update({
    where: { id: params.id },
    data: parsed.data,
  });

  return NextResponse.json(updated);
}
