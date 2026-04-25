import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const stage = searchParams.get("stage");
  const category = searchParams.get("category");
  const skills = searchParams.get("skills")?.split(",").filter(Boolean) ?? [];

  const projects = await prisma.project.findMany({
    where: {
      ...(stage ? { stage } : {}),
      ...(category ? { category } : {}),
      ...(skills.length > 0 ? { tags: { hasSome: skills } } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  // Get open roles count for each project
  const projectIds = projects.map(p => p.id);
  const roles = await prisma.role2.findMany({
    where: { projectId: { in: projectIds }, isFilled: false },
    select: { projectId: true },
  });
  const openRolesCount: Record<string, number> = {};
  roles.forEach(r => { openRolesCount[r.projectId] = (openRolesCount[r.projectId] ?? 0) + 1; });

  // Get creator info
  const creatorIds = Array.from(new Set(projects.map(p => p.creatorId)));
  const creators = await prisma.user.findMany({
    where: { id: { in: creatorIds } },
    select: { id: true, name: true, image: true },
  });
  const creatorsMap = Object.fromEntries(creators.map(c => [c.id, c]));

  return NextResponse.json(projects.map(p => ({
    ...p,
    openRolesCount: openRolesCount[p.id] ?? 0,
    creator: creatorsMap[p.creatorId],
  })));
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, tagline, description, stage, category, tags, websiteUrl, roles } = body;

  if (!title || !description || !category) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const project = await prisma.project.create({
    data: {
      creatorId: session.user.id,
      title,
      tagline,
      description,
      stage: stage ?? "idea",
      category,
      tags: tags ?? [],
      websiteUrl,
    },
  });

  // Create roles if provided
  if (Array.isArray(roles) && roles.length > 0) {
    await prisma.role2.createMany({
      data: roles.map((r: { title: string; description?: string; skills?: string[]; commitment?: string }) => ({
        projectId: project.id,
        title: r.title,
        description: r.description,
        skills: r.skills ?? [],
        commitment: r.commitment,
      })),
    });
  }

  // Auto-add creator as member
  await prisma.projectMember.create({
    data: { userId: session.user.id, projectId: project.id, role: "Creator" },
  });

  return NextResponse.json(project, { status: 201 });
}
