import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OrgTier } from "@prisma/client";
import { z } from "zod";

const schema = z.object({
  orgId: z.string(),
  targetTier: z.nativeEnum(OrgTier),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 400 });

  const org = await prisma.organization.findFirst({
    where: { id: parsed.data.orgId, leaderId: session.user.id },
  });
  if (!org) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const application = await prisma.verificationApplication.upsert({
    where: { orgId: parsed.data.orgId },
    update: { targetTier: parsed.data.targetTier, notes: parsed.data.notes, status: "pending", submittedAt: new Date() },
    create: { orgId: parsed.data.orgId, targetTier: parsed.data.targetTier, notes: parsed.data.notes },
  });

  return NextResponse.json(application);
}
