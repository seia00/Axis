import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, safeError } from "@/lib/security";

export async function GET(_req: NextRequest) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

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
  } catch (err) {
    return safeError(err);
  }
}
