import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const opportunity = await prisma.opportunity.findUnique({ where: { id: params.id } });
  if (!opportunity) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.opportunity.update({ where: { id: params.id }, data: { viewCount: { increment: 1 } } });

  // Get related opportunities by shared tags
  const related = await prisma.opportunity.findMany({
    where: {
      id: { not: params.id },
      tags: { hasSome: opportunity.tags },
    },
    take: 4,
    orderBy: { savedCount: "desc" },
  });

  return NextResponse.json({ ...opportunity, related });
}
