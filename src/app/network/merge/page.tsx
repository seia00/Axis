import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { MergeRequestForm } from "@/components/portal/merge-form";
import { formatDate } from "@/lib/utils";
import { GitMerge } from "lucide-react";

export const metadata = { title: "Merge Program" };

const statusSteps = ["INTAKE", "ASSESSMENT", "DESIGN", "INTEGRATION", "COMPLETED"];
const statusColors: Record<string, string> = {
  INTAKE: "indigo", ASSESSMENT: "violet", DESIGN: "amber",
  INTEGRATION: "emerald", COMPLETED: "emerald", REJECTED: "red",
};

export default async function MergeProgramPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/signin");

  const org = await prisma.organization.findFirst({ where: { leaderId: session.user.id } });
  if (!org) redirect("/network/join");

  const mergeRequests = await prisma.mergeRequest.findMany({
    where: {
      OR: [{ initiatorOrgId: org.id }, { targetOrgId: org.id }],
    },
    include: {
      initiatorOrg: { select: { name: true, slug: true } },
      targetOrg: { select: { name: true, slug: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight mb-1">Merge Program</h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          Explore strategic mergers with other AXIS member organizations.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Intake form */}
        <div>
          <h2 className="text-sm font-semibold mb-4">Submit Merge Interest</h2>
          <MergeRequestForm orgId={org.id} />
        </div>

        {/* Active merge requests */}
        <div>
          <h2 className="text-sm font-semibold mb-4">Your Merge Requests</h2>
          {mergeRequests.length === 0 ? (
            <div className="rounded-lg border border-[var(--border)] border-dashed p-8 text-center">
              <GitMerge className="w-8 h-8 text-[var(--muted-foreground)] mx-auto mb-3 opacity-50" />
              <p className="text-sm text-[var(--muted-foreground)]">No active merge requests</p>
            </div>
          ) : (
            <div className="space-y-3">
              {mergeRequests.map((mr) => {
                const isInitiator = mr.initiatorOrgId === org.id;
                const partner = isInitiator ? mr.targetOrg : mr.initiatorOrg;
                const statusIdx = statusSteps.indexOf(mr.status);
                const color = statusColors[mr.status] ?? "indigo";

                return (
                  <div key={mr.id} className="card">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-sm font-medium">
                          {isInitiator ? "Outgoing" : "Incoming"} Merge Request
                        </p>
                        {partner && (
                          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                            with {partner.name}
                          </p>
                        )}
                      </div>
                      <span className={`badge bg-${color}-950/80 text-${color}-300 border border-${color}-800/40`}>
                        {mr.status}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--muted-foreground)] mb-3">
                      Type: {mr.mergeType.replace(/_/g, " ")} · {formatDate(mr.createdAt)}
                    </p>
                    {/* Progress */}
                    <div className="flex items-center gap-1">
                      {statusSteps.slice(0, 5).map((step, i) => (
                        <div
                          key={step}
                          className={`h-1.5 flex-1 rounded-full transition-colors ${
                            i <= statusIdx
                              ? "bg-indigo-500"
                              : "bg-[var(--surface-overlay)]"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-[var(--muted-foreground)]">Intake</span>
                      <span className="text-xs text-[var(--muted-foreground)]">Complete</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
