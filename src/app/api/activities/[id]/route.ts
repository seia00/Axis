import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const activity = await prisma.activity.findUnique({ where: { id: params.id } });
  if (!activity) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (activity.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const updated = await prisma.activity.update({
    where: { id: params.id },
    data: {
      ...body,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : body.endDate === null ? null : undefined,
      hoursPerWeek: body.hoursPerWeek != null ? parseInt(body.hoursPerWeek) : undefined,
      peopleReached: body.peopleReached != null ? parseInt(body.peopleReached) : undefined,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const activity = await prisma.activity.findUnique({ where: { id: params.id } });
  if (!activity) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (activity.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.activity.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
