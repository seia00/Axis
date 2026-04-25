"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Sparkles, RefreshCw, Loader2, User, Briefcase, BookOpen, X, Check } from "lucide-react";
import { StaggerContainer, StaggerItem } from "@/components/animation";
import { motion } from "framer-motion";

interface Match {
  id: string;
  toUserId: string;
  type: string;
  reason: string;
  score: number;
  status: string;
}

interface MatchWithDetail extends Match {
  detail?: {
    title?: string;
    name?: string;
    organization?: string;
    type?: string;
    image?: string;
  };
}

function ScoreCircle({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dashoffset = circ - (pct / 100) * circ;
  const color = pct >= 80 ? "#10b981" : pct >= 60 ? "#6366f1" : "#f59e0b";

  return (
    <div className="relative w-16 h-16 flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
        <circle
          cx="32" cy="32" r={r}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeDasharray={circ}
          strokeDashoffset={dashoffset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold" style={{ color }}>{pct}%</span>
    </div>
  );
}

export default function MatchPage() {
  const { status } = useSession();
  const router = useRouter();
  const [matches, setMatches] = useState<MatchWithDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"opportunity" | "cofounder" | "program">("opportunity");
  const [profileIncomplete, setProfileIncomplete] = useState(false);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const enrichMatches = useCallback(async (rawMatches: Match[]) => {
    const opportunityIds = rawMatches.filter(m => m.type === "opportunity" || m.type === "program").map(m => m.toUserId);
    const userIds = rawMatches.filter(m => m.type === "cofounder").map(m => m.toUserId);

    const [oppsRes, usersRes] = await Promise.all([
      opportunityIds.length > 0 ? fetch(`/api/opportunities?ids=${opportunityIds.join(",")}`) : Promise.resolve(null),
      userIds.length > 0 ? fetch(`/api/match/users?ids=${userIds.join(",")}`) : Promise.resolve(null),
    ]);

    const oppsMap: Record<string, { title: string; organization: string; type: string }> = {};
    const usersMap: Record<string, { name: string; image?: string }> = {};

    if (oppsRes?.ok) {
      const opps = await oppsRes.json();
      if (Array.isArray(opps)) opps.forEach((o: { id: string; title: string; organization: string; type: string }) => { oppsMap[o.id] = o; });
    }
    if (usersRes?.ok) {
      const users = await usersRes.json();
      if (Array.isArray(users)) users.forEach((u: { id: string; name: string; image?: string }) => { usersMap[u.id] = u; });
    }

    return rawMatches.map(m => ({
      ...m,
      detail: m.type === "cofounder" ? usersMap[m.toUserId] : oppsMap[m.toUserId],
    }));
  }, []);

  const fetchMatches = useCallback(async () => {
    const res = await fetch("/api/match");
    if (res.ok) {
      const data = await res.json();
      const enriched = await enrichMatches(data);
      setMatches(enriched);
      if (data.length === 0) setProfileIncomplete(false);
    }
    setLoading(false);
  }, [enrichMatches]);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin?callbackUrl=/match");
    if (status === "authenticated") fetchMatches();
  }, [status, router, fetchMatches]);

  const handleRefresh = async () => {
    setRefreshing(true);
    const res = await fetch("/api/match", { method: "POST" });
    if (res.status === 400) {
      setProfileIncomplete(true);
    } else if (res.ok) {
      const data = await res.json();
      const enriched = await enrichMatches(data);
      setMatches(enriched);
      setProfileIncomplete(false);
    }
    setRefreshing(false);
  };

  const filteredMatches = matches.filter(m => m.type === activeTab && !dismissed.has(m.id));

  if (status === "loading") return <div className="min-h-screen"><Navbar /><div className="flex items-center justify-center mt-32"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div></div>;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-indigo-400" />
              AXIS Match
            </h1>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">AI-powered matches for opportunities, co-founders, and programs</p>
          </div>
          <Button onClick={handleRefresh} loading={refreshing} variant="secondary" size="sm">
            <RefreshCw className="w-4 h-4" />
            Refresh Matches
          </Button>
        </div>

        {profileIncomplete && (
          <div className="card mb-4 border-amber-800/40 bg-amber-950/20">
            <p className="text-sm text-amber-300">To generate matches, please complete your profile with interests, skills, and goals.</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-lg bg-[var(--surface)] border border-[var(--border)] mb-6 w-fit">
          {[
            { key: "opportunity", label: "Opportunities", icon: Briefcase },
            { key: "cofounder", label: "People", icon: User },
            { key: "program", label: "Programs", icon: BookOpen },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 text-sm rounded-md transition-all ${activeTab === key ? "bg-indigo-600 text-white" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"}`}
            >
              <Icon className="w-4 h-4" />
              {label}
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-white/10">{matches.filter(m => m.type === key && !dismissed.has(m.id)).length}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="card text-center py-16">
            <Sparkles className="w-10 h-10 text-[var(--muted-foreground)] mx-auto mb-3" />
            <p className="text-[var(--muted-foreground)] mb-4">
              {matches.length === 0
                ? "No matches yet. Click \"Refresh Matches\" to generate your personalized matches."
                : `No ${activeTab} matches. Try refreshing.`}
            </p>
            <Button onClick={handleRefresh} loading={refreshing}>
              <Sparkles className="w-4 h-4" /> Generate Matches
            </Button>
          </div>
        ) : (
          <StaggerContainer className="space-y-3">
            {filteredMatches.map(match => (
              <StaggerItem key={match.id}>
              <motion.div
                className="card hover:border-indigo-500/30 transition-all"
                whileHover={{ y: -3, boxShadow: "0 12px 28px rgba(0,0,0,0.25)" }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-start gap-4">
                  <ScoreCircle score={match.score} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-medium">
                          {match.type === "cofounder"
                            ? (match.detail?.name ?? "Student")
                            : (match.detail?.title ?? "Opportunity")}
                        </h3>
                        {match.type !== "cofounder" && match.detail?.organization && (
                          <p className="text-xs text-[var(--muted-foreground)]">{match.detail.organization}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        {match.type !== "cofounder" && (
                          <Link
                            href={`/opportunities/${match.toUserId}`}
                            className="p-1.5 rounded-lg hover:bg-[var(--surface-raised)] text-indigo-400 transition-colors text-xs"
                          >
                            View
                          </Link>
                        )}
                        <button
                          onClick={() => setDismissed(prev => new Set(Array.from(prev).concat(match.id)))}
                          className="p-1.5 rounded-lg hover:bg-[var(--surface-raised)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-[var(--muted-foreground)] mt-2 leading-relaxed">{match.reason}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-950/60 text-indigo-300 capitalize">{match.type}</span>
                      {match.type !== "cofounder" && (
                        <Link href={`/opportunities/${match.toUserId}`}>
                          <Button size="sm" variant="secondary">
                            <Check className="w-3.5 h-3.5" /> Save
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </div>
    </div>
  );
}
