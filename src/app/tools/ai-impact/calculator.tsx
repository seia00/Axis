"use client";

import { useState, useMemo } from "react";

// ── Types ──────────────────────────────────────────────────────────────────────

type Tier = "Lightweight" | "Standard" | "Heavy" | "Image";

interface Model {
  id: string;
  name: string;
  company: string;
  emoji: string;
  tier: Tier;
  isImage: boolean;
  waterPer1kTokens?: number;
  kWhPerMTokens?: number;
  waterPerImage?: number;
  kWhPerImage?: number;
}

// ── Model data (based on published research) ───────────────────────────────────

const MODELS: Model[] = [
  { id: "claude-haiku",  name: "Claude Haiku",        company: "Anthropic", emoji: "⚡", tier: "Lightweight", isImage: false, waterPer1kTokens: 0.1,  kWhPerMTokens: 0.10 },
  { id: "claude-sonnet", name: "Claude Sonnet",       company: "Anthropic", emoji: "🎵", tier: "Standard",    isImage: false, waterPer1kTokens: 0.2,  kWhPerMTokens: 0.20 },
  { id: "claude-opus",   name: "Claude Opus",         company: "Anthropic", emoji: "🎭", tier: "Heavy",       isImage: false, waterPer1kTokens: 0.4,  kWhPerMTokens: 0.40 },
  { id: "gpt4o-mini",    name: "GPT-4o mini",         company: "OpenAI",    emoji: "✨", tier: "Lightweight", isImage: false, waterPer1kTokens: 0.1,  kWhPerMTokens: 0.10 },
  { id: "gpt4o",         name: "GPT-4o",              company: "OpenAI",    emoji: "🤖", tier: "Standard",    isImage: false, waterPer1kTokens: 0.4,  kWhPerMTokens: 0.35 },
  { id: "gpt4",          name: "GPT-4",               company: "OpenAI",    emoji: "🧠", tier: "Heavy",       isImage: false, waterPer1kTokens: 0.5,  kWhPerMTokens: 0.40 },
  { id: "gpt5",          name: "GPT-5",               company: "OpenAI",    emoji: "🚀", tier: "Heavy",       isImage: false, waterPer1kTokens: 0.5,  kWhPerMTokens: 0.45 },
  { id: "gemini-flash",  name: "Gemini Flash",        company: "Google",    emoji: "🌟", tier: "Lightweight", isImage: false, waterPer1kTokens: 0.1,  kWhPerMTokens: 0.10 },
  { id: "gemini-pro",    name: "Gemini Pro",          company: "Google",    emoji: "💎", tier: "Standard",    isImage: false, waterPer1kTokens: 0.2,  kWhPerMTokens: 0.20 },
  { id: "llama3",        name: "Llama 3",             company: "Meta",      emoji: "🦙", tier: "Standard",    isImage: false, waterPer1kTokens: 0.2,  kWhPerMTokens: 0.20 },
  { id: "dalle-mj",      name: "DALL-E / Midjourney", company: "Mixed",     emoji: "🎨", tier: "Image",       isImage: true,  waterPerImage: 0.8, kWhPerImage: 0.02 },
];

// ── Styling maps ──────────────────────────────────────────────────────────────

const TIER_CONFIG: Record<Tier, { dot: string; label: string }> = {
  Lightweight: { dot: "bg-emerald-400", label: "text-emerald-400" },
  Standard:    { dot: "bg-amber-400",   label: "text-amber-400" },
  Heavy:       { dot: "bg-red-400",     label: "text-red-400" },
  Image:       { dot: "bg-violet-400",  label: "text-violet-400" },
};

const COMPANY_BADGE: Record<string, string> = {
  Anthropic: "bg-violet-950/60 text-violet-300 border border-violet-800/40",
  OpenAI:    "bg-emerald-950/60 text-emerald-300 border border-emerald-800/40",
  Google:    "bg-blue-950/60 text-blue-300 border border-blue-800/40",
  Meta:      "bg-orange-950/60 text-orange-300 border border-orange-800/40",
  Mixed:     "bg-purple-950/60 text-purple-300 border border-purple-800/40",
};

