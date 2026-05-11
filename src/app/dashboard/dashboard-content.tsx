"use client";

import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/contexts/language-context";
import { format, differenceInDays } from "date-fns";
import {
  Users, Briefcase, Rocket, TrendingUp, Sparkles,
  Calendar, ShieldCheck, ArrowRight, Clock, MapPin, Building2,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface DashboardUser { name: string | null; image: string | null; school: string | null; isVerified: boolean; }
interface FeaturedOpportunity { id: string; title: string; type: string; organization: string; description: string; deadline: string | null; isVerified: boolean; location: string | null; isRemote: boolean; }
interface UpcomingEvent { id: string; title: string; date: string; type: string; color: string | null; }
interface ActivityCounts { newOpportunities: number; newOrgs: number; }
interface PlatformStats { totalUsers: number; totalOpportunities: number; totalOrgs: number; userMatchCount: number; }

interface DashboardContentProps {
  user: DashboardUser;
  profileCompletionPct: number;
  featuredOpportunity: FeaturedOpportunity | null;
  upcomingEvents: UpcomingEvent[];
  activityCounts: ActivityCounts;
  platformStats: PlatformStats;
  weeklyActivity: number[];
  oppTypeCounts: Array<{ type: string; count: number }>;
}

// ─── Quick access ─────────────────────────────────────────────────────────────
const QUICK_ACCESS = [
  { href: "/launchpad?tab=people",   label: "People",         icon: Users       },
  { href: "/launchpad?tab=orgs",     label: "Organizations",  icon: Building2   },
  { href: "/opportunities",          label: "Opportunities",  icon: Briefcase   },
  { href: "/match",                  label: "AI Match",       icon: Sparkles    },
  { href: "/ventures",               label: "Ventures",       icon: TrendingUp  },
  { href: "/calendar",               label: "Calendar",       icon: Calendar    },
  { href: "/launchpad",              label: "Launchpad",      icon: Rocket      },
] as const;

// ─── Chart: SVG Radial ring ───────────────────────────────────────────────────
function RadialRing({ pct }: { pct: number }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  const filled = c * (pct / 100);
  return (
    <svg width="88" height="88" viewBox="0 0 88 88" className="flex-shrink-0">
      <defs>
        <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(139,92,246,0.9)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.85)" />
        </linearGradient>
      </defs>
      {/* Track */}
      <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
      {/* Fill */}
      <circle
        cx="44" cy="44" r={r}
        fill="none"
        stroke="url(#ring-grad)"
        strokeWidth="7"
        strokeDasharray={`${filled} ${c - filled}`}
        strokeDashoffset={c * 0.25}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.6s ease" }}
      />
      <text x="44" y="48" textAnchor="middle" fontSize="13" fontWeight="600" fill="white"
        fontFamily="var(--font-jetbrains-mono), monospace">
        {pct}%
      </text>
    </svg>
  );
}

// ─── Chart: Weekly activity bars ─────────────────────────────────────────────
const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

