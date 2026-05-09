"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Check, Zap, Star, Crown, Rocket,
  Users, Target, BarChart3, MessageCircle,
  FileText,
  Sparkles, Shield, ArrowRight,
} from "lucide-react";

// ─── Tier definitions ──────────────────────────────────────────────────────────
// Price IDs come from NEXT_PUBLIC_ env vars set in Vercel.
// The server validates them against the same vars before creating a session.

const TIERS = [
  {
    id: "free",
    name: "Free",
    icon: Users,
    monthlyJpy: 0,
    annualJpy: 0,
    description: "For students just getting started.",
    priceId: null,
    badge: null,
    highlighted: false,
    features: [
      "Browse 50+ verified student orgs",
      "View all opportunities",
      "Basic public profile",
      "3 AI match recommendations / day",
      "Public calendar & events",
      "Community access",
    ],
    cta: "Get started free",
  },
  {
    id: "basic",
    name: "Basic",
    icon: Zap,
    monthlyJpy: 399,
    description: "For members who want unlimited AI matching.",
    priceId: process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID ?? null,
    badge: null,
    highlighted: false,
    features: [
      "Unlimited AI match recommendations",
      "Basic verification",
    ],
    cta: "Start Basic",
  },
  {
    id: "enthusiast",
    name: "Enthusiast",
    icon: Star,
    monthlyJpy: 1_000,
    description: "For members who want profile and messaging perks.",
    priceId: process.env.NEXT_PUBLIC_STRIPE_ENTHUSIAST_PRICE_ID ?? null,
    badge: "Most Popular",
    highlighted: true,
    features: [
      "Unlimited AI match recommendations",
      "Verification",
      "Profile optimizer",
      "Exclusive seminars",
      "Enthusiast verification",
      "Direct messaging to other users",
    ],
    cta: "Start Enthusiast",
  },
  {
    id: "max",
    name: "Max",
    icon: Crown,
    monthlyJpy: 5_000,
    description: "For members who want full ecosystem access.",
    priceId: process.env.NEXT_PUBLIC_STRIPE_MAX_PRICE_ID ?? null,
    badge: "Full Access",
    highlighted: false,
    features: [
      "Unlimited AI match recommendations",
      "Verification",
      "Profile optimizer",
      "Exclusive seminars",
      "Enthusiast verification",
      "Direct messaging to other users",
      "Exclusive networking events with food and drinks included",
      "Exclusive opportunities within the AXIS ecosystem",
    ],
    cta: "Start Max",
  },
] as const;

const ACCELERATOR_TIERS = [
  {
    id: "accel-basic",
    name: "Accelerator Basic",
    icon: Rocket,
    monthlyJpy: 4_800,
    annualJpy: 38_400,
    priceId: process.env.NEXT_PUBLIC_STRIPE_ACCEL_BASIC_PRICE_ID ?? null,
    perks: ["All Max features", "Cohort mentorship sessions", "Investor intro network", "Demo day participation"],
  },
  {
    id: "accel-enthusiast",
    name: "Accelerator Enthusiast",
    icon: Target,
    monthlyJpy: 9_800,
    annualJpy: 78_400,
    priceId: process.env.NEXT_PUBLIC_STRIPE_ACCEL_ENT_PRICE_ID ?? null,
    perks: ["All Accel Basic features", "1-on-1 monthly mentor calls", "Pitch deck review", "Priority funding connections"],
  },
  {
    id: "accel-max",
    name: "Accelerator Max",
    icon: BarChart3,
    monthlyJpy: 19_800,
    annualJpy: 158_400,
    priceId: process.env.NEXT_PUBLIC_STRIPE_ACCEL_MAX_PRICE_ID ?? null,
    perks: ["All Accel Enthusiast features", "Dedicated growth advisor", "VC warm introductions", "Cohort alumni network"],
  },
] as const;

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatJpy(amount: number) {
  if (amount === 0) return "¥0";
  return `¥${amount.toLocaleString("ja-JP")}`;
}

// ─── Component ─────────────────────────────────────────────────────────────────

interface Props {
  isSignedIn: boolean;
  currentPriceId: string | null;
  subscriptionStatus: string | null;
}