// ── Formatters ────────────────────────────────────────────────────────────────

function formatWater(liters: number): string {
  if (liters < 0.001) return `${(liters * 1000).toFixed(2)} mL`;
  if (liters < 1)     return `${(liters * 1000).toFixed(0)} mL`;
  if (liters < 1000)  return `${liters.toFixed(2)} L`;
  return `${(liters / 1000).toFixed(3)} kL`;
}

function formatCarbon(kg: number): string {
  if (kg < 0.000001) return `< 0.001 mg CO₂`;
  if (kg < 0.001)    return `${(kg * 1_000_000).toFixed(0)} μg CO₂`;
  if (kg < 1)        return `${(kg * 1000).toFixed(2)} g CO₂`;
  return `${kg.toFixed(3)} kg CO₂`;
}

function formatEnergy(kWh: number): string {
  if (kWh < 0.001) return `${(kWh * 1000).toFixed(3)} Wh`;
  if (kWh < 1)     return `${(kWh * 1000).toFixed(1)} Wh`;
  return `${kWh.toFixed(3)} kWh`;
}

// ── Step number badge ─────────────────────────────────────────────────────────

function StepBadge({ n }: { n: number }) {
  return (
    <span className="w-6 h-6 rounded-full bg-violet-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
      {n}
    </span>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function AiImpactCalculator() {
  const [selectedId, setSelectedId]     = useState<string | null>(null);
  const [messageCount, setMessageCount] = useState(100);
  const [imageCount, setImageCount]     = useState(50);
  const [longContext, setLongContext]   = useState(false);
  const [showSources, setShowSources]   = useState(false);
  const [showInfo, setShowInfo]         = useState(false);

  const model = MODELS.find((m) => m.id === selectedId) ?? null;

  const result = useMemo(() => {
    if (!model) return null;
    if (model.isImage) {
      const waterL  = imageCount * (model.waterPerImage ?? 0.8);
      const kWh     = imageCount * (model.kWhPerImage   ?? 0.02);
      const carbonKg = kWh * 0.3;
      return { waterL, kWh, carbonKg };
    }
    const tokensPerMsg = longContext ? 1500 : 300;
    const totalTokens  = messageCount * tokensPerMsg;
    const waterL       = (totalTokens / 1000)       * (model.waterPer1kTokens ?? 0.2);
    const kWh          = (totalTokens / 1_000_000)  * (model.kWhPerMTokens   ?? 0.2);
    const carbonKg     = kWh * 0.3;
    return { waterL, kWh, carbonKg };
  }, [model, messageCount, imageCount, longContext]);

  const comparisons = useMemo(() => {
    if (!result) return null;
    return {
      bottles:     result.waterL / 0.5,
      showerSecs:  result.waterL / 0.13,
      phoneCharges: result.kWh   / 0.012,
      drivingKm:   result.carbonKg / 0.21,
      treeHours:   result.carbonKg / 0.0025,
    };
  }, [result]);

  const impactLevel = useMemo(() => {
    if (!result) return 0;
    const byWater  = Math.min(100, (result.waterL   / 100) * 100);
    const byCarbon = Math.min(100, (result.carbonKg / 5)   * 100);
    return Math.max(byWater, byCarbon);
  }, [result]);

  const impactColor =
    impactLevel < 20 ? "bg-emerald-500" :
    impactLevel < 50 ? "bg-amber-400"   :
    impactLevel < 80 ? "bg-orange-400"  : "bg-red-500";

  const impactLabel =
    impactLevel < 20 ? "Low" :
    impactLevel < 50 ? "Moderate" :
    impactLevel < 80 ? "High" : "Very High";

  const impactTextColor =
    impactLevel < 20 ? "text-emerald-400" :
    impactLevel < 50 ? "text-amber-400"   :
    impactLevel < 80 ? "text-orange-400"  : "text-red-400";

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-10">

        {/* ── Header ────────────────────────────────────────────────────────── */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2.5">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--foreground)]">
              AI Environmental Impact
            </h1>
            <button
              onClick={() => setShowInfo(!showInfo)}
              aria-label="Show data sources"
              className="w-6 h-6 rounded-full border border-[var(--border-strong)] text-[var(--text-secondary)] text-xs font-mono flex items-center justify-center hover:border-violet-500/50 hover:text-violet-300 transition-colors flex-shrink-0"
            >
              i
            </button>
          </div>

          <p className="text-[var(--text-secondary)] text-base sm:text-lg">
            See the real cost of your AI usage
          </p>

          {showInfo && (
            <div className="mt-4 mx-auto max-w-xl text-left p-4 rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] text-sm text-[var(--text-secondary)] space-y-1.5 animate-fade-in">
              <p className="text-[var(--foreground)] font-semibold mb-2">Data sources</p>
              <p>· Microsoft/Google datacenters: ~1.8L water consumed per kWh</p>
              <p>· GPT-4 class: ~0.5L per 1,000 tokens (Shaolei Ren et al., 2023)</p>
              <p>· Carbon intensity: ~0.3 kg CO₂ per kWh (global average grid)</p>
              <p>· Large model energy: ~0.4 kWh per million tokens, scaled by tier</p>
              <p>· Image generation: ~0.8L water / 0.02 kWh per image (estimated)</p>
              <p className="pt-1 text-xs text-[var(--text-tertiary)]">
                All figures are estimates based on published research. Actual values vary by provider, region, and workload.
              </p>
            </div>
          )}
        </div>

        {/* ── Step 1: Model Selection ───────────────────────────────────────── */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <StepBadge n={1} />
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Select your model</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {MODELS.map((m) => {
              const tier      = TIER_CONFIG[m.tier];
              const compBadge = COMPANY_BADGE[m.company];
              const isSelected = selectedId === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedId(m.id)}
                  className={[
                    "relative text-left p-4 rounded-xl border transition-all duration-150 flex flex-col gap-2 cursor-pointer",
                    isSelected
                      ? "border-violet-500 ring-2 ring-violet-500/30 bg-violet-950/20 scale-[1.02]"
                      : "border-[var(--border)] bg-[var(--surface)] hover:border-violet-500/30 hover:bg-[var(--surface-raised)]",
                  ].join(" ")}
                >
                  <span className="text-2xl">{m.emoji}</span>
                  <span className="font-semibold text-sm text-[var(--foreground)] leading-tight">{m.name}</span>
                  <span className={`inline-flex self-start items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium ${compBadge}`}>
                    {m.company}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${tier.dot} flex-shrink-0`} />
                    <span className={`text-[11px] font-medium ${tier.label}`}>{m.tier}</span>
                  </div>

                  {isSelected && (
                    <span className="absolute top-2 right-2 w-4 h-4 bg-violet-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-[8px] leading-none">✓</span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* ── Step 2: Usage Inputs ──────────────────────────────────────────── */}
        {model && (
          <section className="space-y-4 animate-fade-in">
            <div className="flex items-center gap-3">
              <StepBadge n={2} />
              <h2 className="text-lg font-semibold text-[var(--foreground)]">Your usage</h2>
            </div>

            <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--surface)] space-y-6">
              {model.isImage ? (
                /* ── Image count ── */
                <div className="space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <label className="text-sm font-medium text-[var(--foreground)]">Images generated</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        max={500}
                        value={imageCount}
                        onChange={(e) => setImageCount(Math.max(1, Math.min(500, Number(e.target.value))))}
                        className="w-20 px-2 py-1 text-sm text-right rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-violet-500"
                      />
                      <span className="text-sm text-[var(--text-secondary)]">images</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={500}
                    value={imageCount}
                    onChange={(e) => setImageCount(Number(e.target.value))}
                    className="w-full accent-violet-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-[var(--text-secondary)] font-[family-name:var(--font-jetbrains-mono)]">
                    <span>1</span>
                    <span>≈ {(imageCount * 0.8).toFixed(1)} L water estimated</span>
                    <span>500</span>
                  </div>
                </div>
              ) : (
                /* ── Text: message count + long context toggle ── */
                <>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <label className="text-sm font-medium text-[var(--foreground)]">Messages sent</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          max={10000}
                          value={messageCount}
                          onChange={(e) =>
                            setMessageCount(Math.max(1, Math.min(10000, Number(e.target.value))))
                          }
                          className="w-24 px-2 py-1 text-sm text-right rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-violet-500"
                        />
                        <span className="text-sm text-[var(--text-secondary)]">msgs</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={10000}
                      value={messageCount}
                      onChange={(e) => setMessageCount(Number(e.target.value))}
                      className="w-full accent-violet-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-[var(--text-secondary)] font-[family-name:var(--font-jetbrains-mono)]">
                      <span>1</span>
                      <span>
                        ≈ {((messageCount * (longContext ? 1500 : 300)) / 1000).toFixed(0)}K tokens total
                      </span>
                      <span>10,000</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
                    <div>
                      <p className="text-sm font-medium text-[var(--foreground)]">Include long context</p>
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                        Long docs, code files, PDFs — roughly 5× more tokens per message
                      </p>
                    </div>
                    <button
                      role="switch"
                      aria-checked={longContext}
                      onClick={() => setLongContext(!longContext)}
                      className={[
                        "relative w-11 h-6 rounded-full transition-colors duration-200",
                        "focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-1 focus:ring-offset-[var(--surface)]",
                        longContext ? "bg-violet-600" : "bg-[var(--muted)]",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200",
                          longContext ? "translate-x-5" : "translate-x-0",
                        ].join(" ")}
                      />
                    </button>
                  </div>
                </>
              )}
            </div>
          </section>
        )}

        {/* ── Step 3: Results ───────────────────────────────────────────────── */}
        {result && comparisons && (
          <section className="space-y-4 animate-fade-in">
            <div className="flex items-center gap-3">
              <StepBadge n={3} />
              <h2 className="text-lg font-semibold text-[var(--foreground)]">Your estimated impact</h2>
            </div>

            {/* Main stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Water */}
              <div className="p-6 rounded-xl border border-blue-800/30 bg-blue-950/20 space-y-2">
                <div className="flex items-center gap-2 text-blue-300">
                  <span className="text-xl">💧</span>
                  <span className="text-xs font-semibold uppercase tracking-widest">Water Usage</span>
                </div>
                <div className="font-[family-name:var(--font-jetbrains-mono)] text-3xl sm:text-4xl font-bold text-[var(--foreground)] break-all">
                  {formatWater(result.waterL)}
                </div>
                <p className="text-xs text-[var(--text-secondary)]">
                  ≈ {comparisons.bottles < 0.1
                    ? `${(comparisons.bottles * 1000).toFixed(0)} mL`
                    : comparisons.bottles < 1
                    ? `${(comparisons.bottles * 1000).toFixed(0)} mL`
                    : `${comparisons.bottles.toFixed(1)} × 500 mL water bottles`}
                </p>
              </div>

              {/* Carbon */}
              <div className="p-6 rounded-xl border border-emerald-800/30 bg-emerald-950/20 space-y-2">
                <div className="flex items-center gap-2 text-emerald-300">
                  <span className="text-xl">🌿</span>
                  <span className="text-xs font-semibold uppercase tracking-widest">Carbon Footprint</span>
                </div>
                <div className="font-[family-name:var(--font-jetbrains-mono)] text-3xl sm:text-4xl font-bold text-[var(--foreground)] break-all">
                  {formatCarbon(result.carbonKg)}
                </div>
                <p className="text-xs text-[var(--text-secondary)]">
                  ≈ {comparisons.drivingKm < 0.01
                    ? `${(comparisons.drivingKm * 1000).toFixed(0)} m`
                    : `${comparisons.drivingKm.toFixed(2)} km`} of car driving
                </p>
              </div>
            </div>

            {/* Impact level bar */}
            <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] space-y-2.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--text-secondary)]">Overall impact level</span>
                <span className={`font-semibold ${impactTextColor}`}>{impactLabel}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[var(--bg-secondary)] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${impactColor}`}
                  style={{ width: `${Math.max(2, impactLevel)}%` }}
                />
              </div>
              <p className="text-[10px] text-[var(--text-tertiary)]">
                Relative scale — Low: everyday browsing range, Very High: streaming video for hours
              </p>
            </div>

            {/* Comparison chips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  icon: "🍼",
                  label: "Water bottles",
                  value: comparisons.bottles < 0.01
                    ? `${(comparisons.bottles * 1000).toFixed(0)} mL`
                    : comparisons.bottles < 1
                    ? `${(comparisons.bottles).toFixed(2)}×`
                    : `${comparisons.bottles.toFixed(1)}×`,
                  sub: "× 500 mL bottles",
                },
                {
                  icon: "🚿",
                  label: "Shower time",
                  value: comparisons.showerSecs < 60
                    ? `${comparisons.showerSecs.toFixed(0)} sec`
                    : `${(comparisons.showerSecs / 60).toFixed(1)} min`,
                  sub: "of shower time",
                },
                {
                  icon: "📱",
                  label: "Phone charges",
                  value: comparisons.phoneCharges < 0.01
                    ? `< 1%`
                    : comparisons.phoneCharges < 1
                    ? `${(comparisons.phoneCharges * 100).toFixed(0)}%`
                    : `${comparisons.phoneCharges.toFixed(1)}×`,
                  sub: "smartphone charges",
                },
                {
                  icon: "🌳",
                  label: "Tree absorption",
                  value: comparisons.treeHours < 1/60
                    ? `< 1 sec`
                    : comparisons.treeHours < 1/3600
                    ? `${(comparisons.treeHours * 3600).toFixed(0)} sec`
                    : comparisons.treeHours < 1
                    ? `${(comparisons.treeHours * 60).toFixed(0)} min`
                    : `${comparisons.treeHours.toFixed(1)} hr`,
                  sub: "of tree absorption",
                },
              ].map((c) => (
                <div
                  key={c.label}
                  className="p-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-center space-y-1"
                >
                  <div className="text-xl">{c.icon}</div>
                  <div className="font-[family-name:var(--font-jetbrains-mono)] text-base font-bold text-[var(--foreground)] leading-tight">
                    {c.value}
                  </div>
                  <div className="text-[10px] text-[var(--text-secondary)] leading-tight">{c.sub}</div>
                </div>
              ))}
            </div>

            {/* Energy row */}
            <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-amber-300">
                <span className="text-lg">⚡</span>
                <span className="text-sm font-medium">Energy consumed</span>
              </div>
              <span className="font-[family-name:var(--font-jetbrains-mono)] text-sm font-semibold text-[var(--foreground)]">
                {formatEnergy(result.kWh)}
              </span>
            </div>

            {/* Sources footnote */}
            <div className="text-xs text-[var(--text-tertiary)]">
              <button
                onClick={() => setShowSources(!showSources)}
                className="text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors underline underline-offset-2"
              >
                {showSources ? "Hide" : "Show"} data sources &amp; methodology
              </button>
              {showSources && (
                <div className="mt-3 p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] space-y-1.5 animate-fade-in">
                  <p>· Water: Shaolei Ren et al., "Making AI Less &quot;Thirsty&quot;" (2023) — UC Riverside</p>
                  <p>· Energy: Estimated from published datacenter efficiency benchmarks (PUE ≈ 1.2–1.5)</p>
                  <p>· Carbon: US EPA grid carbon intensity (~0.386 kg CO₂/kWh, rounded to 0.3 for global avg)</p>
                  <p>· Image generation: estimates based on NVIDIA A100 GPU workloads at ~0.3 kWh/hr</p>
                  <p>· Tree absorption: ~22 kg CO₂/year per mature tree (US Forest Service)</p>
                  <p className="pt-1 text-[var(--text-tertiary)]">
                    These are approximations. Actual values depend on data center location, renewable energy mix, model version, prompt length, and inference hardware.
                  </p>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
