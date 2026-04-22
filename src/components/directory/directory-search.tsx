"use client";

import { useRouter, usePathname } from "next/navigation";
import { useCallback, useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface DirectorySearchProps {
  focusAreas: string[];
  initialParams: Record<string, string | undefined>;
}

export function DirectorySearch({ focusAreas, initialParams }: DirectorySearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState(initialParams.q ?? "");

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams();
      const current = { ...initialParams, ...updates };
      Object.entries(current).forEach(([k, v]) => {
        if (v) params.set(k, v);
      });
      router.push(`${pathname}?${params.toString()}`);
    },
    [initialParams, pathname, router]
  );

  const hasFilters = Object.values(initialParams).some(Boolean);

  const clearFilters = () => {
    setQ("");
    router.push(pathname);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && updateParams({ q: q || undefined })}
            placeholder="Search organizations, missions, tags..."
            leftIcon={<Search className="w-4 h-4" />}
            rightIcon={
              q ? (
                <button onClick={() => { setQ(""); updateParams({ q: undefined }); }}>
                  <X className="w-4 h-4 hover:text-[var(--foreground)]" />
                </button>
              ) : null
            }
          />
        </div>
        <Button onClick={() => updateParams({ q: q || undefined })} variant="secondary">
          Search
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          options={[
            { value: "", label: "All Focus Areas" },
            ...focusAreas.map((f) => ({ value: f, label: f })),
          ]}
          value={initialParams.focus ?? ""}
          onChange={(e) => updateParams({ focus: e.target.value || undefined })}
          className="w-auto"
        />

        <Select
          options={[
            { value: "", label: "All Tiers" },
            { value: "MEMBER", label: "AXIS Member" },
            { value: "VERIFIED", label: "AXIS Verified" },
            { value: "PARTNER", label: "AXIS Partner" },
          ]}
          value={initialParams.tier ?? ""}
          onChange={(e) => updateParams({ tier: e.target.value || undefined })}
          className="w-auto"
        />

        <Select
          options={[
            { value: "newest", label: "Sort: Newest" },
            { value: "alpha", label: "Sort: A–Z" },
            { value: "reviews", label: "Sort: Most Reviewed" },
            { value: "views", label: "Sort: Most Viewed" },
          ]}
          value={initialParams.sort ?? "newest"}
          onChange={(e) => updateParams({ sort: e.target.value })}
          className="w-auto"
        />

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
            <X className="w-3.5 h-3.5" />
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
}
