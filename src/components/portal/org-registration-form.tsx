"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

const focusAreas = [
  "Environment", "Technology", "Arts", "Sports", "Academic",
  "Social Impact", "Entrepreneurship", "Culture", "Health", "STEM",
];

const activityTypes = [
  "Events & Conferences", "Workshops", "Community Service", "Research",
  "Competitions", "Networking", "Advocacy", "Media & Publishing",
];

export function OrgRegistrationForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    mission: "",
    location: "",
    isNational: false,
    website: "",
    instagram: "",
    focusArea: [] as string[],
    activityType: [] as string[],
    schoolLevel: ["High School"],
  });

  const toggleArray = (field: "focusArea" | "activityType", value: string) => {
    setForm(f => ({
      ...f,
      [field]: f[field].includes(value)
        ? f[field].filter(v => v !== value)
        : [...f[field], value],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.focusArea.length === 0) {
      setError("Please select at least one focus area.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/orgs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to create org");
      }
      await res.json();
      router.push("/network/dashboard");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="card space-y-4">
        <h2 className="text-sm font-semibold">Basic Information</h2>
        <Input
          label="Organization Name"
          value={form.name}
          onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
          required
          placeholder="e.g. Tokyo Youth Climate Network"
        />
        <Textarea
          label="Mission Statement"
          value={form.mission}
          onChange={(e) => setForm(f => ({ ...f, mission: e.target.value }))}
          required
          placeholder="What does your organization do and why does it exist?"
          rows={4}
          hint="Minimum 20 characters"
        />
        <div className="grid sm:grid-cols-2 gap-4">
          <Input
            label="Location"
            value={form.location}
            onChange={(e) => setForm(f => ({ ...f, location: e.target.value }))}
            required
            placeholder="e.g. Tokyo, Japan"
          />
          <Select
            label="Scope"
            options={[
              { value: "false", label: "Regional" },
              { value: "true", label: "National" },
            ]}
            value={String(form.isNational)}
            onChange={(e) => setForm(f => ({ ...f, isNational: e.target.value === "true" }))}
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Input
            label="Website (optional)"
            type="url"
            value={form.website}
            onChange={(e) => setForm(f => ({ ...f, website: e.target.value }))}
            placeholder="https://..."
          />
          <Input
            label="Instagram handle (optional)"
            value={form.instagram}
            onChange={(e) => setForm(f => ({ ...f, instagram: e.target.value.replace("@", "") }))}
            placeholder="username (no @)"
          />
        </div>
      </div>

      <div className="card space-y-4">
        <h2 className="text-sm font-semibold">Categories</h2>
        <div>
          <p className="text-sm font-medium mb-2">Focus Areas <span className="text-red-400">*</span></p>
          <div className="flex flex-wrap gap-2">
            {focusAreas.map((area) => (
              <button
                key={area}
                type="button"
                onClick={() => toggleArray("focusArea", area)}
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
        <div>
          <p className="text-sm font-medium mb-2">Activity Types</p>
          <div className="flex flex-wrap gap-2">
            {activityTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => toggleArray("activityType", type)}
                className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                  form.activityType.includes(type)
                    ? "border-violet-500 bg-violet-950/60 text-violet-300"
                    : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-violet-500/50"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg border border-red-800/30 bg-red-950/20 text-sm text-red-300">
          {error}
        </div>
      )}

      <Button type="submit" loading={loading} className="w-full" size="lg">
        Register Organization
      </Button>
    </form>
  );
}
