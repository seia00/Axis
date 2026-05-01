import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { requireSession, sanitizeUrl, safeError, safeString } from "@/lib/security";

const PROJECT_STAGES = ["idea", "prototype", "scaling", "launched"] as const;

// Whitelist of editable fields. The previous version did `data: body` which
// is mass-assignment — an attacker could update creatorId, createdAt, etc.
const updateSchema = z.object({
  title:       z.string().min(3).max(200).optional(),
  tagline:     z.string().max(300).optional(),
  description: z.string().min(20).max(10_000).optional(),
  stage:       z.enum(PROJECT_STAGES).optional(),
  category:    z.string().min(1).max(50).optional(),
  tags:        z.array(z.string().max(50)).max(20).optional(),
  websiteUrl:  z.string().max(2048).nullable().optional(),
});

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { session, error } = await requireSession();
    if (error) return error;
    void session;

    const project = await prisma.project.findUnique({ where: { id: params.id } });
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const [roles, members, creator] = await Promise.all([
      prisma.role2.findMany({ where: { projectId: params.id } }),
      prisma.projectMember.findMany({ where: { projectId: params.id } }),
      prisma.user.findUnique({
        where: { id: project.creatorId },
        select: { id: true, name: true, image: true, email: true },
      }),
    ]);

    const memberUserIds = members.map(m => m.userId);
    const memberUsers = await prisma.user.findMany({
      where: { id: { in: memberUserIds } },
      select: { id: true, name: true, image: true },
    });
    const memberUsersMap = Object.fromEntries(memberUsers.map(u => [u.id, u]));

    return NextResponse.json({
      ...project,
      roles,
      members: members.map(m => ({ ...m, user: memberUsersMap[m.userId] })),
      creator,
    });
  } catch (err) {
    return safeError(err);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { session, error } = await requireSession();
    if (error) return error;

    const project = await prisma.project.findUnique({ where: { id: params.id } });
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (project.creatorId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid update" }, { status: 400 });
    }
    const data = parsed.data;

    if (data.websiteUrl !== undefined && data.websiteUrl !== null) {
      const safe = sanitizeUrl(data.websiteUrl);
      if (!safe) return NextResponse.json({ error: "Invalid website URL" }, { status: 400 });
      data.websiteUrl = safe;
    }

    if (data.title) data.title = safeString(data.title, 200);
    if (data.tagline) data.tagline = safeString(data.tagline, 300);
    if (data.description) data.description = safeString(data.description, 10_000);

    const updated = await prisma.project.update({ where: { id: params.id }, data });
    return NextResponse.json(updated);
  } catch (err) {
    return safeError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { session, error } = await requireSession();
    if (error) return error;

    const project = await prisma.project.findUnique({ where: { id: params.id } });
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (project.creatorId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.project.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return safeError(err);
  }
}
