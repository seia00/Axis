import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, safeError } from "@/lib/security";

const MAX_IDS = 50;

export async function GET(req: NextRequest) {
  try {
    const { error } = await requireSession();
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const ids = searchParams.get("ids")
      ?.split(",")
      .map(s => s.trim())
      .filter(Boolean)
      .slice(0, MAX_IDS) ?? [];

    if (ids.length === 0) return NextResponse.json([]);

    const users = await prisma.user.findMany({
      where: { id: { in: ids } },
      select: { id: true, name: true, image: true, skills: true, interests: true },
    });

    return NextResponse.json(users);
  } catch (err) {
    return safeError(err);
  }
}
