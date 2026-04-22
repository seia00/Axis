import { prisma } from "@/lib/prisma";
import { BarChart3, Download } from "lucide-react";

type TopOrg = { name: string; slug: string; profileViews: number; tier: string };
type TierGroup = { tier: string; _count: { id: number } };

export const metadata = { title: "Analytics" };

export default async function AnalyticsPage() {
  const [
    orgsByTier, orgsByFocus, topViewedOrgs,
    reviewStats, eventStats,
  ] = await Promise.all([
    prisma.organization.groupBy({ by: ["tier"], _count: { id: true } }),
    prisma.organization.findMany({ select: { focusArea: true } }),
    prisma.organization.findMany({
      orderBy: { profileViews: "desc" },
      take: 10,
      select: { name: true, slug: true, profileViews: true, tier: true },
    }),
    prisma.review.aggregate({
      where: { removed: false },
      _avg: { rating: true },
      _count: { id: true },
    }),
    prisma.event.count(),
  ]);

  const focusCounts: Record<string, number> = {};
  orgsByFocus.forEach((org: { focusArea: string[] }) => {
    org.focusArea.forEach((f) => {
      focusCounts[f] = (focusCounts[f] ?? 0) + 1;
    });
  });
  const topFocusAreas = Object.entries(focusCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-400" />
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        </div>
        <a
          href="/api/admin/export"
          className="btn-secondary text-sm gap-2"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </a>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Orgs by tier */}
        <div className="card">
          <h2 className="text-sm font-semibold mb-4">Organizations by Tier</h2>
          <div className="space-y-3">
            {(orgsByTier as TierGroup[]).map((item) => (
              <div key={item.tier} className="flex items-center gap-3">
                <span className="text-xs text-[var(--muted-foreground)] w-20">{item.tier}</span>
                <div className="flex-1 h-2 bg-[var(--surface-overlay)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full"
                    style={{
                      width: `${(item._count.id / (orgsByTier as TierGroup[]).reduce((s, t) => s + t._count.id, 0)) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-xs font-medium w-6 text-right">{item._count.id}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top focus areas */}
        <div className="card">
          <h2 className="text-sm font-semibold mb-4">Top Focus Areas</h2>
          <div className="space-y-3">
            {topFocusAreas.map(([area, count]) => (
              <div key={area} className="flex items-center gap-3">
                <span className="text-xs text-[var(--muted-foreground)] w-32 truncate">{area}</span>
                <div className="flex-1 h-2 bg-[var(--surface-overlay)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-violet-600 rounded-full"
                    style={{ width: `${(count / (topFocusAreas[0][1] || 1)) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-medium w-6 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Review stats */}
        <div className="card">
          <h2 className="text-sm font-semibold mb-4">Review Statistics</h2>
          <div className="flex items-center gap-8">
            <div className="text-center">
              <p className="text-3xl font-bold gradient-text">
                {reviewStats._avg.rating?.toFixed(1) ?? "—"}
              </p>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">Avg rating</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold gradient-text">{reviewStats._count.id}</p>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">Total reviews</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold gradient-text">{eventStats}</p>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">Total events</p>
            </div>
          </div>
        </div>

        {/* Most viewed orgs */}
        <div className="card">
          <h2 className="text-sm font-semibold mb-4">Most Viewed Organizations</h2>
          <div className="space-y-2">
            {(topViewedOrgs as TopOrg[]).map((org, i) => (
              <div key={org.name} className="flex items-center gap-3">
                <span className="text-xs text-[var(--muted-foreground)] w-4 text-right">{i + 1}</span>
                <div className="flex-1 flex items-center gap-2">
                  <span className="text-sm text-[var(--foreground)] truncate">{org.name}</span>
                  <span className="text-xs text-indigo-400 flex-shrink-0">{org.tier}</span>
                </div>
                <span className="text-xs font-medium text-[var(--muted-foreground)]">
                  {org.profileViews.toLocaleString()} views
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
