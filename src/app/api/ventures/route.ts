import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2).max(100),
  focusArea: z.string(),
  applicationData: z.object({
    foundingTeam: z.string().min(10),
    targetStudents: z.string().min(10),
    problemStatement: z.string().min(20),
    proposedSolution: z.string().min(20),
    currentTraction: z.string(),
    supportNeeded: z.string().min(10),
  }),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 400 });

  const venture = await prisma.venture.create({
    data: {
      name: parsed.data.name,
      focusArea: parsed.data.focusArea,
      leaderId: session.user.id,
      applicationData: parsed.data.applicationData,
    },
  });

  return NextResponse.json(venture);
}

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ventures = await prisma.venture.findMany({
    where: { leaderId: session.user.id },
    include: { milestones: true, _count: { select: { forumPosts: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(ventures);
}
