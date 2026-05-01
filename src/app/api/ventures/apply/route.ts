import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { requireSession, rateLimit, safeError } from "@/lib/security";

const schema = z.object({ projectId: z.string().min(1).max(100) });

export async function POST(req: NextRequest) {
  try {
    const { session, error } = await requireSession();
    if (error) return error;

    const limited = rateLimit(req, "venture-apply", 5, 3600_000, session.user.id);
    if (limited) return limited;

    const body = await req.json().catch(() => ({}));
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    const { projectId } = parsed.data;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, creatorId: true },
    });
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
    if (project.creatorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.project.update({
      where: { id: projectId },
      data: { isVenture: true, ventureStage: "applied", appliedAt: new Date() },
    });

    return NextResponse.json(updated);
  } catch (err) {
    return safeError(err);
  }
}
