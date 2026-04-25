"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, ShieldCheck, User } from "lucide-react";
import { useRouter } from "next/navigation";

interface Opp {
  id: string;
  title: string;
  organization: string;
  type: string;
  createdAt: Date;
}

interface UserInfo {
  id: string;
  name?: string | null;
  email: string;
  image?: string | null;
}

export function AdminVerifyClient({
  opportunities,
  users,
  activityCounts,
}: {
  opportunities: Opp[];
  users: UserInfo[];
  activityCounts: Record<string, number>;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleOpportunityAction = async (id: string, action: "approve" | "reject") => {
    setLoading(id + action);
    if (action === "approve") {
      await fetch(`/api/admin/opportunities/${id}/verify`, { method: "PATCH" });
    } else {
      await fetch(`/api/admin/opportunities/${id}/verify`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reject: true }),
      });
    }
    setLoading(null);
    router.refresh();
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Verification Queue</h1>
        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-amber-950/60 text-amber-300 border border-amber-800/40">
          {opportunities.length + users.length} pending
        </span>
      </div>

      {/* Pending Opportunities */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-3 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" /> Opportunities Pending Verification ({opportunities.length})
        </h2>
        {opportunities.length === 0 ? (
          <div className="card text-center py-8 text-[var(--muted-foreground)] text-sm">All caught up!</div>
        ) : (
          <div className="space-y-3">
            {opportunities.map(opp => (
              <div key={opp.id} className="card flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{opp.title}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">{opp.organization} · <span className="capitalize">{opp.type}</span> · {new Date(opp.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    loading={loading === opp.id + "reject"}
                    onClick={() => handleOpportunityAction(opp.id, "reject")}
                    className="text-red-400 hover:text-red-300"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </Button>
                  <Button
                    size="sm"
                    loading={loading === opp.id + "approve"}
                    onClick={() => handleOpportunityAction(opp.id, "approve")}
                  >
                    <CheckCircle className="w-4 h-4" /> Approve
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Users with 3+ Activities */}
      <section>
        <h2 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-3 flex items-center gap-2">
          <User className="w-4 h-4" /> Users with 3+ Activities ({users.length})
        </h2>
        {users.length === 0 ? (
          <div className="card text-center py-8 text-[var(--muted-foreground)] text-sm">No users meet the threshold yet.</div>
        ) : (
          <div className="space-y-3">
            {users.map(user => (
              <div key={user.id} className="card flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.image} alt="" className="w-8 h-8 rounded-full" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-600/20 flex items-center justify-center">
                      <User className="w-4 h-4 text-indigo-400" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-sm">{user.name ?? user.email}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">{activityCounts[user.id]} activities · {user.email}</p>
                  </div>
                </div>
                <Button size="sm" variant="secondary">
                  View Profile
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