function WeeklyBars({ counts }: { counts: number[] }) {
  const max = Math.max(...counts, 1);
  const todayDow = new Date().getDay(); // 0=Sun..6=Sat → map to Mon-first
  const todayIdx = (todayDow + 6) % 7;
  return (
    <div className="flex items-end gap-1.5 h-14 w-full">
      {counts.map((n, i) => {
        const isToday = i === todayIdx;
        const h = Math.max(4, Math.round((n / max) * 48));
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group" title={`${n} added`}>
            <div
              className="w-full rounded-[2px] transition-all duration-500"
              style={{
                height: `${h}px`,
                background: isToday
                  ? "linear-gradient(to top, rgba(139,92,246,0.9), rgba(167,139,250,0.5))"
                  : n > 0
                  ? "linear-gradient(to top, rgba(139,92,246,0.45), rgba(167,139,250,0.2))"
                  : "rgba(255,255,255,0.05)",
                boxShadow: isToday ? "0 0 8px rgba(139,92,246,0.35)" : "none",
              }}
            />
            <span className={`text-[9px] font-mono ${isToday ? "text-violet-300" : "text-white/25"}`}>
              {DAY_LABELS[i]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Chart: Opportunity type donut ───────────────────────────────────────────
const TYPE_COLORS: Record<string, string> = {
  competition: "rgba(139,92,246,0.85)",
  fellowship:  "rgba(99,179,237,0.85)",
  program:     "rgba(72,187,120,0.85)",
  scholarship: "rgba(246,173,85,0.85)",
  internship:  "rgba(237,100,166,0.85)",
};
const FALLBACK_COLORS = ["rgba(139,92,246,0.85)", "rgba(99,179,237,0.85)", "rgba(72,187,120,0.85)", "rgba(246,173,85,0.85)"];

function DonutChart({ slices }: { slices: Array<{ type: string; count: number }> }) {
  const total = slices.reduce((s, x) => s + x.count, 0);
  if (total === 0) return null;
  const r = 26; const cx = 36; const cy = 36;
  const circ = 2 * Math.PI * r;
  let offsetPct = 0;

  return (
    <svg width="72" height="72" viewBox="0 0 72 72" className="flex-shrink-0">
      <defs>
        <filter id="donut-shadow"><feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.3" /></filter>
      </defs>
      {/* Background ring */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
      {slices.map((s, i) => {
        const pct = s.count / total;
        const dashLen = pct * circ;
        const dashOffset = circ * 0.25 - offsetPct * circ;
        const color = TYPE_COLORS[s.type] ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length];
        offsetPct += pct;
        return (
          <circle key={s.type}
            cx={cx} cy={cy} r={r}
            fill="none" stroke={color} strokeWidth="10"
            strokeDasharray={`${dashLen} ${circ - dashLen}`}
            strokeDashoffset={dashOffset}
            filter="url(#donut-shadow)"
          />
        );
      })}
    </svg>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function DashboardContent({
  user, profileCompletionPct, featuredOpportunity,
  upcomingEvents, activityCounts, platformStats, weeklyActivity, oppTypeCounts,
}: DashboardContentProps) {
  const { t, lang } = useLanguage();
  const greeting = lang === "ja" ? "おかえりなさい" : "Welcome back";
  const firstName = user.name?.split(" ")[0] ?? (lang === "ja" ? "あなた" : "there");
  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
  const timeLabel = lang === "ja"
    ? (hour < 12 ? "おはようございます" : hour < 17 ? "こんにちは" : "こんばんは")
    : `Good ${timeOfDay}`;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">

      {/* ── Welcome header ──────────────────────────────────────────────── */}
      <header className="flex items-center gap-4">
        <div className="relative w-14 h-14 rounded-full overflow-hidden ring-2 ring-violet-500/20 flex-shrink-0 bg-white/5">
          {user.image ? (
            <Image src={user.image} alt={user.name ?? "Profile"} fill sizes="56px" className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/50 text-xl font-semibold">
              {firstName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
              {greeting}, {firstName}.
            </h1>
            {user.isVerified && (
              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/20">
                <ShieldCheck className="w-3 h-3" /> Verified
              </span>
            )}
          </div>
          <p className="text-sm text-white/40 mt-0.5">
            {timeLabel}{user.school ? ` · ${user.school}` : ""}
          </p>
        </div>
        {/* AXIS wordmark accent */}
        <div className="hidden sm:flex flex-col items-end gap-0.5 flex-shrink-0 opacity-30">
          <span className="text-[10px] font-mono tracking-[0.3em] text-white/60 uppercase">AXIS</span>
          <div className="h-px w-10 bg-gradient-to-r from-violet-400 to-transparent" />
        </div>
      </header>

      {/* ── Platform stats strip ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {[
          { label: "Community",     value: platformStats.totalUsers.toLocaleString(),        icon: Users,     color: "text-violet-300",  bg: "bg-violet-500/10" },
          { label: "Opportunities", value: platformStats.totalOpportunities.toLocaleString(), icon: Briefcase, color: "text-blue-300",    bg: "bg-blue-500/10"   },
          { label: "Organizations", value: platformStats.totalOrgs.toLocaleString(),          icon: Building2, color: "text-emerald-300", bg: "bg-emerald-500/10"},
          { label: "Your Matches",  value: platformStats.userMatchCount.toLocaleString(),     icon: Sparkles,  color: "text-amber-300",   bg: "bg-amber-500/10"  },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-semibold text-white leading-none" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>
                {value}
              </p>
              <p className="text-[10px] text-white/40 mt-0.5 truncate">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Profile + charts row ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

        {/* Profile completion ring */}
        {profileCompletionPct < 100 ? (
          <div className="card flex items-center gap-4">
            <RadialRing pct={profileCompletionPct} />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white leading-tight">
                {t("dashboard.profile.heading")}
              </p>
              <p className="text-xs text-white/45 mt-1 leading-relaxed">
                {t("dashboard.profile.sub")}
              </p>
              <Link href="/settings"
                className="inline-flex items-center gap-1 mt-2 text-xs text-violet-300 hover:text-violet-200 transition-colors">
                {t("dashboard.profile.cta")} <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="card flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Profile complete</p>
              <p className="text-xs text-white/40 mt-0.5">You're fully visible to the community</p>
            </div>
          </div>
        )}

        {/* Weekly activity bar chart */}
        <div className="card flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-white/35">
              Opps · 7 days
            </p>
            <span className="text-xs font-mono text-violet-300">
              +{activityCounts.newOpportunities} this week
            </span>
          </div>
          <WeeklyBars counts={weeklyActivity} />
        </div>

        {/* Opportunity type breakdown */}
        <div className="card flex items-center gap-4">
          <DonutChart slices={oppTypeCounts} />
          <div className="min-w-0 flex-1 space-y-1.5">
            <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-white/35 mb-2">
              By type
            </p>
            {oppTypeCounts.slice(0, 4).map((s, i) => (
              <div key={s.type} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: TYPE_COLORS[s.type] ?? FALLBACK_COLORS[i] }} />
                  <span className="text-xs text-white/60 truncate capitalize">{s.type}</span>
                </div>
                <span className="text-xs font-mono text-white/50 flex-shrink-0">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Featured opp + upcoming events ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">

        {/* Featured opportunity — rotates daily */}
        <div className="card flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-white/35">
              {t("dashboard.featured")}
            </span>
            <Link href="/opportunities"
              className="text-[10px] text-white/35 hover:text-white/65 transition-colors uppercase tracking-wider font-mono">
              {t("dashboard.viewall")} →
            </Link>
          </div>

          {featuredOpportunity ? (
            <div className="flex-1 flex flex-col">
              <div className="flex items-start gap-2 mb-3 flex-wrap">
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm bg-violet-500/15 text-violet-300 border border-violet-500/20">
                  {featuredOpportunity.type}
                </span>
                {featuredOpportunity.isVerified && (
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm bg-blue-500/15 text-blue-300 border border-blue-500/20 inline-flex items-center gap-1">
                    <ShieldCheck className="w-2.5 h-2.5" /> Verified
                  </span>
                )}
                {featuredOpportunity.deadline && (
                  <DeadlinePill iso={featuredOpportunity.deadline} t={t} />
                )}
              </div>

              <Link href={`/opportunities/${featuredOpportunity.id}`} className="block group flex-1">
                <h3 className="text-base sm:text-lg font-semibold text-white group-hover:text-violet-200 transition-colors leading-snug mb-1">
                  {featuredOpportunity.title}
                </h3>
                <p className="text-xs text-white/45 mb-2">{featuredOpportunity.organization}</p>
                <p className="text-sm text-white/60 leading-relaxed line-clamp-3">
                  {featuredOpportunity.description}
                </p>
              </Link>

              <div className="mt-3 pt-3 border-t border-white/[0.05] flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-white/40">
                  {featuredOpportunity.isRemote && (
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80" />
                      Remote
                    </span>
                  )}
                  {featuredOpportunity.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {featuredOpportunity.location}
                    </span>
                  )}
                </div>
                <Link href={`/opportunities/${featuredOpportunity.id}`}
                  className="text-xs font-medium text-violet-300 hover:text-violet-200 flex items-center gap-1">
                  Open <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ) : (
            <p className="text-sm text-white/35 italic">{t("dashboard.featured.empty")}</p>
          )}
        </div>

        {/* Upcoming events */}
        <div className="card flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-white/35">
              {t("dashboard.upcoming")}
            </span>
            <Link href="/calendar"
              className="text-[10px] text-white/35 hover:text-white/65 transition-colors uppercase tracking-wider font-mono">
              Calendar →
            </Link>
          </div>

          {upcomingEvents.length > 0 ? (
            <ul className="space-y-3 flex-1">
              {upcomingEvents.map((event) => {
                const dt = new Date(event.date);
                const days = differenceInDays(dt, new Date());
                return (
                  <li key={event.id} className="flex items-start gap-3 group">
                    <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                      style={{ background: event.color ?? "rgb(139,92,246)" }} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white/85 truncate group-hover:text-white transition-colors">
                        {event.title}
                      </p>
                      <p className="text-xs text-white/40 mt-0.5 flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        {format(dt, "MMM d")} ·{" "}
                        {days === 0 ? "Today" : days === 1 ? "Tomorrow" : `${days}d`}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 py-6">
              <Calendar className="w-8 h-8 text-white/15" />
              <p className="text-sm text-white/35 italic">{t("dashboard.upcoming.empty")}</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Activity + quick access ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

        {/* Activity feed */}
        <div className="card space-y-3">
          <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-white/35">
            {t("dashboard.activity")}
          </p>
          <div className="space-y-2.5 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-white/60 text-xs">New opportunities</span>
              <span className="font-mono text-violet-300 text-sm font-semibold">
                +{activityCounts.newOpportunities}
              </span>
            </div>
            <div className="h-px bg-white/[0.04]" />
            <div className="flex items-center justify-between">
              <span className="text-white/60 text-xs">New orgs joined</span>
              <span className="font-mono text-emerald-300 text-sm font-semibold">
                +{activityCounts.newOrgs}
              </span>
            </div>
            <div className="h-px bg-white/[0.04]" />
            <p className="text-[11px] text-white/25 italic">{t("dashboard.activity.soon")}</p>
          </div>
        </div>

        {/* Quick access — 2-col mini grid, spans 2 cols */}
        <div className="sm:col-span-2">
          <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-white/35 mb-2 px-1">
            {t("dashboard.quickaccess")}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {QUICK_ACCESS.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}
                className="card group flex items-center gap-2.5 px-3 py-2.5 hover:!border-violet-400/25 transition-all">
                <Icon className="w-3.5 h-3.5 text-violet-300/70 group-hover:text-violet-300 flex-shrink-0 transition-colors" />
                <span className="text-xs font-medium text-white/70 group-hover:text-white transition-colors truncate">
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function DeadlinePill({ iso, t }: { iso: string; t: (k: string) => string }) {
  const days = differenceInDays(new Date(iso), new Date());
  if (days < 0) return (
    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm bg-zinc-700/40 text-zinc-400 border border-zinc-600/25">
      Closed
    </span>
  );
  return (
    <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm border ${
      days <= 7 ? "bg-red-500/10 text-red-300 border-red-500/20" : "bg-white/[0.04] text-white/45 border-white/[0.08]"
    }`}>
      {days === 0 ? "Today" : `${days}d left`}
    </span>
  );
}
