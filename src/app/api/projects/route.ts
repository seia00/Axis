import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { requireSession, sanitizeUrl, rateLimit, safeError, safeString } from "@/lib/security";

const PROJECT_STAGES = ["idea", "prototype", "scaling", "launched"] as const;

// Filtering — every query param tightly typed
const querySchema = z.object({
  stage:    z.enum(PROJECT_STAGES).optional(),
  category: z.string().max(50).optional(),
  skills:   z.string().max(500).optional(),
});

const roleSchema = z.object({
  title:       z.string().min(2).max(100),
  description: z.string().max(1000).optional(),
  skills:      z.array(z.string().max(50)).max(20).optional(),
  commitment:  z.string().max(100).optional(),
});

const createSchema = z.object({
  title:       z.string().min(3).max(200),
  tagline:     z.string().max(300).optional(),
  description: z.string().min(20).max(10_000),
  stage:       z.enum(PROJECT_STAGES).optional(),
  category:    z.string().min(1).max(50),
  tags:        z.array(z.string().max(50)).max(20).optional(),
  websiteUrl:  z.string().max(2048).optional(),
  roles:       z.array(roleSchema).max(20).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { session, error } = await requireSession();
    if (error) return error;
    void session;

    const { searchParams } = new URL(req.url);
    const parsed = querySchema.safeParse({
      stage:    searchParams.get("stage") ?? undefined,
      category: searchParams.get("category") ?? undefined,
      skills:   searchParams.get("skills") ?? undefined,
    });
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid filters" }, { status: 400 });
    }
    const skills = parsed.data.skills?.split(",").filter(Boolean).slice(0, 20) ?? [];

    const projects = await prisma.project.findMany({
      where: {
        ...(parsed.data.stage ? { stage: parsed.data.stage } : {}),
        ...(parsed.data.category ? { category: parsed.data.category } : {}),
        ...(skills.length > 0 ? { tags: { hasSome: skills } } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    const projectIds = projects.map(p => p.id);
    const roles = await prisma.role2.findMany({
      where: { projectId: { in: projectIds }, isFilled: false },
      select: { projectId: true },
    });
    const openRolesCount: Record<string, number> = {};
    roles.forEach(r => { openRolesCount[r.projectId] = (openRolesCount[r.projectId] ?? 0) + 1; });

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
  } catch (err) {
    return safeError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { session, error } = await requireSession();
    if (error) return error;

    // Rate limit project creation — prevent spam projects
    const limited = rateLimit(req, "project-create", 10, 3600_000, session.user.id);
    if (limited) return limited;

    const body = await req.json().catch(() => ({}));
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid project data" }, { status: 400 });
    }
    const data = parsed.data;

    const safeWebsite = data.websiteUrl ? sanitizeUrl(data.websiteUrl) : null;
    if (data.websiteUrl && !safeWebsite) {
      return NextResponse.json({ error: "Invalid website URL" }, { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        creatorId:   session.user.id,
        title:       safeString(data.title, 200),
        tagline:     data.tagline ? safeString(data.tagline, 300) : null,
        description: safeString(data.description, 10_000),
        stage:       data.stage ?? "idea",
        category:    data.category,
        tags:        data.tags ?? [],
        websiteUrl:  safeWebsite,
      },
    });

    if (data.roles && data.roles.length > 0) {
      await prisma.role2.createMany({
        data: data.roles.map((r) => ({
          projectId: project.id,
          title:       safeString(r.title, 100),
          description: r.description ? safeString(r.description, 1000) : null,
          skills:      r.skills ?? [],
          commitment:  r.commitment ? safeString(r.commitment, 100) : null,
        })),
      });
    }

    await prisma.projectMember.create({
      data: { userId: session.user.id, projectId: project.id, role: "Creator" },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (err) {
    return safeError(err);
  }
}
