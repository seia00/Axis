import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { requireSession, safeError, safeString } from "@/lib/security";

const querySchema = z.object({ projectId: z.string().min(1).max(100) });

const createSchema = z.object({
  projectId:   z.string().min(1).max(100),
  title:       z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  dueDate:     z.string().datetime().optional(),
});

const patchSchema = z.object({
  id:          z.string().min(1).max(100),
  isCompleted: z.boolean(),
});

export async function GET(req: NextRequest) {
  try {
    const { error } = await requireSession();
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const parsed = querySchema.safeParse({ projectId: searchParams.get("projectId") });
    if (!parsed.success) {
      return NextResponse.json({ error: "projectId required" }, { status: 400 });
    }

    const milestones = await prisma.milestone.findMany({
      where: { projectId: parsed.data.projectId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(milestones);
  } catch (err) {
    return safeError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { session, error } = await requireSession();
    if (error) return error;

    const body = await req.json().catch(() => ({}));
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid milestone" }, { status: 400 });
    }
    const data = parsed.data;

    // Owner-only
    const project = await prisma.project.findUnique({
      where: { id: data.projectId },
      select: { id: true, creatorId: true },
    });
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (project.creatorId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const milestone = await prisma.milestone.create({
      data: {
        projectId:   data.projectId,
        title:       safeString(data.title, 200),
        description: data.description ? safeString(data.description, 2000) : null,
        dueDate:     data.dueDate ? new Date(data.dueDate) : null,
      },
    });

    return NextResponse.json(milestone, { status: 201 });
  } catch (err) {
    return safeError(err);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { session, error } = await requireSession();
    if (error) return error;

    const body = await req.json().catch(() => ({}));
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid update" }, { status: 400 });
    }
    const { id, isCompleted } = parsed.data;

    // CRITICAL fix: previous version had NO ownership check — any signed-in
    // user could mark any milestone on any project. Now: only project
    // creator (or admin) can update.
    const milestone = await prisma.milestone.findUnique({
      where: { id },
      select: { id: true, project: { select: { creatorId: true } } },
    });
    if (!milestone) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (
      milestone.project.creatorId !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.milestone.update({
      where: { id },
      data: {
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    return safeError(err);
  }
}
