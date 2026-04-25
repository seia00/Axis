import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const activities = await prisma.activity.findMany({
    where: { userId: session.user.id },
    orderBy: { startDate: "desc" },
  });

  return NextResponse.json(activities);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, type, organization, role, description, startDate, endDate, isCurrent, hoursPerWeek, peopleReached, awards, tags, proofUrl } = body;

  if (!title || !type || !startDate) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const activity = await prisma.activity.create({
    data: {
      userId: session.user.id,
      title,
      type,
      organization,
      role,
      description,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      isCurrent: isCurrent ?? false,
      hoursPerWeek: hoursPerWeek ? parseInt(hoursPerWeek) : null,
      peopleReached: peopleReached ? parseInt(peopleReached) : null,
      awards: awards ?? [],
      tags: tags ?? [],
      proofUrl,
    },
  });

  return NextResponse.json(activity, { status: 201 });
}
