import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, csvCell, safeError } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const orgs = await prisma.organization.findMany({
      include: {
        _count: { select: { reviews: true, events: true } },
        reviews: { select: { rating: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Header row — fixed strings, no injection vector here.
    const header = ["Name", "Slug", "Tier", "Location", "Focus Areas", "Member Count", "Events", "Reviews", "Avg Rating", "Joined"]
      .map(csvCell).join(",");

    const rows = orgs.map((org) => {
      const avgRating = org.reviews.length > 0
        ? (org.reviews.reduce((s, r) => s + r.rating, 0) / org.reviews.length).toFixed(1)
        : "";
      // EVERY user-controlled cell goes through csvCell — escapes formulas
      // (=, +, -, @) and quote-wraps to prevent comma/newline breakouts.
      return [
        csvCell(org.name),
        csvCell(org.slug),
        csvCell(org.tier),
        csvCell(org.location),
        csvCell(org.focusArea.join("; ")),
        csvCell(org.memberCount ?? ""),
        csvCell(org._count.events),
        csvCell(org._count.reviews),
        csvCell(avgRating),
        csvCell(org.createdAt.toISOString().split("T")[0]),
      ].join(",");
    });

    const body = [header, ...rows].join("\n");

    return new NextResponse(body, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="axis-orgs-${new Date().toISOString().split("T")[0]}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    return safeError(err);
  }
}
