import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const project = await prisma.project.findUnique({ where: { id: params.id } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { roleId, message } = await req.json();
  if (!message) return NextResponse.json({ error: "Message is required" }, { status: 400 });

  // Check if already applied
  const existing = await prisma.application.findFirst({
    where: { userId: session.user.id, projectId: params.id, roleId: roleId ?? null },
  });
  if (existing) return NextResponse.json({ error: "Already applied" }, { status: 409 });

  const application = await prisma.application.create({
    data: {
      userId: session.user.id,
      projectId: params.id,
      roleId: roleId ?? null,
      message,
    },
  });

  return NextResponse.json(application, { status: 201 });
}
