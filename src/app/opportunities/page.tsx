"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { StaggerContainer, StaggerItem } from "@/components/animation";
import Link from "next/link";
import {
  Search, ShieldCheck, Bookmark, BookmarkCheck, Calendar,
  MapPin, ExternalLink, Loader2, Plus, X
} from "lucide-react";
import { formatDistanceToNow, differenceInDays } from "date-fns";

const TYPES = ["competition", "program", "fellowship", "scholarship", "internship", "grant", "conference"];
const REGIONS = ["Japan", "Asia", "Global", "USA", "Europe", "Online"];

interface Opportunity {
  id: string;
  title: string;
  type: string;
  organization: string;
  description: string;
  deadline?: string;
  isVerified: boolean;
  isRemote: boolean;
  location?: string;
  tags: string[];
  regions: string[];
  savedCount: number;
}

interface SavedOpp {
  opportunityId: string;
  status: string;
  id: string;
}

// ── Deadline chip — sharp, data-coded ────────────────────────────────────────
function DeadlineChip({ deadline }: { deadline?: string }) {
  if (!deadline) return null;
  const days = differenceInDays(new Date(deadline), new Date());
  if (days < 0) return (
    <span className="mono" style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)", letterSpacing: "0.02em" }}>CLOSED</span>
  );
  const color = days <= 3 ? "#ef4444" : days <= 14 ? "#f97316" : "rgba(255,255,255,0.35)";
  const label = days <= 14 ? `${days}D` : formatDistanceToNow(new Date(deadline)).toUpperCase().replace(" ", "");
  return (
    <span
      className="mono"
      style={{ fontSize: "10px", color, letterSpacing: "0.04em", fontWeight: 600 }}
    >
      {label}
    </span>
  );
}

