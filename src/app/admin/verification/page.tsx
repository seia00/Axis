import { prisma } from "@/lib/prisma";
import { VerificationActions } from "@/components/admin/verification-actions";
import { ShieldCheck, Clock } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Verification Queue" };

export default async function VerificationQueuePage() {
  const applications = await prisma.verificationApplication.findMany({
    where: { status: "pending" },
    include: {
      org: {
        include: {
          _count: { select: { reviews: true, events: true } },
          reviews: { select: { rating: true } },
          leader: { select: { name: true, email: true } },
        },
      },
    },
    orderBy: { submittedAt: "asc" },
  });

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <ShieldCheck className="w-5 h-5 text-indigo-400" />
        <h1 className="text-2xl font-bold tracking-tight">Verification Queue</h1>
        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-amber-950/60 text-amber-300 border border-amber-800/40 ml-1">
          {applications.length} pending
        </span>
      </div>

      {applications.length === 0 ? (
        <div className="text-center py-16 text-[var(--muted-foreground)]">
          <ShieldCheck className="w-10 h-10 mx-auto mb-3 opacity-30" />
          No pending applications. All caught up!
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const org = app.org;
            const avgRating = org.reviews.length > 0
              ? (org.reviews.reduce((s, r) => s + r.rating, 0) / org.reviews.length).toFixed(1)
              : null;

            return (
              <div key={app.id} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Link href={`/directory/${org.slug}`} className="font-semibold hover:text-indigo-300 transition-colors">
                        {org.name}
                      </Link>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-950/60 text-amber-300 border border-amber-800/40">
                        → {app.targetTier}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--muted-foreground)] mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Submitted {formatDate(app.submittedAt)} · Leader: {org.leader.name ?? org.leader.email}
                    </p>
                  </div>
                  <VerificationActions applicationId={app.id} />
                </div>

                {/* Criteria */}
                <div className="grid sm:grid-cols-4 gap-3 text-center">
                  {[
                    { label: "Events", value: org._count.events, threshold: 4, unit: "events" },
                    { label: "Members", value: org.memberCount ?? 0, threshold: 10, unit: "members" },
                    { label: "Reviews", value: org._count.reviews, threshold: 3, unit: "reviews" },
                    { label: "Rating", value: avgRating ? parseFloat(avgRating) : 0, threshold: 3, unit: "/5" },
                  ].map(({ label, value, threshold, unit }) => (
                    <div
                      key={label}
                      className={`p-3 rounded-lg border ${
                        (typeof value === "number" ? value : 0) >= threshold
                          ? "border-emerald-800/30 bg-emerald-950/10 text-emerald-300"
                          : "border-[var(--border)] bg-[var(--surface-raised)] text-[var(--muted-foreground)]"
                      }`}
                    >
                      <p className="text-lg font-bold">{value || "—"}</p>
                      <p className="text-xs mt-0.5">{label}</p>
                      <p className="text-xs opacity-60">min {threshold}{unit.startsWith("/") ? unit : " " + unit}</p>
                    </div>
                  ))}
                </div>

                {app.notes && (
                  <div className="mt-4 p-3 rounded-lg bg-[var(--surface-raised)] border border-[var(--border)]">
                    <p className="text-xs text-[var(--muted-foreground)]"><strong>Note from org:</strong> {app.notes}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
