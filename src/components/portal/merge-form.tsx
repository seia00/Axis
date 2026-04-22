"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/input";

const mergeTypes = [
  { value: "FULL_MERGER", label: "Full Merger — two orgs become one" },
  { value: "PROGRAMMATIC_MERGER", label: "Programmatic Merger — share specific programs" },
  { value: "ABSORB_REBRAND", label: "Absorb & Rebrand — one org absorbs the other" },
  { value: "COLLABORATIVE_ALLIANCE", label: "Collaborative Alliance — formal partnership" },
];

export function MergeRequestForm({ orgId }: { orgId: string }) {
  const [mergeType, setMergeType] = useState("FULL_MERGER");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await fetch("/api/merges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initiatorOrgId: orgId, mergeType, description }),
      });
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-lg border border-emerald-800/30 bg-emerald-950/20 p-6 text-sm text-emerald-300">
        <p className="font-medium mb-1">Request submitted!</p>
        <p className="text-emerald-400/80">Our facilitation team will reach out within 3 business days to begin the assessment process.</p>
      </div>
    );
  }

  return (
    <div className="card space-y-4">
      <div className="p-4 rounded-lg bg-indigo-950/30 border border-indigo-800/20 text-sm text-indigo-300">
        The AXIS Merge Program provides structured facilitation for student org mergers. All conversations are confidential.
      </div>

      <Select
        label="Merger Type"
        options={mergeTypes}
        value={mergeType}
        onChange={(e) => setMergeType(e.target.value)}
      />

      <Textarea
        label="Tell us about your interest"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="What's motivating this merger? What outcomes are you hoping for? Are you already in conversations with another org?"
        rows={5}
        hint="This message goes to the AXIS facilitation team, not other organizations."
      />

      <Button onClick={handleSubmit} loading={loading}>
        Submit Merge Interest
      </Button>
    </div>
  );
}
