import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const project = await prisma.project.findUnique({ where: { id: params.id } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (project.creatorId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const applications = await prisma.application.findMany({
    where: { projectId: params.id },
    orderBy: { createdAt: "desc" },
  });

  // Fetch applicant info
  const userIds = Array.from(new Set(applications.map(a => a.userId)));
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, image: true, email: true },
  });
  const usersMap = Object.fromEntries(users.map(u => [u.id, u]));

  return NextResponse.json(
    applications.map(a => ({ ...a, applicant: usersMap[a.userId] }))
  );
}
