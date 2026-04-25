import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await req.json();
  if (!projectId) return NextResponse.json({ error: "projectId required" }, { status: 400 });

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
  if (project.creatorId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const updated = await prisma.project.update({
    where: { id: projectId },
    data: { isVenture: true, ventureStage: "applied", appliedAt: new Date() },
  });

  return NextResponse.json(updated);
}
