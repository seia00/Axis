"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, Sparkles, Rocket, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface PremiumBannerProps {
  variant: "membership" | "accelerator";
  className?: string;
}

const DISMISS_KEY_PREFIX = "axis-banner-dismissed-";

const MEMBERSHIP_TIERS = [
  { name: "Basic",       price: "¥399",    color: "text-sky-400",    bg: "bg-sky-950/30 border-sky-500/20" },
  { name: "Enthusiast",  price: "¥1,000",  color: "text-violet-400", bg: "bg-violet-950/30 border-violet-500/20" },
  { name: "Max",         price: "¥5,000",  color: "text-amber-400",  bg: "bg-amber-950/30 border-amber-500/20" },
];

const ACCELERATOR_TIERS = [
  { name: "Tier 1",  price: "¥10,000", color: "text-emerald-400", bg: "bg-emerald-950/30 border-emerald-500/20" },
  { name: "Tier 2",  price: "¥20,000", color: "text-violet-400",  bg: "bg-violet-950/30 border-violet-500/20" },
  { name: "Tier 3",  price: "¥50,000", color: "text-amber-400",   bg: "bg-amber-950/30 border-amber-500/20" },
];

export function PremiumBanner({ variant, className }: PremiumBannerProps) {
  const dismissKey = DISMISS_KEY_PREFIX + variant;
  const [dismissed, setDismissed] = useState(true); // start dismissed to avoid SSR flash

  useEffect(() => {
    setDismissed(localStorage.getItem(dismissKey) === "1");
  }, [dismissKey]);

  const dismiss = () => {
    localStorage.setItem(dismissKey, "1");
    setDismissed(true);
  };

  if (dismissed) return null;

  const isMembership = variant === "membership";
  const tiers = isMembership ? MEMBERSHIP_TIERS : ACCELERATOR_TIERS;
  const Icon = isMembership ? Sparkles : Rocket;
  const accentClass = isMembership ? "from-violet-500/10 via-transparent to-transparent border-violet-500/15"
                                    : "from-amber-500/10 via-transparent to-transparent border-amber-500/15";
  const iconColor = isMembership ? "text-violet-400" : "text-amber-400";
  const tagBg    = isMembership ? "bg-violet-950/40 border-violet-500/25 text-violet-300"
                                : "bg-amber-950/40 border-amber-500/25 text-amber-300";
  const ctaHref  = "/settings";

  return (
    <div
      className={cn(
        "relative rounded-[6px] border bg-gradient-to-r overflow-hidden",
        accentClass,
        className,
      )}
      style={{ background: "rgba(8, 6, 18, 0.7)" }}
    >
      {/* Shimmer stripe */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isMembership
            ? "linear-gradient(105deg, transparent 40%, rgba(139,92,246,0.06) 50%, transparent 60%)"
            : "linear-gradient(105deg, transparent 40%, rgba(245,158,11,0.06) 50%, transparent 60%)",
        }}
      />

      <div className="relative flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3">
        {/* Icon + label */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Icon className={cn("w-4 h-4 flex-shrink-0", iconColor)} />
          <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full border", tagBg)}>
            {isMembership ? "AXIS Premium" : "AXIS Accelerator"}
          </span>
        </div>

        {/* Copy */}
        <p className="text-xs text-white/50 flex-1 min-w-0">
          {isMembership
            ? "Unlock advanced match filters, priority visibility, and exclusive opportunities."
            : "Join our incubation program — funding, mentorship, and a path to launch."}
        </p>

        {/* Tier pills */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {tiers.map(t => (
            <div key={t.name} className={cn("hidden sm:flex flex-col items-center px-2 py-1 rounded-[3px] border text-[10px] font-mono leading-tight", t.bg)}>
              <span className={cn("font-bold", t.color)}>{t.price}</span>
              <span className="text-white/30">{t.name}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Link
          href={ctaHref}
          className={cn(
            "flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-[3px] text-xs font-semibold transition-all",
            isMembership
              ? "bg-violet-600/80 hover:bg-violet-500/80 text-white border border-violet-500/30"
              : "bg-amber-600/80 hover:bg-amber-500/80 text-white border border-amber-500/30",
          )}
        >
          <Zap className="w-3 h-3" />
          {isMembership ? "Upgrade" : "Apply"}
        </Link>

        {/* Dismiss */}
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="absolute top-2 right-2 sm:relative sm:top-auto sm:right-auto flex-shrink-0 p-1 text-white/20 hover:text-white/50 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
