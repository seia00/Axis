"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Organization } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { CheckCircle } from "lucide-react";

const focusAreas = [
  "Environment", "Technology", "Arts", "Sports", "Academic",
  "Social Impact", "Entrepreneurship", "Culture", "Health", "STEM",
];

export function OrgProfileEditor({ org }: { org: Organization }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: org.name,
    mission: org.mission,
    activitySummary: org.activitySummary ?? "",
    location: org.location,
    isNational: org.isNational,
    website: org.website ?? "",
    instagram: org.instagram ?? "",
    twitter: org.twitter ?? "",
    memberCount: org.memberCount ?? "",
    focusArea: org.focusArea,
  });

  const toggleFocus = (area: string) =>
    setForm(f => ({
      ...f,
      focusArea: f.focusArea.includes(area)
        ? f.focusArea.filter(a => a !== area)
        : [...f.focusArea, area],
    }));

  const handleSave = async () => {
    setLoading(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch(`/api/orgs/${org.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          memberCount: form.memberCount ? Number(form.memberCount) : null,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="card space-y-4">
        <h2 className="text-sm font-semibold">Basic Details</h2>
        <Input
          label="Organization Name"
          value={form.name}
          onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
        />
        <Textarea
          label="Mission Statement"
          value={form.mission}
          onChange={(e) => setForm(f => ({ ...f, mission: e.target.value }))}
          rows={3}
        />
        <Textarea
          label="Activity Summary (optional)"
          value={form.activitySummary}
          onChange={(e) => setForm(f => ({ ...f, activitySummary: e.target.value }))}
          rows={3}
          hint="Describe what you actually do — events, programs, initiatives"
        />
        <div className="grid sm:grid-cols-2 gap-4">
          <Input
            label="Location"
            value={form.location}
            onChange={(e) => setForm(f => ({ ...f, location: e.target.value }))}
          />
          <Input
            label="Member Count"
            type="number"
            value={form.memberCount}
            onChange={(e) => setForm(f => ({ ...f, memberCount: e.target.value }))}
            placeholder="Approximate"
          />
        </div>
        <Select
          label="Scope"
          options={[{ value: "false", label: "Regional" }, { value: "true", label: "National" }]}
          value={String(form.isNational)}
          onChange={(e) => setForm(f => ({ ...f, isNational: e.target.value === "true" }))}
        />
      </div>

      <div className="card space-y-4">
        <h2 className="text-sm font-semibold">Links</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <Input label="Website" type="url" value={form.website} onChange={(e) => setForm(f => ({ ...f, website: e.target.value }))} placeholder="https://..." />
          <Input label="Instagram" value={form.instagram} onChange={(e) => setForm(f => ({ ...f, instagram: e.target.value }))} placeholder="username" />
          <Input label="Twitter/X" value={form.twitter} onChange={(e) => setForm(f => ({ ...f, twitter: e.target.value }))} placeholder="handle" />
        </div>
      </div>

      <div className="card">
        <h2 className="text-sm font-semibold mb-3">Focus Areas</h2>
        <div className="flex flex-wrap gap-2">
          {focusAreas.map((area) => (
            <button
              key={area}
              type="button"
              onClick={() => toggleFocus(area)}
              className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                form.focusArea.includes(area)
                  ? "border-indigo-500 bg-indigo-950/60 text-indigo-300"
                  : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-indigo-500/50"
              }`}
            >
              {area}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg border border-red-800/30 bg-red-950/20 text-sm text-red-300">{error}</div>
      )}

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} loading={loading}>
          Save Changes
        </Button>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-emerald-400">
            <CheckCircle className="w-4 h-4" />
            Saved
          </span>
        )}
      </div>
    </div>
  );
}
