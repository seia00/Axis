"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

export function VerificationActions({ applicationId }: { applicationId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);

  const handle = async (action: "approve" | "reject") => {
    setLoading(action);
    try {
      await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, action }),
      });
      router.refresh();
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant="secondary"
        loading={loading === "reject"}
        disabled={!!loading}
        onClick={() => handle("reject")}
        className="text-red-400 hover:text-red-300 gap-1.5"
      >
        <X className="w-3.5 h-3.5" />
        Reject
      </Button>
      <Button
        size="sm"
        loading={loading === "approve"}
        disabled={!!loading}
        onClick={() => handle("approve")}
        className="gap-1.5 bg-emerald-600 hover:bg-emerald-500"
      >
        <Check className="w-3.5 h-3.5" />
        Approve
      </Button>
    </div>
  );
}
