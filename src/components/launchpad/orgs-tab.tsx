"use client";

import { useEffect, useState, useCallback } from "react";
import { OrgCard } from "@/components/directory/org-card";
import { Search, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrgTier } from "@prisma/client";

interface OrgData {
  id:          string;
  name:        string;
  slug:        string;
  mission:     string;
  logoUrl:     string | null;
  location:    string;
  focusArea:   string[];
  tier:        OrgTier;
  memberCount: number | null;
  avgRating:   number | null;
  reviewCount: number;
  eventCount:  number;
}

const FOCUS_AREAS = [
  "Environment", "Technology", "Arts", "Sports", "Academic",
  "Social Impact", "Entrepreneurship", "Culture", "Health", "STEM",
];

export function OrgsTab() {
  const [orgs, setOrgs]       = useState<OrgData[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ]             = useState("");
  const [focus, setFocus]     = useState("");
  const [page, setPage]       = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchOrgs = useCallback(async (opts: { q: string; focus: string; page: number; append?: boolean }) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (opts.q)     params.set("q",     opts.q);
      if (opts.focus) params.set("focus", opts.focus);
      params.set("page", String(opts.page));
      const res = await fetch(`/api/orgs?${params}`);
      const data: OrgData[] = await res.json();
      if (opts.append) setOrgs(prev => [...prev, ...data]);
      else setOrgs(data);
      setHasMore(data.length === 30);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
    fetchOrgs({ q, focus, page: 1 });
  }, [q, focus, fetchOrgs]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchOrgs({ q, focus, page: next, append: true });
  };

  return (
    <div className="space-y-5">
      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
          <input
            type="text"
            placeholder="Search organizations..."
            value={q}
            onChange={e => setQ(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-indigo-500/60"
          />
        </div>
      </div>

      {/* Focus area pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFocus("")}
          className={`px-3 py-1 text-xs rounded-full border transition-colors ${
            focus === ""
              ? "border-indigo-500 bg-indigo-950/60 text-indigo-300"
              : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-indigo-500/50"
          }`}
        >
          All
        </button>
        {FOCUS_AREAS.map(area => (
          <button
            key={area}
            onClick={() => setFocus(prev => prev === area ? "" : area)}
            className={`px-3 py-1 text-xs rounded-full border transition-colors ${
              focus === area
                ? "border-indigo-500 bg-indigo-950/60 text-indigo-300"
                : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-indigo-500/50"
            }`}
          >
            {area}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading && orgs.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card animate-pulse h-52" />
          ))}
        </div>
      ) : orgs.length === 0 ? (
        <div className="text-center py-16 text-[var(--muted-foreground)]">
          <p className="text-base">No organizations found.</p>
          <p className="text-sm mt-1">Try adjusting your filters or register yours below.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {orgs.map(org => <OrgCard key={org.id} org={org} />)}
        </div>
      )}

      {hasMore && !loading && orgs.length > 0 && (
        <div className="flex justify-center pt-2">
          <Button variant="secondary" onClick={loadMore} className="flex items-center gap-2">
            <ChevronDown className="w-4 h-4" />
            Load more
          </Button>
        </div>
      )}
    </div>
  );
}
