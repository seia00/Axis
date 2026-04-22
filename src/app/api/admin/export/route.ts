import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const orgs = await prisma.organization.findMany({
    include: {
      _count: { select: { reviews: true, events: true } },
      reviews: { select: { rating: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const rows = [
    ["Name", "Slug", "Tier", "Location", "Focus Areas", "Member Count", "Events", "Reviews", "Avg Rating", "Joined"].join(","),
    ...orgs.map((org) => {
      const avgRating = org.reviews.length > 0
        ? (org.reviews.reduce((s, r) => s + r.rating, 0) / org.reviews.length).toFixed(1)
        : "";
      return [
        `"${org.name}"`,
        org.slug,
        org.tier,
        `"${org.location}"`,
        `"${org.focusArea.join("; ")}"`,
        org.memberCount ?? "",
        org._count.events,
        org._count.reviews,
        avgRating,
        org.createdAt.toISOString().split("T")[0],
      ].join(",");
    }),
  ].join("\n");

  return new NextResponse(rows, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="axis-orgs-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}
