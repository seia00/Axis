"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ShieldCheck, Bookmark, BookmarkCheck, Calendar, MapPin, ExternalLink, Loader2, ArrowLeft } from "lucide-react";
import { formatDistanceToNow, differenceInDays } from "date-fns";

interface OpportunityDetail {
  id: string;
  title: string;
  type: string;
  organization: string;
  description: string;
  eligibility?: string;
  deadline?: string;
  startDate?: string;
  isVerified: boolean;
  isRemote: boolean;
  location?: string;
  url?: string;
  tags: string[];
  regions: string[];
  savedCount: number;
  viewCount: number;
  related: { id: string; title: string; organization: string; type: string }[];
}

export default function OpportunityDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [opp, setOpp] = useState<OpportunityDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin?callbackUrl=/opportunities/" + id);
    if (status === "authenticated") {
      fetch(`/api/opportunities/${id}`).then(r => r.json()).then(data => { setOpp(data); setLoading(false); });
      fetch("/api/saved-opportunities").then(r => r.json()).then(data => {
        setSaved(Array.isArray(data) && data.some((s: { opportunityId: string }) => s.opportunityId === id));
      });
    }
  }, [status, id, router]);

  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/saved-opportunities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ opportunityId: id }),
    });
    setSaved(s => !s);
    setSaving(false);
  };

  const handleCalendar = async () => {
    if (!opp?.deadline) return;
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

  if (loading || status === "loading") {
    return <div className="min-h-screen"><Navbar /><div className="flex items-center justify-center mt-32"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div></div>;
  }
  if (!opp) return <div className="min-h-screen"><Navbar /><p className="text-center mt-20 text-[var(--muted-foreground)]">Opportunity not found</p></div>;

  const days = opp.deadline ? differenceInDays(new Date(opp.deadline), new Date()) : null;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/opportunities" className="inline-flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Opportunities
        </Link>

        <div className="card mb-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-950/60 text-indigo-300 capitalize">{opp.type}</span>
                {opp.isVerified && (
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-950/60 text-blue-300 border border-blue-800/40">
                    <ShieldCheck className="w-3 h-3" /> AXIS Verified
                  </span>
                )}
                {opp.isRemote && <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300">Remote</span>}
              </div>
              <h1 className="text-2xl font-bold mb-1">{opp.title}</h1>
              <p className="text-[var(--muted-foreground)]">{opp.organization}</p>
              {opp.location && (
                <p className="text-sm text-[var(--muted-foreground)] flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5" />{opp.location}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {opp.deadline && (
                <Button variant="secondary" size="sm" onClick={handleCalendar}>
                  <Calendar className="w-4 h-4" /> Add to Calendar
                </Button>
              )}
              <Button variant="secondary" size="sm" onClick={handleSave} loading={saving}>
                {saved ? <BookmarkCheck className="w-4 h-4 text-indigo-400" /> : <Bookmark className="w-4 h-4" />}
                {saved ? "Saved" : "Save"}
              </Button>
              {opp.url && (
                <a href={opp.url} target="_blank" rel="noopener noreferrer" className="btn-primary text-sm px-3 py-1.5 flex items-center gap-1.5">
                  Apply <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>

          {opp.deadline && (
            <div className={`mt-4 p-3 rounded-lg border ${days !== null && days < 0 ? "bg-zinc-900/60 border-zinc-700/40 text-zinc-400" : days !== null && days <= 3 ? "bg-red-950/30 border-red-800/40 text-red-300" : days !== null && days <= 14 ? "bg-orange-950/30 border-orange-800/40 text-orange-300" : "bg-[var(--surface-raised)] border-[var(--border)] text-[var(--muted-foreground)]"}`}>
              <p className="text-sm font-medium">
                {days !== null && days < 0 ? "Applications closed" : `Deadline: ${new Date(opp.deadline).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} (${formatDistanceToNow(new Date(opp.deadline), { addSuffix: true })})`}
              </p>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="card">
              <h2 className="text-sm font-semibold mb-3">About</h2>
              <p className="text-sm text-[var(--muted-foreground)] whitespace-pre-wrap leading-relaxed">{opp.description}</p>
            </div>
            {opp.eligibility && (
              <div className="card">
                <h2 className="text-sm font-semibold mb-3">Eligibility</h2>
                <p className="text-sm text-[var(--muted-foreground)] whitespace-pre-wrap leading-relaxed">{opp.eligibility}</p>
              </div>
            )}
          </div>
          <div className="space-y-4">
            <div className="card">
              <h3 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-3">Details</h3>
              <dl className="space-y-2">
                <div><dt className="text-xs text-[var(--muted-foreground)]">Regions</dt><dd className="text-sm mt-0.5">{opp.regions.join(", ") || "Global"}</dd></div>
                <div><dt className="text-xs text-[var(--muted-foreground)]">Saved by</dt><dd className="text-sm mt-0.5">{opp.savedCount} students</dd></div>
                {opp.tags.length > 0 && (
                  <div>
                    <dt className="text-xs text-[var(--muted-foreground)] mb-1">Tags</dt>
                    <dd className="flex flex-wrap gap-1">
                      {opp.tags.map(t => <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-indigo-950/60 text-indigo-300">{t}</span>)}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
            {opp.related.length > 0 && (
              <div className="card">
                <h3 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-3">Related</h3>
                <div className="space-y-2">
                  {opp.related.map(r => (
                    <Link key={r.id} href={`/opportunities/${r.id}`} className="block hover:text-indigo-300 transition-colors">
                      <p className="text-sm font-medium">{r.title}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">{r.organization} · {r.type}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
