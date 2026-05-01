import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { requireSession, safeError, safeString } from "@/lib/security";

const createSchema = z.object({
  title:       z.string().min(2).max(100),
  description: z.string().max(1000).optional(),
  skills:      z.array(z.string().max(50)).max(20).optional(),
  commitment:  z.string().max(100).optional(),
});

const deleteSchema = z.object({ roleId: z.string().min(1).max(100) });

async function ownsProject(projectId: string, userId: string, isAdmin: boolean) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, creatorId: true },
  });
  if (!project) return { ok: false as const, status: 404 as const };
  if (project.creatorId !== userId && !isAdmin) {
    return { ok: false as const, status: 403 as const };
  }
  return { ok: true as const };
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { error } = await requireSession();
    if (error) return error;

    const roles = await prisma.role2.findMany({
      where: { projectId: params.id },
    });

    return NextResponse.json(roles);
  } catch (err) {
    return safeError(err);
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { session, error } = await requireSession();
    if (error) return error;

    const owner = await ownsProject(params.id, session.user.id, session.user.role === "ADMIN");
    if (!owner.ok) return NextResponse.json({ error: owner.status === 404 ? "Not found" : "Forbidden" }, { status: owner.status });

    const body = await req.json().catch(() => ({}));
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
    const data = parsed.data;

    const role = await prisma.role2.create({
      data: {
        projectId:   params.id,
        title:       safeString(data.title, 100),
        description: data.description ? safeString(data.description, 1000) : null,
        skills:      data.skills ?? [],
        commitment:  data.commitment ? safeString(data.commitment, 100) : null,
      },
    });

    return NextResponse.json(role, { status: 201 });
  } catch (err) {
    return safeError(err);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { session, error } = await requireSession();
    if (error) return error;

    const owner = await ownsProject(params.id, session.user.id, session.user.role === "ADMIN");
    if (!owner.ok) return NextResponse.json({ error: owner.status === 404 ? "Not found" : "Forbidden" }, { status: owner.status });

    const body = await req.json().catch(() => ({}));
    const parsed = deleteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Confirm the role belongs to THIS project before deleting (prevents
    // deleting another project's role if attacker manipulates roleId).
    const role = await prisma.role2.findUnique({
      where: { id: parsed.data.roleId },
      select: { id: true, projectId: true },
    });
    if (!role || role.projectId !== params.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.role2.delete({ where: { id: parsed.data.roleId } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return safeError(err);
  }
}
