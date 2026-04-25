import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const roles = await prisma.role2.findMany({
    where: { projectId: params.id },
  });

  return NextResponse.json(roles);
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const project = await prisma.project.findUnique({ where: { id: params.id } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (project.creatorId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { title, description, skills, commitment } = body;

  if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });

  const role = await prisma.role2.create({
    data: {
      projectId: params.id,
      title,
      description,
      skills: skills ?? [],
      commitment,
    },
  });

  return NextResponse.json(role, { status: 201 });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const project = await prisma.project.findUnique({ where: { id: params.id } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (project.creatorId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { roleId } = await req.json();
  if (!roleId) return NextResponse.json({ error: "roleId is required" }, { status: 400 });

  await prisma.role2.delete({ where: { id: roleId } });
  return NextResponse.json({ success: true });
}
