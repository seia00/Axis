"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Rocket } from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

interface Application {
  id: string;
  title: string;
  tagline?: string | null;
  category: string;
  stage: string;
  appliedAt?: Date | null;
  creatorId: string;
  creator?: { id: string; name?: string | null; email: string } | null;
}

export function AdminVenturesClient({ applications }: { applications: Application[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleAction = async (id: string, action: "accepted" | "rejected") => {
    setLoading(id + action);
    await fetch(`/api/admin/ventures/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ventureStage: action }),
    });
    setLoading(null);
    router.refresh();
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Venture Applications</h1>
        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-violet-950/60 text-violet-300 border border-violet-800/40">
          {applications.length} pending
        </span>
      </div>

      {applications.length === 0 ? (
        <div className="card text-center py-12">
          <Rocket className="w-10 h-10 text-[var(--muted-foreground)] mx-auto mb-3" />
          <p className="text-[var(--muted-foreground)]">No venture applications pending.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map(app => (
            <div key={app.id} className="card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium">{app.title}</h3>
                  {app.tagline && <p className="text-sm text-indigo-300 mt-0.5">{app.tagline}</p>}
                  <div className="flex flex-wrap gap-2 mt-1">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--surface-raised)] text-[var(--muted-foreground)] capitalize">{app.category}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--surface-raised)] text-[var(--muted-foreground)] capitalize">{app.stage}</span>
                    {app.creator && (
                      <span className="text-xs text-[var(--muted-foreground)]">by {app.creator.name ?? app.creator.email}</span>
                    )}
                    {app.appliedAt && (
                      <span className="text-xs text-[var(--muted-foreground)]">Applied {format(new Date(app.appliedAt), "MMM d, yyyy")}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    loading={loading === app.id + "rejected"}
                    onClick={() => handleAction(app.id, "rejected")}
                    className="text-red-400 hover:text-red-300"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </Button>
                  <Button
                    size="sm"
                    loading={loading === app.id + "accepted"}
                    onClick={() => handleAction(app.id, "accepted")}
                  >
                    <CheckCircle className="w-4 h-4" /> Accept
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
