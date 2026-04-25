import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const saved = await prisma.savedOpportunity.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(saved);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { opportunityId, status, notes } = await req.json();
    if (!opportunityId) return NextResponse.json({ error: "Missing opportunityId" }, { status: 400 });

    // Check if already saved — if so, unsave
    const existing = await prisma.savedOpportunity.findUnique({
      where: { userId_opportunityId: { userId: session.user.id, opportunityId } },
    });

    if (existing) {
      await prisma.savedOpportunity.delete({ where: { id: existing.id } });
      await prisma.opportunity.update({ where: { id: opportunityId }, data: { savedCount: { decrement: 1 } } });
      return NextResponse.json({ saved: false });
    }

    const saved = await prisma.savedOpportunity.create({
      data: { userId: session.user.id, opportunityId, status: status ?? "saved", notes },
    });
    await prisma.opportunity.update({ where: { id: opportunityId }, data: { savedCount: { increment: 1 } } });

    return NextResponse.json({ saved: true, data: saved }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
