import { prisma } from "@/lib/prisma";
import { OrgTier } from "@prisma/client";
import { Building, Users, Calendar, MessageSquare, ShieldCheck, Rocket } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Admin Overview" };

type RecentOrg = { id: string; name: string; tier: OrgTier; createdAt: Date; slug: string };

export default async function AdminPage() {
  const [
    orgCount, userCount, eventCount, reviewCount,
    pendingVerifications, pendingVentures, newsletterCount,
  ] = await Promise.all([
    prisma.organization.count(),
    prisma.user.count(),
    prisma.event.count(),
    prisma.review.count({ where: { removed: false } }),
    prisma.verificationApplication.count({ where: { status: "pending" } }),
    prisma.venture.count({ where: { status: "PENDING" } }),
    prisma.newsletterSubscriber.count(),
  ]);

  const recentOrgs: RecentOrg[] = await prisma.organization.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, name: true, tier: true, createdAt: true, slug: true },
  });

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Admin Overview</h1>
        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-950/60 text-red-300 border border-red-800/40 ml-2">
          Staff Only
        </span>
      </div>

      {(pendingVerifications > 0 || pendingVentures > 0) && (
        <div className="flex flex-wrap gap-3 mb-6">
          {pendingVerifications > 0 && (
            <Link
              href="/admin/verification"
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-amber-800/30 bg-amber-950/20 text-amber-300 text-sm hover:bg-amber-950/30 transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              {pendingVerifications} verification{pendingVerifications !== 1 ? "s" : ""} pending review
            </Link>
          )}
          {pendingVentures > 0 && (
            <Link
              href="/admin/ventures"
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-violet-800/30 bg-violet-950/20 text-violet-300 text-sm hover:bg-violet-950/30 transition-colors"
            >
              <Rocket className="w-4 h-4" />
              {pendingVentures} venture application{pendingVentures !== 1 ? "s" : ""} pending
            </Link>
          )}
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Organizations", value: orgCount, icon: Building, href: "/directory" },
          { label: "Users", value: userCount, icon: Users, href: "/admin/users" },
          { label: "Events", value: eventCount, icon: Calendar, href: "/directory/events" },
          { label: "Reviews", value: reviewCount, icon: MessageSquare, href: "/admin/reviews" },
        ].map(({ label, value, icon: Icon, href }) => (
          <Link key={label} href={href} className="card hover:border-indigo-500/30 transition-all">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
              <Icon className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-2xl font-bold">{value.toLocaleString()}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-sm font-semibold mb-4">Recently Joined</h2>
          <div className="space-y-3">
            {recentOrgs.map((org: RecentOrg) => (
              <div key={org.id} className="flex items-center justify-between">
                <div>
                  <Link href={`/directory/${org.slug}`} className="text-sm font-medium hover:text-indigo-300 transition-colors">
                    {org.name}
                  </Link>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {new Date(org.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-xs text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded-full">
                  {org.tier}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="text-sm font-semibold mb-4">Additional Metrics</h2>
          <dl className="space-y-3">
            {[
              { label: "Newsletter subscribers", value: newsletterCount.toLocaleString() },
              { label: "Pending verifications", value: pendingVerifications },
              { label: "Pending venture apps", value: pendingVentures },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                <dt className="text-sm text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-sm font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-4">
            <Link href="/admin/analytics" className="btn-secondary w-full text-sm justify-center">
              View Full Analytics
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
