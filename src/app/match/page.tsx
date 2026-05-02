"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Zap, RefreshCw, Loader2, User, Briefcase, BookOpen, X, ArrowRight } from "lucide-react";
import { StaggerContainer, StaggerItem } from "@/components/animation";

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

// ── Score bar — horizontal data bar instead of decorative circle ─────────────
function ScoreBar({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  // Purple for high, dimmer for low — purple is the data color
  const barColor = pct >= 80
    ? "#8b5cf6"   // violet-500
    : pct >= 60
      ? "#6d28d9" // violet-700
      : "#4c1d95"; // violet-900

  return (
    <div className="flex-shrink-0 w-14 flex flex-col items-center gap-1.5 pt-0.5">
      <span
        className="mono text-lg font-bold leading-none"
        style={{ color: barColor, letterSpacing: "-0.02em" }}
      >
        {pct}
      </span>
      <span className="data-label" style={{ fontSize: "8px" }}>SCORE</span>
      <div className="w-full h-px bg-white/[0.08]">
        <div
          className="h-full score-bar"
          style={{ width: `${pct}%`, background: barColor }}
        />
      </div>
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

  if (status === "loading") return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-4 h-4 animate-spin text-violet-500" />
    </div>
  );

  const tabs = [
    { key: "opportunity", label: "Opportunities", icon: Briefcase },
    { key: "cofounder",   label: "People",        icon: User      },
    { key: "program",     label: "Programs",       icon: BookOpen  },
  ];

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap className="text-violet-500" style={{ width: 14, height: 14 }} />
              <span className="data-label tracking-widest">AXIS MATCH</span>
            </div>
            <h1 className="text-2xl font-bold text-white" style={{ letterSpacing: "-0.04em" }}>
              Intelligence Layer
            </h1>
            <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
              AI-ranked matches across opportunities, co-founders, and programs
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white/45 hover:text-white/75 border border-white/[0.08] hover:border-violet-500/30 transition-all disabled:opacity-40"
            style={{ borderRadius: "3px" }}
          >
            <RefreshCw className={`w-3 h-3 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Scanning..." : "Refresh"}
          </button>
        </div>

        {profileIncomplete && (
          <div
            className="mb-4 px-4 py-3 text-xs"
            style={{
              border: "1px solid rgba(245,158,11,0.25)",
              background: "rgba(120,53,15,0.12)",
              borderRadius: "3px",
              color: "#fbbf24",
            }}
          >
            <span className="data-label mr-2">ACTION REQUIRED</span>
            Complete your profile with interests, skills, and goals to generate matches.
          </div>
        )}

        {/* ── Tab bar — IDE-style ────────────────────────────────────────── */}
        <div
          className="flex mb-6"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
        >
          {tabs.map(({ key, label, icon: Icon }) => {
            const active = activeTab === key;
            const count = matches.filter(m => m.type === key && !dismissed.has(m.id)).length;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key as typeof activeTab)}
                className="relative flex items-center gap-1.5 px-4 py-2 text-xs font-medium transition-colors"
                style={{
                  color: active ? "#ffffff" : "rgba(255,255,255,0.35)",
                  borderBottom: active ? "1px solid #8b5cf6" : "1px solid transparent",
                  marginBottom: "-1px",
                }}
              >
                <Icon style={{ width: 12, height: 12 }} />
                {label}
                {count > 0 && (
                  <span
                    className="mono text-[10px] px-1 leading-tight"
                    style={{
                      background: active ? "rgba(139,92,246,0.20)" : "rgba(255,255,255,0.06)",
                      color: active ? "#a78bfa" : "rgba(255,255,255,0.30)",
                      borderRadius: "2px",
                    }}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Match list ────────────────────────────────────────────────── */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-4 h-4 animate-spin text-violet-500" />
          </div>
        ) : filteredMatches.length === 0 ? (
          <div
            className="text-center py-16"
            style={{ border: "1px solid rgba(255,255,255,0.07)", borderRadius: "4px" }}
          >
            <div
              className="inline-flex items-center justify-center w-10 h-10 mb-4"
              style={{ border: "1px solid rgba(139,92,246,0.20)", borderRadius: "4px", background: "rgba(139,92,246,0.05)" }}
            >
              <Zap className="w-4 h-4 text-violet-500" />
            </div>
            <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
              {matches.length === 0
                ? "No matches yet — run the intelligence scan."
                : `No ${activeTab} matches. Try refreshing.`}
            </p>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-violet-600 hover:bg-violet-500 text-white transition-colors disabled:opacity-40"
              style={{ borderRadius: "3px" }}
            >
              <Zap className="w-3 h-3" />
              {refreshing ? "Scanning..." : "Generate Matches"}
            </button>
          </div>
        ) : (
          <StaggerContainer className="space-y-px">
            {filteredMatches.map(match => (
              <StaggerItem key={match.id}>
                <div
                  className="group flex items-start gap-4 px-4 py-3 transition-all duration-150"
                  style={{
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: "4px",
                    background: "var(--surface)",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(139,92,246,0.25)";
                    (e.currentTarget as HTMLElement).style.background = "rgba(139,92,246,0.04)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)";
                    (e.currentTarget as HTMLElement).style.background = "var(--surface)";
                  }}
                >
                  {/* Score */}
                  <ScoreBar score={match.score} />

                  {/* Divider */}
                  <div className="w-px self-stretch bg-white/[0.05] flex-shrink-0" />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-white truncate" style={{ letterSpacing: "-0.02em" }}>
                          {match.type === "cofounder"
                            ? (match.detail?.name ?? "Student")
                            : (match.detail?.title ?? "Opportunity")}
                        </h3>
                        {match.type !== "cofounder" && match.detail?.organization && (
                          <p className="text-[11px] mt-0.5" style={{ color: "var(--text-secondary)" }}>
                            {match.detail.organization}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {match.type !== "cofounder" && (
                          <Link
                            href={`/opportunities/${match.toUserId}`}
                            className="flex items-center gap-1 px-2 py-1 text-[11px] text-violet-400 hover:text-violet-300 transition-colors"
                            style={{ border: "1px solid rgba(139,92,246,0.20)", borderRadius: "2px" }}
                          >
                            View <ArrowRight style={{ width: 10, height: 10 }} />
                          </Link>
                        )}
                        <button
                          onClick={() => setDismissed(prev => new Set(Array.from(prev).concat(match.id)))}
                          className="p-1 text-white/20 hover:text-white/50 transition-colors"
                          style={{ borderRadius: "2px" }}
                        >
                          <X style={{ width: 12, height: 12 }} />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs mt-1.5 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                      {match.reason}
                    </p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <span
                        className="data-label px-1.5 py-0.5"
                        style={{
                          background: "rgba(139,92,246,0.10)",
                          border: "1px solid rgba(139,92,246,0.20)",
                          color: "#a78bfa",
                          borderRadius: "2px",
                          fontSize: "9px",
                        }}
                      >
                        {match.type.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </div>
    </div>
  );
}
