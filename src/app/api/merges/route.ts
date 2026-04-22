import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MergeType } from "@prisma/client";
import { z } from "zod";

const schema = z.object({
  initiatorOrgId: z.string(),
  mergeType: z.nativeEnum(MergeType),
  description: z.string().optional(),
  targetOrgId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 400 });

  const org = await prisma.organization.findFirst({
    where: { id: parsed.data.initiatorOrgId, leaderId: session.user.id },
  });
  if (!org) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const request = await prisma.mergeRequest.create({
    data: parsed.data,
  });

  return NextResponse.json(request);
}