export default function OpportunitiesPage() {
  const { status } = useSession();
  const router = useRouter();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [saved, setSaved] = useState<SavedOpp[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterRegion, setFilterRegion] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [submitForm, setSubmitForm] = useState({ title: "", organization: "", type: "competition", description: "", url: "", deadline: "" });
  const [submitting, setSubmitting] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  const fetchOpportunities = useCallback(async () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (filterType) params.set("type", filterType);
    if (filterRegion) params.set("region", filterRegion);
    if (verifiedOnly) params.set("verifiedOnly", "true");
    const res = await fetch(`/api/opportunities?${params}`);
    if (res.ok) setOpportunities(await res.json());
    setLoading(false);
  }, [search, filterType, filterRegion, verifiedOnly]);

  const fetchSaved = useCallback(async () => {
    const res = await fetch("/api/saved-opportunities");
    if (res.ok) setSaved(await res.json());
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin?callbackUrl=/opportunities");
    if (status === "authenticated") { fetchOpportunities(); fetchSaved(); }
  }, [status, router, fetchOpportunities, fetchSaved]);

  useEffect(() => {
    if (status === "authenticated") {
      const t = setTimeout(fetchOpportunities, 300);
      return () => clearTimeout(t);
    }
  }, [search, filterType, filterRegion, verifiedOnly, status, fetchOpportunities]);

  const handleSave = async (id: string) => {
    setSavingId(id);
    const res = await fetch("/api/saved-opportunities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ opportunityId: id }),
    });
    if (res.ok) await fetchSaved();
    setSavingId(null);
  };

  const handleAddToCalendar = async (opp: Opportunity) => {
    if (!opp.deadline) return;
    await fetch("/api/calendar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: `Deadline: ${opp.title}`,
        date: opp.deadline,
        type: "deadline",
        color: "#8b5cf6",
        opportunityId: opp.id,
        description: `Deadline for ${opp.organization}`,
      }),
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const res = await fetch("/api/opportunities/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(submitForm),
    });
    if (res.ok) {
      setShowSubmitForm(false);
      setSubmitForm({ title: "", organization: "", type: "competition", description: "", url: "", deadline: "" });
    }
    setSubmitting(false);
  };

  const savedIds = new Set(saved.map(s => s.opportunityId));

  if (status === "loading") return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-4 h-4 animate-spin text-violet-500" />
    </div>
  );

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div
          className="flex items-center justify-between mb-6 pb-4"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div>
            <h1 className="text-xl font-bold text-white" style={{ letterSpacing: "-0.04em" }}>
              Opportunities
            </h1>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
              Competitions, fellowships, programs, scholarships
            </p>
          </div>
          <button
            onClick={() => setShowSubmitForm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white/45 hover:text-white/75 border border-white/[0.08] hover:border-violet-500/30 transition-all"
            style={{ borderRadius: "3px" }}
          >
            <Plus style={{ width: 12, height: 12 }} />
            Submit
          </button>
        </div>

        <div className="flex gap-5">

          {/* ── Filter sidebar — IDE panel ──────────────────────────────── */}
          <aside
            className="w-44 flex-shrink-0"
            style={{ borderRight: "1px solid rgba(255,255,255,0.06)", paddingRight: "1.25rem" }}
          >
            {/* Search */}
            <div className="relative mb-5">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-white/25" style={{ width: 12, height: 12 }} />
              <input
                className="input text-xs pl-7 pr-3 py-1.5"
                placeholder="Search..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ fontSize: "12px" }}
              />
            </div>

            {/* Type filter */}
            <div className="mb-4">
              <p className="data-label mb-2">TYPE</p>
              <div className="space-y-px">
                <FilterBtn active={!filterType} onClick={() => setFilterType("")} label="All" />
                {TYPES.map(t => (
                  <FilterBtn
                    key={t}
                    active={filterType === t}
                    onClick={() => setFilterType(t === filterType ? "" : t)}
                    label={t}
                  />
                ))}
              </div>
            </div>

            {/* Region filter */}
            <div className="mb-4">
              <p className="data-label mb-2">REGION</p>
              <div className="space-y-px">
                <FilterBtn active={!filterRegion} onClick={() => setFilterRegion("")} label="All" />
                {REGIONS.map(r => (
                  <FilterBtn
                    key={r}
                    active={filterRegion === r}
                    onClick={() => setFilterRegion(r === filterRegion ? "" : r)}
                    label={r}
                  />
                ))}
              </div>
            </div>

            {/* Verified toggle */}
            <button
              onClick={() => setVerifiedOnly(v => !v)}
              className="flex items-center gap-2 w-full text-left py-1"
            >
              <div
                className="w-3 h-3 flex-shrink-0 flex items-center justify-center transition-all"
                style={{
                  border: `1px solid ${verifiedOnly ? "#8b5cf6" : "rgba(255,255,255,0.15)"}`,
                  background: verifiedOnly ? "rgba(139,92,246,0.20)" : "transparent",
                  borderRadius: "2px",
                }}
              >
                {verifiedOnly && <div className="w-1.5 h-1.5 bg-violet-500" style={{ borderRadius: "1px" }} />}
              </div>
              <span className="text-[11px] flex items-center gap-1" style={{ color: verifiedOnly ? "#a78bfa" : "rgba(255,255,255,0.35)" }}>
                <ShieldCheck style={{ width: 11, height: 11 }} /> Verified
              </span>
            </button>
          </aside>

          {/* ── Main list ──────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-4 h-4 animate-spin text-violet-500" />
              </div>
            ) : opportunities.length === 0 ? (
              <div
                className="text-center py-12"
                style={{ border: "1px solid rgba(255,255,255,0.07)", borderRadius: "4px" }}
              >
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  No opportunities found — adjust filters.
                </p>
              </div>
            ) : (
              <StaggerContainer className="space-y-px">
                {opportunities.map(opp => (
                  <StaggerItem key={opp.id}>
                    <OppRow
                      opp={opp}
                      saved={savedIds.has(opp.id)}
                      saving={savingId === opp.id}
                      onSave={() => handleSave(opp.id)}
                      onCalendar={() => handleAddToCalendar(opp)}
                    />
                  </StaggerItem>
                ))}
              </StaggerContainer>
            )}
          </div>
        </div>
      </div>

      {/* ── Submit modal ─────────────────────────────────────────────────── */}
      {showSubmitForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70" style={{ backdropFilter: "blur(8px)" }} onClick={() => setShowSubmitForm(false)} />
          <div
            className="relative w-full max-w-lg p-5"
            style={{
              background: "var(--surface-raised)",
              border: "1px solid rgba(255,255,255,0.10)",
              borderRadius: "4px",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="data-label">SUBMIT OPPORTUNITY</span>
              </div>
              <button onClick={() => setShowSubmitForm(false)} className="text-white/30 hover:text-white/70 transition-colors">
                <X style={{ width: 14, height: 14 }} />
              </button>
            </div>
            <div className="space-y-2.5">
              <input className="input" placeholder="Title *" value={submitForm.title} onChange={e => setSubmitForm(f => ({ ...f, title: e.target.value }))} />
              <input className="input" placeholder="Organization *" value={submitForm.organization} onChange={e => setSubmitForm(f => ({ ...f, organization: e.target.value }))} />
              <select className="input" value={submitForm.type} onChange={e => setSubmitForm(f => ({ ...f, type: e.target.value }))}>
                {TYPES.map(t => <option key={t} value={t} style={{ background: "var(--surface-raised)" }}>{t}</option>)}
              </select>
              <textarea className="input min-h-[72px]" placeholder="Description *" value={submitForm.description} onChange={e => setSubmitForm(f => ({ ...f, description: e.target.value }))} />
              <input className="input" placeholder="URL" value={submitForm.url} onChange={e => setSubmitForm(f => ({ ...f, url: e.target.value }))} />
              <div>
                <label className="data-label block mb-1">DEADLINE</label>
                <input className="input" type="date" value={submitForm.deadline} onChange={e => setSubmitForm(f => ({ ...f, deadline: e.target.value }))} />
              </div>
            </div>
            <div
              className="flex justify-end gap-2 mt-4 pt-4"
              style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
            >
              <Button variant="secondary" size="sm" onClick={() => setShowSubmitForm(false)}>Cancel</Button>
              <Button size="sm" onClick={handleSubmit} loading={submitting} disabled={!submitForm.title || !submitForm.organization || !submitForm.description}>
                Submit for Review
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Filter button ─────────────────────────────────────────────────────────────
function FilterBtn({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="relative w-full text-left px-2 py-1 transition-colors capitalize"
      style={{
        fontSize: "12px",
        color: active ? "#a78bfa" : "rgba(255,255,255,0.30)",
        background: active ? "rgba(139,92,246,0.08)" : "transparent",
        borderRadius: "3px",
      }}
    >
      {active && (
        <span
          className="absolute left-0 top-0.5 bottom-0.5 w-px bg-violet-500"
          style={{ borderRadius: "0 1px 1px 0" }}
        />
      )}
      {label}
    </button>
  );
}

// ── Opportunity row ───────────────────────────────────────────────────────────
function OppRow({
  opp,
  saved,
  saving,
  onSave,
  onCalendar,
}: {
  opp: Opportunity;
  saved: boolean;
  saving: boolean;
  onSave: () => void;
  onCalendar: () => void;
}) {
  return (
    <div
      className="group flex items-start gap-3 px-3 py-2.5 transition-all duration-150 cursor-default"
      style={{
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "4px",
        background: "var(--surface)",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(139,92,246,0.22)";
        (e.currentTarget as HTMLElement).style.background = "rgba(139,92,246,0.03)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)";
        (e.currentTarget as HTMLElement).style.background = "var(--surface)";
      }}
    >
      {/* Type badge — left column */}
      <div className="flex-shrink-0 w-20 pt-0.5">
        <span
          className="data-label block truncate"
          style={{ color: "rgba(139,92,246,0.70)", fontSize: "9px" }}
        >
          {opp.type.toUpperCase()}
        </span>
        {opp.deadline && <DeadlineChip deadline={opp.deadline} />}
      </div>

      {/* Divider */}
      <div className="w-px self-stretch bg-white/[0.05] flex-shrink-0" />

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href={`/opportunities/${opp.id}`}
            className="text-sm font-medium text-white hover:text-violet-300 transition-colors leading-tight"
            style={{ letterSpacing: "-0.02em" }}
          >
            {opp.title}
          </Link>
          {opp.isVerified && (
            <span
              className="inline-flex items-center gap-0.5"
              style={{
                fontSize: "9px",
                color: "#60a5fa",
                border: "1px solid rgba(96,165,250,0.20)",
                padding: "1px 4px",
                borderRadius: "2px",
              }}
            >
              <ShieldCheck style={{ width: 9, height: 9 }} /> VERIFIED
            </span>
          )}
        </div>
        <p className="text-[11px] mt-0.5" style={{ color: "var(--text-secondary)" }}>
          {opp.organization}
          {opp.location && <span className="ml-2 inline-flex items-center gap-0.5"><MapPin style={{ width: 9, height: 9 }} />{opp.location}</span>}
          {opp.isRemote && <span className="ml-2 text-emerald-400/70">· Remote</span>}
        </p>
        <p className="text-xs mt-1 line-clamp-1" style={{ color: "rgba(255,255,255,0.30)" }}>
          {opp.description}
        </p>
        {opp.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {opp.tags.slice(0, 5).map(tag => (
              <span
                key={tag}
                style={{
                  fontSize: "10px",
                  color: "rgba(255,255,255,0.28)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  padding: "0px 5px",
                  borderRadius: "2px",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        {opp.deadline && (
          <button
            onClick={onCalendar}
            title="Add to calendar"
            className="p-1 text-white/25 hover:text-white/60 transition-colors"
            style={{ borderRadius: "2px" }}
          >
            <Calendar style={{ width: 13, height: 13 }} />
          </button>
        )}
        <button
          onClick={onSave}
          disabled={saving}
          className={`p-1 transition-colors ${saved ? "text-violet-400 hover:text-violet-300" : "text-white/25 hover:text-white/60"}`}
          style={{ borderRadius: "2px" }}
        >
          {saving ? (
            <Loader2 style={{ width: 13, height: 13 }} className="animate-spin" />
          ) : saved ? (
            <BookmarkCheck style={{ width: 13, height: 13 }} />
          ) : (
            <Bookmark style={{ width: 13, height: 13 }} />
          )}
        </button>
        <Link
          href={`/opportunities/${opp.id}`}
          className="p-1 text-white/25 hover:text-white/60 transition-colors"
          style={{ borderRadius: "2px" }}
        >
          <ExternalLink style={{ width: 13, height: 13 }} />
        </Link>
      </div>
    </div>
  );
}
