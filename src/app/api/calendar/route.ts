import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const events = await prisma.calendarEvent.findMany({
    where: {
      OR: [
        { userId: session.user.id },
        { isGlobal: true },
      ],
    },
    orderBy: { date: "asc" },
  });

  return NextResponse.json(events);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, description, date, endDate, type, url, color, opportunityId, isGlobal } = body;

  if (!title || !date || !type) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const event = await prisma.calendarEvent.create({
    data: {
      title,
      description,
      date: new Date(date),
      endDate: endDate ? new Date(endDate) : null,
      type,
      url,
      color: color ?? null,
      opportunityId: opportunityId ?? null,
      userId: session.user.id,
      isGlobal: isGlobal ?? false,
    },
  });

  return NextResponse.json(event, { status: 201 });
}
