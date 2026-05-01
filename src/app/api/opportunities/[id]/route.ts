import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, safeError } from "@/lib/security";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { error } = await requireSession();
    if (error) return error;

    const opportunity = await prisma.opportunity.findUnique({ where: { id: params.id } });
    if (!opportunity) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Increment view count (best-effort, don't block on failure)
    void prisma.opportunity
      .update({ where: { id: params.id }, data: { viewCount: { increment: 1 } } })
      .catch(() => {});

    const related = await prisma.opportunity.findMany({
      where: {
        id: { not: params.id },
        tags: { hasSome: opportunity.tags },
      },
      take: 4,
      orderBy: { savedCount: "desc" },
    });

    return NextResponse.json({ ...opportunity, related });
  } catch (err) {
    return safeError(err);
  }
}
