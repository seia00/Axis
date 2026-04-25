"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Reveal, StaggerContainer, StaggerItem } from "@/components/animation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Search, Filter, ShieldCheck, Bookmark, BookmarkCheck, Calendar,
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
    if (status === "authenticated") {
      fetchOpportunities();
      fetchSaved();
    }
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
        color: "#ef4444",
        opportunityId: opp.id,
        description: `Deadline for ${opp.organization}`,
      }),
    });
    alert("Added to calendar!");
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
      alert("Submitted for review! An admin will review it shortly.");
    }
    setSubmitting(false);
  };

  const savedIds = new Set(saved.map(s => s.opportunityId));

  const deadlineBadge = (deadline?: string) => {
    if (!deadline) return null;
    const days = differenceInDays(new Date(deadline), new Date());
    if (days < 0) return <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">Closed</span>;
    if (days <= 3) return <span className="text-xs px-2 py-0.5 rounded-full bg-red-950/60 text-red-400 border border-red-800/40">{days}d left</span>;
    if (days <= 14) return <span className="text-xs px-2 py-0.5 rounded-full bg-orange-950/60 text-orange-400 border border-orange-800/40">{days}d left</span>;
    return <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--surface-raised)] text-[var(--muted-foreground)]">{formatDistanceToNow(new Date(deadline), { addSuffix: true })}</span>;
  };

  if (status === "loading") {
    return <div className="min-h-screen"><Navbar /><div className="flex items-center justify-center mt-32"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div></div>;
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <Reveal>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Opportunities</h1>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">Competitions, fellowships, programs, and scholarships for student founders</p>
            </div>
          </Reveal>
          <Button size="sm" variant="secondary" onClick={() => setShowSubmitForm(true)}>
            <Plus className="w-4 h-4" />
            Submit Opportunity
          </Button>
        </div>

        <div className="flex gap-6">
          {/* Filter Sidebar */}
          <aside className="w-52 flex-shrink-0 space-y-5">
            <div>
              <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">Type</p>
              <div className="space-y-1">
                <button
                  onClick={() => setFilterType("")}
                  className={`w-full text-left text-sm px-2 py-1.5 rounded-lg transition-colors ${!filterType ? "bg-indigo-600/10 text-indigo-400" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-raised)]"}`}
                >
                  All Types
                </button>
                {TYPES.map(t => (
                  <button
                    key={t}
                    onClick={() => setFilterType(t === filterType ? "" : t)}
                    className={`w-full text-left text-sm px-2 py-1.5 rounded-lg transition-colors capitalize ${filterType === t ? "bg-indigo-600/10 text-indigo-400" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-raised)]"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">Region</p>
              <div className="space-y-1">
                <button
                  onClick={() => setFilterRegion("")}
                  className={`w-full text-left text-sm px-2 py-1.5 rounded-lg transition-colors ${!filterRegion ? "bg-indigo-600/10 text-indigo-400" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-raised)]"}`}
                >
                  All Regions
                </button>
                {REGIONS.map(r => (
                  <button
                    key={r}
                    onClick={() => setFilterRegion(r === filterRegion ? "" : r)}
                    className={`w-full text-left text-sm px-2 py-1.5 rounded-lg transition-colors ${filterRegion === r ? "bg-indigo-600/10 text-indigo-400" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-raised)]"}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="verifiedOnly"
                checked={verifiedOnly}
                onChange={e => setVerifiedOnly(e.target.checked)}
                className="w-4 h-4 accent-indigo-500"
              />
              <label htmlFor="verifiedOnly" className="text-sm text-[var(--foreground)] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> Verified only
              </label>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
              <input
                className="input pl-9"
                placeholder="Search opportunities..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
              </div>
            ) : opportunities.length === 0 ? (
              <div className="card text-center py-12">
                <Filter className="w-10 h-10 text-[var(--muted-foreground)] mx-auto mb-3" />
                <p className="text-[var(--muted-foreground)]">No opportunities found. Try adjusting your filters.</p>
              </div>
            ) : (
              <StaggerContainer className="space-y-3">
                {opportunities.map(opp => (
                  <StaggerItem key={opp.id}>
                  <motion.div
                    className="card hover:border-indigo-500/30 transition-all"
                    whileHover={{ y: -3, boxShadow: "0 12px 28px rgba(0,0,0,0.25)" }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <Link href={`/opportunities/${opp.id}`} className="font-medium hover:text-indigo-300 transition-colors">
                            {opp.title}
                          </Link>
                          {opp.isVerified && (
                            <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full bg-blue-950/60 text-blue-300 border border-blue-800/40">
                              <ShieldCheck className="w-3 h-3" /> AXIS Verified
                            </span>
                          )}
                          <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-950/60 text-indigo-300 capitalize">{opp.type}</span>
                          {opp.deadline && deadlineBadge(opp.deadline)}
                        </div>
                        <p className="text-xs text-[var(--muted-foreground)]">{opp.organization}</p>
                        <p className="text-sm text-[var(--muted-foreground)] mt-1.5 line-clamp-2">{opp.description}</p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {opp.isRemote && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300">Remote</span>
                          )}
                          {opp.location && (
                            <span className="text-xs flex items-center gap-1 text-[var(--muted-foreground)]">
                              <MapPin className="w-3 h-3" />{opp.location}
                            </span>
                          )}
                          {opp.tags.slice(0, 4).map(t => (
                            <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-[var(--surface-raised)] text-[var(--muted-foreground)]">{t}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {opp.deadline && (
                          <button
                            onClick={() => handleAddToCalendar(opp)}
                            title="Add to calendar"
                            className="p-1.5 rounded-lg hover:bg-[var(--surface-raised)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                          >
                            <Calendar className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleSave(opp.id)}
                          disabled={savingId === opp.id}
                          className={`p-1.5 rounded-lg transition-colors ${savedIds.has(opp.id) ? "text-indigo-400 hover:text-indigo-300" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"} hover:bg-[var(--surface-raised)]`}
                        >
                          {savingId === opp.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : savedIds.has(opp.id) ? (
                            <BookmarkCheck className="w-4 h-4" />
                          ) : (
                            <Bookmark className="w-4 h-4" />
                          )}
                        </button>
                        <Link
                          href={`/opportunities/${opp.id}`}
                          className="p-1.5 rounded-lg hover:bg-[var(--surface-raised)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            )}
          </div>
        </div>
      </div>

      {/* Submit Form Modal */}
      {showSubmitForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSubmitForm(false)} />
          <div className="relative bg-[var(--surface-raised)] rounded-xl border border-[var(--border)] w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">Submit an Opportunity</h2>
              <button onClick={() => setShowSubmitForm(false)}><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3">
              <input className="input" placeholder="Title *" value={submitForm.title} onChange={e => setSubmitForm(f => ({ ...f, title: e.target.value }))} />
              <input className="input" placeholder="Organization *" value={submitForm.organization} onChange={e => setSubmitForm(f => ({ ...f, organization: e.target.value }))} />
              <select className="input" value={submitForm.type} onChange={e => setSubmitForm(f => ({ ...f, type: e.target.value }))}>
                {TYPES.map(t => <option key={t} value={t} style={{ background: "var(--surface-raised)" }}>{t}</option>)}
              </select>
              <textarea className="input min-h-[80px]" placeholder="Description *" value={submitForm.description} onChange={e => setSubmitForm(f => ({ ...f, description: e.target.value }))} />
              <input className="input" placeholder="URL" value={submitForm.url} onChange={e => setSubmitForm(f => ({ ...f, url: e.target.value }))} />
              <div>
                <label className="text-xs text-[var(--muted-foreground)] block mb-1">Deadline</label>
                <input className="input" type="date" value={submitForm.deadline} onChange={e => setSubmitForm(f => ({ ...f, deadline: e.target.value }))} />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-[var(--border)]">
              <Button variant="secondary" onClick={() => setShowSubmitForm(false)}>Cancel</Button>
              <Button onClick={handleSubmit} loading={submitting} disabled={!submitForm.title || !submitForm.organization || !submitForm.description}>
                Submit for Review
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