export function PricingContent({ isSignedIn, currentPriceId, subscriptionStatus }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const isActive = subscriptionStatus === "active" || subscriptionStatus === "trialing";

  async function handleSubscribe(tierId: string, priceId: string | null) {
    if (!isSignedIn) {
      router.push("/auth/signin?callbackUrl=/pricing");
      return;
    }
    if (!priceId) return;
    setLoading(tierId);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="pt-20 pb-12 px-4 text-center">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-6"
          style={{
            background: "rgba(139,92,246,0.15)",
            border: "1px solid rgba(139,92,246,0.3)",
            color: "rgba(192,132,252,1)",
            letterSpacing: "0.06em",
          }}
        >
          <Sparkles className="w-3 h-3" />
          AXIS PREMIUM
        </div>

        <h1
          className="text-5xl sm:text-6xl font-bold text-white mb-4"
          style={{ letterSpacing: "-0.04em", lineHeight: 1.05 }}
        >
          Invest in your
          <br />
          <span className="gradient-text">founder journey.</span>
        </h1>
        <p className="text-base sm:text-lg max-w-xl mx-auto" style={{ color: "var(--text-secondary)" }}>
          Every tier is built for student founders — from your first org to your first funding round.
        </p>

      </div>

      {/* ── Main tier cards ───────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TIERS.map((tier) => {
            const Icon = tier.icon;
            const price = tier.monthlyJpy;
            const isCurrent = isActive && currentPriceId === tier.priceId;
            const isFree = tier.id === "free";

            return (
              <div
                key={tier.id}
                className="relative flex flex-col rounded-2xl"
                style={{
                  background: tier.highlighted
                    ? "linear-gradient(135deg, rgba(139,92,246,0.25), rgba(76,29,149,0.15))"
                    : "rgba(255,255,255,0.04)",
                  border: tier.highlighted
                    ? "1px solid rgba(139,92,246,0.5)"
                    : "1px solid rgba(255,255,255,0.08)",
                  boxShadow: tier.highlighted
                    ? "0 0 40px rgba(139,92,246,0.15), inset 0 1px 0 rgba(255,255,255,0.1)"
                    : "inset 0 1px 0 rgba(255,255,255,0.05)",
                }}
              >
                {/* Badge */}
                {tier.badge && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
                    style={{
                      background: tier.highlighted
                        ? "linear-gradient(90deg, rgba(139,92,246,1), rgba(192,132,252,1))"
                        : "rgba(255,255,255,0.15)",
                      color: "white",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {tier.badge}
                  </div>
                )}

                <div className="p-6 flex flex-col flex-1">
                  {/* Header */}
                  <div className="mb-5">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                      style={{
                        background: tier.highlighted
                          ? "rgba(139,92,246,0.3)"
                          : "rgba(255,255,255,0.08)",
                      }}
                    >
                      <Icon className="w-4.5 h-4.5" style={{ color: tier.highlighted ? "rgba(192,132,252,1)" : "rgba(255,255,255,0.7)" }} />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-1">{tier.name}</h3>
                    <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{tier.description}</p>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-white">{formatJpy(price)}</span>
                      {price > 0 && (
                        <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                          /mo
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2.5 mb-8 flex-1">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <Check
                          className="w-3.5 h-3.5 mt-0.5 shrink-0"
                          style={{ color: tier.highlighted ? "rgba(192,132,252,1)" : "rgba(167,139,250,0.8)" }}
                        />
                        <span className="text-xs leading-relaxed" style={{ color: "rgba(220,215,240,0.75)" }}>
                          {f}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  {isCurrent ? (
                    <div
                      className="w-full py-2.5 rounded-xl text-sm font-medium text-center"
                      style={{
                        background: "rgba(255,255,255,0.08)",
                        color: "rgba(192,132,252,1)",
                        border: "1px solid rgba(139,92,246,0.3)",
                      }}
                    >
                      ✓ Current plan
                    </div>
                  ) : isFree ? (
                    <Link
                      href={isSignedIn ? "/dashboard" : "/auth/signin"}
                      className="w-full py-2.5 rounded-xl text-sm font-medium text-center block transition-colors"
                      style={{
                        background: "rgba(255,255,255,0.08)",
                        color: "white",
                        border: "1px solid rgba(255,255,255,0.12)",
                      }}
                    >
                      {isSignedIn ? "Go to dashboard" : "Get started free"}
                    </Link>
                  ) : (
                    <button
                      onClick={() => handleSubscribe(tier.id, tier.priceId)}
                      disabled={loading === tier.id || !tier.priceId}
                      className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
                      style={{
                        background: tier.highlighted
                          ? "linear-gradient(135deg, rgba(139,92,246,0.9), rgba(109,40,217,0.9))"
                          : "rgba(255,255,255,0.1)",
                        color: "white",
                        border: tier.highlighted
                          ? "1px solid rgba(192,132,252,0.4)"
                          : "1px solid rgba(255,255,255,0.12)",
                        opacity: loading === tier.id ? 0.7 : 1,
                      }}
                    >
                      {loading === tier.id ? (
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          {tier.cta}
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Manage existing subscription ─────────────────────────────── */}
        {isSignedIn && isActive && (
          <div
            className="mt-6 p-4 rounded-xl flex items-center justify-between gap-4"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4" style={{ color: "rgba(192,132,252,0.8)" }} />
              <span className="text-sm text-white">
                Your subscription is active.{" "}
                <span style={{ color: "var(--text-secondary)" }}>Manage billing, invoices, and payment methods.</span>
              </span>
            </div>
            <button
              onClick={async () => {
                const res = await fetch("/api/billing/portal", { method: "POST" });
                const data = await res.json();
                if (data.url) window.location.href = data.url;
              }}
              className="shrink-0 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              style={{
                background: "rgba(255,255,255,0.08)",
                color: "white",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              Manage →
            </button>
          </div>
        )}

        {/* ── Accelerator section ───────────────────────────────────────── */}
        <div className="mt-20">
          <div className="text-center mb-10">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4"
              style={{
                background: "rgba(234,179,8,0.1)",
                border: "1px solid rgba(234,179,8,0.25)",
                color: "rgba(250,204,21,0.9)",
                letterSpacing: "0.06em",
              }}
            >
              <Rocket className="w-3 h-3" />
              AXIS ACCELERATOR
            </div>
            <h2
              className="text-3xl sm:text-4xl font-bold text-white mb-3"
              style={{ letterSpacing: "-0.03em" }}
            >
              For founders serious about scale.
            </h2>
            <p className="text-sm max-w-md mx-auto" style={{ color: "var(--text-secondary)" }}>
              Mentorship, investor access, and a cohort of Japan's most ambitious student founders.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ACCELERATOR_TIERS.map((tier) => {
              const Icon = tier.icon;
              const price = tier.monthlyJpy;
              const isCurrent = isActive && currentPriceId === tier.priceId;

              return (
                <div
                  key={tier.id}
                  className="rounded-2xl p-6"
                  style={{
                    background: "rgba(234,179,8,0.04)",
                    border: "1px solid rgba(234,179,8,0.15)",
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center mb-4"
                    style={{ background: "rgba(234,179,8,0.12)" }}
                  >
                    <Icon className="w-4.5 h-4.5" style={{ color: "rgba(250,204,21,0.9)" }} />
                  </div>

                  <h3 className="text-base font-semibold text-white mb-1">{tier.name}</h3>

                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-2xl font-bold text-white">{formatJpy(price)}</span>
                    <span className="text-xs" style={{ color: "var(--text-secondary)" }}>/mo</span>
                  </div>

                  <ul className="space-y-2 mb-6">
                    {tier.perks.map((p) => (
                      <li key={p} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: "rgba(250,204,21,0.7)" }} />
                        <span className="text-xs" style={{ color: "rgba(220,215,240,0.7)" }}>{p}</span>
                      </li>
                    ))}
                  </ul>

                  {isCurrent ? (
                    <div
                      className="w-full py-2 rounded-xl text-sm font-medium text-center"
                      style={{ background: "rgba(234,179,8,0.1)", color: "rgba(250,204,21,0.9)" }}
                    >
                      ✓ Current plan
                    </div>
                  ) : (
                    <button
                      onClick={() => handleSubscribe(tier.id, tier.priceId)}
                      disabled={loading === tier.id || !tier.priceId}
                      className="w-full py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                      style={{
                        background: "rgba(234,179,8,0.15)",
                        color: "rgba(250,204,21,0.95)",
                        border: "1px solid rgba(234,179,8,0.25)",
                        opacity: loading === tier.id ? 0.7 : 1,
                      }}
                    >
                      {loading === tier.id
                        ? <span className="w-4 h-4 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" />
                        : <><span>Apply now</span><ArrowRight className="w-3.5 h-3.5" /></>
                      }
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── FAQ / trust signals ───────────────────────────────────────── */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 pb-16">
          {[
            {
              icon: Shield,
              title: "Cancel anytime",
              body: "No lock-in. Cancel from your settings page and you keep access until the end of your billing period.",
            },
            {
              icon: MessageCircle,
              title: "Student verified",
              body: "All plans are priced for students in Japan. Institutional pricing available for schools.",
            },
            {
              icon: FileText,
              title: "Secure payments",
              body: "Payments processed by Stripe. We never store your card details.",
            },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: "rgba(139,92,246,0.12)" }}
              >
                <Icon className="w-4 h-4" style={{ color: "rgba(167,139,250,0.8)" }} />
              </div>
              <div>
                <p className="text-sm font-medium text-white mb-1">{title}</p>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
