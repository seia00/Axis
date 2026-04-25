import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [
    pendingOpportunities,
    pendingVentureApps,
    totalUsers,
    totalOpportunities,
    totalProjects,
  ] = await Promise.all([
    prisma.opportunity.count({ where: { isVerified: false } }),
    prisma.project.count({ where: { ventureStage: "applied" } }),
    prisma.user.count(),
    prisma.opportunity.count(),
    prisma.project.count(),
  ]);

  return NextResponse.json({
    pendingOpportunities,
    pendingVentureApps,
    totalUsers,
    totalOpportunities,
    totalProjects,
  });
}
