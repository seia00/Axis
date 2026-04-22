import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { TierBadge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import {
  Eye, MessageSquare, Calendar, ShieldCheck, ArrowRight, Users
} from "lucide-react";
import Link from "next/link";
import { VerificationApplicationButton } from "@/components/portal/verification-button";

export default async function NetworkDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/signin");

  const org = await prisma.organization.findFirst({
    where: { leaderId: session.user.id },
    include: {
      _count: { select: { reviews: true, events: true } },
      reviews: { select: { rating: true } },
      verificationApplication: true,
    },
  });

  if (!org) redirect("/network/join");

  const avgRating =
    org.reviews.length > 0
      ? (org.reviews.reduce((s, r) => s + r.rating, 0) / org.reviews.length).toFixed(1)
      : null;

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight">{org.name}</h1>
            <TierBadge tier={org.tier} />
          </div>
          <p className="text-sm text-[var(--muted-foreground)]">
            Organization dashboard · Joined {formatDate(org.createdAt)}
          </p>
        </div>
        <Link href={`/directory/${org.slug}`} className="btn-secondary text-sm gap-2">
          View Public Profile <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Profile Views", value: org.profileViews.toLocaleString(), icon: Eye, change: "+12% this week" },
          { label: "Reviews", value: org._count.reviews, icon: MessageSquare, change: avgRating ? `${avgRating} avg rating` : "No rating yet" },
          { label: "Events", value: org._count.events, icon: Calendar, change: "Total hosted" },
          { label: "Members", value: org.memberCount ?? "—", icon: Users, change: "Listed members" },
        ].map(({ label, value, icon: Icon, change }) => (
          <div key={label} className="card">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
              <Icon className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">{change}</p>
          </div>
        ))}
      </div>

      {/* Verification CTA */}
      {org.tier === "MEMBER" && (
        <div className="card mb-6 border-indigo-500/20 bg-indigo-950/20">
          <div className="flex items-start gap-4">
            <ShieldCheck className="w-8 h-8 text-indigo-400 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Apply for AXIS Verified Status</h3>
              <p className="text-sm text-[var(--muted-foreground)] mb-4">
                Get the Verified badge and unlock priority placement in the Directory. Organizations with active events, 10+ members, and a complete profile qualify.
              </p>
              <VerificationApplicationButton
                orgId={org.id}
                existingApplication={org.verificationApplication}
              />
            </div>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid sm:grid-cols-3 gap-3">
        {[
          { href: "/network/profile", label: "Edit Profile", desc: "Update mission, links, tags", icon: "✏️" },
          { href: "/network/resources", label: "Resource Library", desc: "Download templates & toolkits", icon: "📦" },
          { href: "/network/merge", label: "Merge Program", desc: "Explore strategic mergers", icon: "🔀" },
        ].map(({ href, label, desc, icon }) => (
          <Link
            key={href}
            href={href}
            className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:border-indigo-500/30 hover:bg-[var(--surface-raised)] transition-all group"
          >
            <span className="text-2xl mb-2 block">{icon}</span>
            <p className="text-sm font-medium group-hover:text-indigo-300 transition-colors">{label}</p>
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
