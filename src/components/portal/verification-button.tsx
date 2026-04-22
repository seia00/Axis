"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

interface Props {
  orgId: string;
  existingApplication: { status: string; submittedAt: Date } | null;
}

export function VerificationApplicationButton({ orgId, existingApplication }: Props) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (existingApplication) {
    return (
      <div className="text-sm text-[var(--muted-foreground)]">
        Application {existingApplication.status} · Submitted {formatDate(existingApplication.submittedAt)}
      </div>
    );
  }

  const handleApply = async () => {
    setLoading(true);
    try {
      await fetch("/api/orgs/apply-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId, targetTier: "VERIFIED" }),
      });
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return <p className="text-sm text-emerald-400">Application submitted! We'll review it within 3 business days.</p>;
  }

  return (
    <Button onClick={handleApply} loading={loading} size="sm">
      Apply for Verified Status
    </Button>
  );
}
