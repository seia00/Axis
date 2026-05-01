import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, safeError } from "@/lib/security";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { session, error } = await requireSession();
    if (error) return error;

    const project = await prisma.project.findUnique({
      where: { id: params.id },
      select: { id: true, creatorId: true },
    });
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (project.creatorId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const applications = await prisma.application.findMany({
      where: { projectId: params.id },
      orderBy: { createdAt: "desc" },
      take: 500,
    });

    const userIds = Array.from(new Set(applications.map(a => a.userId)));
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, image: true, email: true },
    });
    const usersMap = Object.fromEntries(users.map(u => [u.id, u]));

    return NextResponse.json(
      applications.map(a => ({ ...a, applicant: usersMap[a.userId] }))
    );
  } catch (err) {
    return safeError(err);
  }
}
