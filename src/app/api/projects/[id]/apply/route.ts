import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { requireSession, rateLimit, safeError, safeString } from "@/lib/security";

const schema = z.object({
  roleId:  z.string().max(100).optional().nullable(),
  message: z.string().min(10).max(2000),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { session, error } = await requireSession();
    if (error) return error;

    // Rate limit applications to prevent harassment via spam apps
    const limited = rateLimit(req, "apply", 20, 3600_000, session.user.id); // 20/hr
    if (limited) return limited;

    const project = await prisma.project.findUnique({ where: { id: params.id } });
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await req.json().catch(() => ({}));
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid application" }, { status: 400 });
    }

    const roleId = parsed.data.roleId ?? null;

    // If a role was specified, confirm it actually belongs to this project
    if (roleId) {
      const role = await prisma.role2.findUnique({ where: { id: roleId } });
      if (!role || role.projectId !== params.id) {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 });
      }
    }

    // Check if already applied
    const existing = await prisma.application.findFirst({
      where: { userId: session.user.id, projectId: params.id, roleId },
    });
    if (existing) return NextResponse.json({ error: "Already applied" }, { status: 409 });

    const application = await prisma.application.create({
      data: {
        userId:    session.user.id,
        projectId: params.id,
        roleId,
        message:   safeString(parsed.data.message, 2000),
      },
    });

    return NextResponse.json(application, { status: 201 });
  } catch (err) {
    return safeError(err);
  }
}
