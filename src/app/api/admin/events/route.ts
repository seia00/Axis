import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const events = await prisma.calendarEvent.findMany({
    where: { isGlobal: true },
    orderBy: { date: "asc" },
  });

  return NextResponse.json(events);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { title, description, date, endDate, type, url, color } = body;

  if (!title || !date || !type) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const event = await prisma.calendarEvent.create({
    data: {
      title,
      description: description ?? null,
      date: new Date(date),
      endDate: endDate ? new Date(endDate) : null,
      type,
      url: url ?? null,
      color: color ?? null,
      isGlobal: true,
    },
  });

  return NextResponse.json(event, { status: 201 });
}
