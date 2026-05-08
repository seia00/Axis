"use client";

import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/contexts/language-context";
import { format, differenceInDays } from "date-fns";
import {
  LayoutGrid,
  Users,
  Briefcase,
  Rocket,
  TrendingUp,
  Sparkles,
  Calendar,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Clock,
  MapPin,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DashboardUser {
  name: string | null;
  image: string | null;
  school: string | null;
  isVerified: boolean;
}

interface FeaturedOpportunity {
  id: string;
  title: string;
  type: string;
  organization: string;
  description: string;
  deadline: string | null;
  isVerified: boolean;
  location: string | null;
  isRemote: boolean;
}

interface UpcomingEvent {
  id: string;
  title: string;
  date: string;
  type: string;
  color: string | null;
}

interface ActivityCounts {
  newOpportunities: number;
  newOrgs: number;
}

interface DashboardContentProps {
  user: DashboardUser;
  profileCompletionPct: number;
  featuredOpportunity: FeaturedOpportunity | null;
  upcomingEvents: UpcomingEvent[];
  activityCounts: ActivityCounts;
}

// ─── Quick access nav items ──────────────────────────────────────────────────

const QUICK_ACCESS = [
  { href: "/directory",     labelKey: "nav.directory",     icon: LayoutGrid },
  { href: "/network",       labelKey: "nav.network",       icon: Users      },
  { href: "/opportunities", labelKey: "nav.opportunities", icon: Briefcase  },
  { href: "/match",         labelKey: "nav.match",         icon: Sparkles   },
  { href: "/launchpad",     labelKey: "nav.launchpad",     icon: Rocket     },
  { href: "/ventures",      labelKey: "nav.ventures",      icon: TrendingUp },
  { href: "/calendar",      labelKey: "nav.calendar",      icon: Calendar   },
] as const;

// ─── Component ────────────────────────────────────────────────────────────────

export function DashboardContent({
  user,
  profileCompletionPct,
  featuredOpportunity,
  upcomingEvents,
  activityCounts,
}: DashboardContentProps) {
  const { t, lang } = useLanguage();
  const greeting = lang === "ja" ? "おかえりなさい" : "Welcome back";
  const firstName = user.name?.split(" ")[0] ?? (lang === "ja" ? "あなた" : "there");

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
      {/* ── Welcome header ─────────────────────────────────────────────── */}
      <header className="flex items-center gap-4">
        <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden ring-1 ring-white/10 flex-shrink-0 bg-white/5">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name ?? "Profile"}
              fill
              sizes="56px"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/40 text-lg">
              {firstName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
            {greeting}, {firstName}.
          </h1>
          <p className="text-sm text-white/50 mt-0.5 flex items-center gap-2">
            {user.school && <span>{user.school}</span>}
            {user.isVerified && (
              <span className="inline-flex items-center gap-1 text-violet-300">
                <ShieldCheck className="w-3.5 h-3.5" />
                {t("dashboard.verified")}
              </span>
            )}
          </p>
        </div>
      </header>

      {/* ── Profile completion bar (hidden if 100%) ───────────────────── */}
      {profileCompletionPct < 100 && (
        <section className="card">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-sm font-semibold text-white">
                {t("dashboard.profile.heading")}
              </h2>
              <p className="text-xs text-white/55 mt-0.5">
                {t("dashboard.profile.sub")}
              </p>
            </div>
            <span
              className="text-base font-semibold"
              style={{
                fontFamily: "var(--font-jetbrains-mono), monospace",
                color: profileCompletionPct >= 70 ? "rgb(167, 139, 250)" : "rgba(255,255,255,0.85)",
              }}
            >
              {profileCompletionPct}%
            </span>
          </div>
          <div className="relative h-1 rounded-full bg-white/[0.06] overflow-hidden mb-3">
            <div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{
                width: `${profileCompletionPct}%`,
                background: "linear-gradient(90deg, rgba(167,139,250,0.85), rgba(255,255,255,0.95))",
                transition: "width 0.4s ease",
              }}
            />
          </div>
          <Link
            href="/settings"
            className="inline-flex items-center gap-1 text-xs text-violet-300 hover:text-violet-200 transition-colors"
          >
            {t("dashboard.profile.cta")}
            <ArrowRight className="w-3 h-3" />
          </Link>
        </section>
      )}

      {/* ── Quick access grid ──────────────────────────────────────────── */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-white/40 mb-3 px-1"
          style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>
          {t("dashboard.quickaccess")}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
          {QUICK_ACCESS.map(({ href, labelKey, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="card group flex items-center gap-3 px-4 py-3.5 hover:!border-violet-400/30 transition-all"
            >
              <Icon className="w-4 h-4 text-violet-300/80 group-hover:text-violet-300 transition-colors flex-shrink-0" />
              <span className="text-sm font-medium text-white/85 group-hover:text-white transition-colors truncate">
                {t(labelKey)}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Two-column row: featured opp + upcoming events ────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Featured opportunity */}
        <div className="card flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-white/40"
              style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>
              {t("dashboard.featured")}
            </h2>
            {featuredOpportunity && (
              <Link
                href="/opportunities"
                className="text-[10px] text-white/40 hover:text-white/70 transition-colors uppercase tracking-wider"
              >
                {t("dashboard.viewall")} →
              </Link>
            )}
          </div>

          {featuredOpportunity ? (
            <div className="flex-1 flex flex-col">
              <div className="flex items-start gap-2 mb-2 flex-wrap">
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm bg-violet-500/15 text-violet-300 border border-violet-500/25">
                  {featuredOpportunity.type}
                </span>
                {featuredOpportunity.isVerified && (
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm bg-blue-500/15 text-blue-300 border border-blue-500/25 inline-flex items-center gap-1">
                    <ShieldCheck className="w-2.5 h-2.5" />
                    {t("dashboard.verified.short")}
                  </span>
                )}
                {featuredOpportunity.deadline && (
                  <DeadlinePill iso={featuredOpportunity.deadline} t={t} />
                )}
              </div>

              <Link href={`/opportunities/${featuredOpportunity.id}`} className="block group">
                <h3 className="text-base sm:text-lg font-semibold text-white mb-1 group-hover:text-violet-200 transition-colors leading-snug">
                  {featuredOpportunity.title}
                </h3>
                <p className="text-xs text-white/50 mb-2">{featuredOpportunity.organization}</p>
                <p className="text-sm text-white/65 leading-relaxed line-clamp-3">
                  {featuredOpportunity.description}
                </p>
              </Link>

              <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-white/45">
                  {featuredOpportunity.isRemote && (
                    <span className="inline-flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {t("dashboard.remote")}
                    </span>
                  )}
                  {featuredOpportunity.location && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {featuredOpportunity.location}
                    </span>
                  )}
                </div>
                <Link
                  href={`/opportunities/${featuredOpportunity.id}`}
                  className="text-xs font-medium text-violet-300 hover:text-violet-200 inline-flex items-center gap-1"
                >
                  {t("dashboard.open")} <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ) : (
            <p className="text-sm text-white/40 italic">{t("dashboard.featured.empty")}</p>
          )}
        </div>

        {/* Upcoming events */}
        <div className="card flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-white/40"
              style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>
              {t("dashboard.upcoming")}
            </h2>
            <Link
              href="/calendar"
              className="text-[10px] text-white/40 hover:text-white/70 transition-colors uppercase tracking-wider"
            >
              {t("dashboard.calendar")} →
            </Link>
          </div>

          {upcomingEvents.length > 0 ? (
            <ul className="space-y-2.5 flex-1">
              {upcomingEvents.map((event) => {
                const dt = new Date(event.date);
                const days = differenceInDays(dt, new Date());
                return (
                  <li key={event.id} className="flex items-start gap-3 group">
                    <span
                      className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                      style={{ background: event.color ?? "rgb(167,139,250)" }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white/90 truncate group-hover:text-white transition-colors">
                        {event.title}
                      </p>
                      <p className="text-xs text-white/45 mt-0.5 inline-flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        {format(dt, "MMM d")} ·{" "}
                        {days === 0
                          ? t("dashboard.today")
                          : days === 1
                          ? t("dashboard.tomorrow")
                          : `${days} ${t("dashboard.days")}`}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-white/40 italic">{t("dashboard.upcoming.empty")}</p>
          )}
        </div>
      </section>

      {/* ── Activity feed ──────────────────────────────────────────────── */}
      <section className="card">
        <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-white/40 mb-3"
          style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>
          {t("dashboard.activity")}
        </h2>
        <ul className="space-y-2.5 text-sm text-white/75">
          <li className="flex items-center gap-2.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-violet-300/70 flex-shrink-0" />
            <span>
              <span className="font-semibold text-white">{activityCounts.newOpportunities}</span>{" "}
              {t("dashboard.activity.opps")}
            </span>
          </li>
          <li className="flex items-center gap-2.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-violet-300/70 flex-shrink-0" />
            <span>
              <span className="font-semibold text-white">{activityCounts.newOrgs}</span>{" "}
              {t("dashboard.activity.orgs")}
            </span>
          </li>
          <li className="flex items-center gap-2.5 text-white/40">
            <Clock className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="italic">{t("dashboard.activity.soon")}</span>
          </li>
        </ul>
      </section>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function DeadlinePill({ iso, t }: { iso: string; t: (k: string) => string }) {
  const days = differenceInDays(new Date(iso), new Date());
  if (days < 0) {
    return (
      <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm bg-zinc-700/40 text-zinc-300 border border-zinc-600/30">
        {t("dashboard.closed")}
      </span>
    );
  }
  const isUrgent = days <= 7;
  return (
    <span
      className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm border ${
        isUrgent
          ? "bg-red-500/10 text-red-300 border-red-500/25"
          : "bg-white/5 text-white/55 border-white/10"
      }`}
    >
      {days === 0 ? t("dashboard.today") : `${days}d ${t("dashboard.left")}`}
    </span>
  );
}
