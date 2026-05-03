"use client";

/**
 * Supernova Axis Diagram
 *
 * Cinematic ignition that fires once on view (autoplay):
 *   T+0.15s  Meteor enters from top-right, streaks toward origin
 *   T+0.45s  IMPACT — explosion at origin, X-axis ignites left→right
 *   T+0.75s  Solar flare surges up Y-axis, line ignites bottom→top
 *   T+1.05s  Constellation lines draw between connected nodes
 *   T+1.15s  Nodes spawn one-by-one with bespoke typography
 *   T+1.7s   Interactive mode unlocked
 *
 * Hover/tap a node: scale → 1.8 supernova, 6 sparks shoot to X/Y axes
 * highlighting the node's coordinates, anchored description card materializes.
 *
 * Click Launch: viewport flashes white-violet, route changes via warp.
 *
 * NOTE: labels use SVG <text> (not foreignObject) so they scale proportionally
 * with the viewBox — a foreignObject's HTML content gets multiplied by the
 * SVG viewBox-to-pixel ratio, which makes rem-sized text look enormous on
 * wide screens.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { useLanguage } from "@/contexts/language-context";
import { triggerWarp } from "@/components/animation/warp-transition";

// ─── Product nodes ────────────────────────────────────────────────────────────

interface NodeDef {
  id: string;
  route: string;
  cx: number;
  cy: number;
  fontVar: string;
  fontWeight: number;
  italic?: boolean;
  letterSpacing?: string;
  /** Text size in viewBox units (so it scales with the diagram) */
  fontSize: number;
}

const NODES: NodeDef[] = [
  { id: "directory",     route: "/directory",     cx: 22, cy: 70, fontVar: "var(--font-plex-mono)",       fontWeight: 500, letterSpacing: "0.04em", fontSize: 2.4 },
  { id: "network",       route: "/network",       cx: 38, cy: 56, fontVar: "var(--font-instrument)",      fontWeight: 400, italic: true, letterSpacing: "-0.01em", fontSize: 3.2 },
  { id: "opportunities", route: "/opportunities", cx: 52, cy: 46, fontVar: "var(--font-inter)",           fontWeight: 600, italic: true, letterSpacing: "-0.02em", fontSize: 2.6 },
  { id: "match",         route: "/match",         cx: 56, cy: 28, fontVar: "var(--font-jetbrains-mono)",  fontWeight: 600, letterSpacing: "0.06em", fontSize: 2.4 },
  { id: "launchpad",     route: "/launchpad",     cx: 70, cy: 36, fontVar: "var(--font-inter)",           fontWeight: 800, letterSpacing: "-0.04em", fontSize: 2.8 },
  { id: "ventures",      route: "/ventures",      cx: 84, cy: 22, fontVar: "var(--font-space-grotesk)",   fontWeight: 700, letterSpacing: "-0.03em", fontSize: 2.7 },
];

const CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [2, 4], [3, 4], [4, 5],
];

const ORIGIN_X = 8;
const ORIGIN_Y = 76;

// ─── Component ────────────────────────────────────────────────────────────────

export function AxisDiagram() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const router = useRouter();
  const { t, lang } = useLanguage();

  const [interactive, setInteractive] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [flashing, setFlashing] = useState(false);
  const ignitedRef = useRef(false);

  const PRODUCTS = NODES.map(node => ({
    ...node,
    name:        t(`product.${node.id}.name`),
    description: t(`product.${node.id}.desc`),
  }));

  // ── Master ignition timeline (faster: total ~1.7s instead of 2.6s) ──────
  const ignite = useCallback(() => {
    if (ignitedRef.current) return;
    ignitedRef.current = true;

    const tl = gsap.timeline();

    // ── Phase 1: Meteor (T+0.15 → T+0.45) ──────────────────────────────
    tl.to(".meteor-path", {
      strokeDashoffset: 0,
      duration: 0.30,
      ease: "power2.in",
      delay: 0.15,
    });

    // ── Phase 2: IMPACT — explosion + X-axis ignition (T+0.45) ──────────
    tl.to(".impact-flash", {
      opacity: 0.7,
      duration: 0.06,
      ease: "power2.out",
    });
    tl.to(".impact-flash", {
      opacity: 0,
      duration: 0.30,
      ease: "power2.in",
    });

    tl.to(".impact-shard", {
      attr: { r: 2.5 },
      opacity: 0,
      stagger: 0.004,
      duration: 0.45,
      ease: "power3.out",
    }, "<");

    // X-axis ignites left→right — stays bright
    tl.to(".x-axis-line", {
      strokeDashoffset: 0,
      duration: 0.32,
      ease: "power2.out",
    }, "<+0.03");
    tl.to(".x-axis-arrow, .x-axis-label", {
      opacity: 1,
      duration: 0.22,
    }, "-=0.10");

    // ── X-axis BEAM — horizontal plasma flare surges right after impact ──
    // Mirrors the vertical solar flare on Y-axis. Width 0 → 90 (origin to arrow).
    tl.to(".beam-x", {
      attr: { width: 90 },
      duration: 0.32,
      ease: "power3.out",
    }, "-=0.32");
    tl.to(".beam-x", {
      opacity: 0.42,
      duration: 0.45,
      ease: "power2.in",
    }, "-=0.10");

    // Horizontal beam streamers — three particles racing right
    tl.fromTo(".beam-streamer",
      { attr: { cx: ORIGIN_X + 1 }, opacity: 0.9 },
      {
        attr: { cx: 95 },
        opacity: 0,
        duration: 0.95,
        stagger: 0.10,
        ease: "power2.out",
      },
      "-=0.55");

    // ── Phase 3: Solar flare + Y-axis (T+0.75) ──────────────────────────
    tl.to(".flare-column", {
      attr: { height: 72 },
      duration: 0.30,
      ease: "power3.out",
    }, "+=0.03");
    tl.to(".flare-column", {
      opacity: 0.42,
      duration: 0.35,
      ease: "power2.in",
    }, "+=0.08");

    tl.to(".y-axis-line", {
      strokeDashoffset: 0,
      duration: 0.30,
      ease: "power2.out",
    }, "-=0.40");
    tl.to(".y-axis-arrow, .y-axis-label", {
      opacity: 1,
      duration: 0.22,
    }, "-=0.10");

    tl.fromTo(".flare-streamer",
      { attr: { cy: ORIGIN_Y - 1 }, opacity: 0.9 },
      {
        attr: { cy: 5 },
        opacity: 0,
        duration: 0.95,
        stagger: 0.10,
        ease: "power2.out",
      },
      "-=0.55");

    // ── Phase 4: Constellation (T+1.05) ─────────────────────────────────
    tl.to(".constellation-line", {
      strokeDashoffset: 0,
      opacity: 0.20,
      duration: 0.35,
      stagger: 0.04,
      ease: "none",
    }, "+=0.03");

    // ── Phase 5: Nodes spawn (T+1.15) ───────────────────────────────────
    NODES.forEach((_, i) => {
      tl.to(`.node-group-${i}`, {
        scale: 1,
        opacity: 1,
        duration: 0.32,
        ease: "back.out(2.6)",
      }, i === 0 ? "+=0" : "<+0.075");
      tl.to(`.node-label-${i}`, {
        opacity: 1,
        y: 0,
        duration: 0.25,
        ease: "power2.out",
      }, "<+0.06");
    });

    // ── Phase 6: Idle state (axes stay bright!) — unlock interactive ────
    // Previous version faded axes to 0.10 — too faint per user feedback.
    // Now keep them at full opacity (0.85 stroke-grad already controls visual weight).
    tl.call(() => setInteractive(true), [], "+=0.05");
  }, []);

  // ── Set initial state + intersection observer ───────────────────────────
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(".meteor-path", { strokeDasharray: 200, strokeDashoffset: 200 });
      gsap.set(".impact-flash", { opacity: 0 });
      gsap.set(".impact-shard", { attr: { r: 0.3 }, opacity: 1 });
      gsap.set(".flare-column", { attr: { height: 0 }, opacity: 1 });
      gsap.set(".flare-streamer", { opacity: 0 });
      gsap.set(".beam-x", { attr: { width: 0 }, opacity: 1 });
      gsap.set(".beam-streamer", { opacity: 0 });
      gsap.set(".x-axis-line", { strokeDasharray: 100, strokeDashoffset: 100, opacity: 1 });
      gsap.set(".y-axis-line", { strokeDasharray: 100, strokeDashoffset: 100, opacity: 1 });
      gsap.set(".x-axis-arrow, .y-axis-arrow, .x-axis-label, .y-axis-label", { opacity: 0 });
      gsap.set(".constellation-line", { strokeDasharray: 100, strokeDashoffset: 100, opacity: 0 });
      NODES.forEach((_, i) => {
        gsap.set(`.node-group-${i}`, { scale: 0, opacity: 0, transformOrigin: "center center" });
        gsap.set(`.node-label-${i}`, { opacity: 0, y: 4 });
      });
    }, sectionRef);

    // Trigger earlier (25% in view) so it ignites before user scrolls past
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0]?.isIntersecting) ignite(); },
      { threshold: 0.25 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);

    return () => {
      ctx.revert();
      observer.disconnect();
    };
  }, [ignite]);

  // ── Hover supernova ─────────────────────────────────────────────────────
  const handleNodeHover = useCallback((nodeId: string, idx: number, isEnter: boolean) => {
    if (!interactive) return;
    setHovered(isEnter ? nodeId : null);
    const node = NODES[idx];
    if (!node) return;

    if (isEnter) {
      gsap.to(`.node-group-${idx} .node-core`, {
        attr: { r: 1.8 },
        duration: 0.20,
        ease: "back.out(2)",
      });
      gsap.to(`.node-group-${idx} .node-halo`, {
        attr: { r: 8 },
        opacity: 0.55,
        duration: 0.28,
        ease: "power2.out",
      });

      const sparks = svgRef.current?.querySelectorAll(`.spark-${idx}`);
      if (sparks) {
        sparks.forEach((spark, i) => {
          const goY = i < 3;
          const targetX = goY ? node.cx : ORIGIN_X;
          const targetY = goY ? ORIGIN_Y : node.cy;
          gsap.fromTo(spark,
            { attr: { cx: node.cx, cy: node.cy, r: 0.6 }, opacity: 1 },
            { attr: { cx: targetX, cy: targetY, r: 0.4 }, opacity: 0,
              duration: 0.50 + i * 0.04, ease: "power2.in", delay: i * 0.02 }
          );
        });
      }

      gsap.fromTo(`.tick-x-${idx}`,
        { opacity: 0, attr: { r: 0 } },
        { opacity: 1, attr: { r: 0.95 }, duration: 0.40, delay: 0.45, ease: "power2.out" }
      );
      gsap.fromTo(`.tick-y-${idx}`,
        { opacity: 0, attr: { r: 0 } },
        { opacity: 1, attr: { r: 0.95 }, duration: 0.40, delay: 0.45, ease: "power2.out" }
      );
      gsap.to(`.tick-x-${idx}, .tick-y-${idx}`, {
        opacity: 0, duration: 0.35, delay: 1.3, ease: "power2.in",
      });
    } else {
      gsap.to(`.node-group-${idx} .node-core`, {
        attr: { r: 1.2 }, duration: 0.22, ease: "power2.out",
      });
      gsap.to(`.node-group-${idx} .node-halo`, {
        attr: { r: 3.5 }, opacity: 0.25, duration: 0.22,
      });
    }
  }, [interactive]);

  // ── Launch ──────────────────────────────────────────────────────────────
  const handleLaunch = useCallback((route: string, originX?: number, originY?: number) => {
    if (!interactive) return;
    triggerWarp(originX, originY);
    setFlashing(true);
    setTimeout(() => router.push(route), 280);
  }, [interactive, router]);

  // ── Idle pulse on nodes ─────────────────────────────────────────────────
  useEffect(() => {
    if (!interactive) return;
    const pulses: gsap.core.Tween[] = [];
    NODES.forEach((_, i) => {
      const tween = gsap.to(`.node-group-${i} .node-halo`, {
        attr: { r: 4.5 },
        opacity: 0.32,
        duration: 2 + i * 0.15,
        repeat: -1, yoyo: true, ease: "sine.inOut",
      });
      pulses.push(tween);
    });
    return () => { pulses.forEach(p => p.kill()); };
  }, [interactive]);

  // ── Card position helper ────────────────────────────────────────────────
  const cardPositionFor = (node: NodeDef) => {
    const side = node.cx > 50 ? "left" : "right";
    const vert = node.cy > 60 ? "above" : "below";
    return { side, vert };
  };

  return (
    <section
      id="axis-diagram"
      ref={sectionRef}
      className="relative z-10 w-full overflow-hidden"
    >
      {/* Full-screen flash overlay (white→violet) for route launch */}
      {flashing && (
        <div
          className="fixed inset-0 z-[100] pointer-events-none"
          style={{
            background: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.95), rgba(167,139,250,0.85) 40%, rgba(76,29,149,0.6) 70%, transparent)",
            animation: "axisFlashIn 0.18s ease-out forwards",
          }}
        />
      )}

      {/* ── Tension gap ─ empty space between hero and heading for breathing room */}
      <div className="h-[34vh] sm:h-[42vh] min-h-[240px] max-h-[480px]" aria-hidden="true" />

      {/* ── Heading row ────────────────────────────────────────────────── */}
      <div className="relative pb-4 px-4 text-center">
        <h2
          className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white"
          style={{ letterSpacing: "-0.04em", lineHeight: 1.05 }}
        >
          {t("diagram.heading")}{" "}
          <span className="gradient-text">{t("diagram.heading.accent")}</span>
        </h2>
        <p
          className="mt-3 text-sm sm:text-base mx-auto max-w-xl"
          style={{ color: "var(--text-secondary)" }}
        >
          {t("diagram.subtext")}
        </p>
      </div>

      {/* ── Diagram container — centered, balanced sizing ──────────────── */}
      <div className="relative w-full flex items-center justify-center px-4 pb-16">
        <div
          className="relative w-full mx-auto"
          style={{
            maxWidth: "min(900px, 92vw)",
            aspectRatio: "1 / 0.7",
          }}
        >
          <svg
            ref={svgRef}
            viewBox="0 0 100 80"
            className="w-full h-full block"
            preserveAspectRatio="xMidYMid meet"
            style={{ overflow: "visible" }}
          >
            <defs>
              {/* Meteor — bright white head fading to violet then transparent */}
              <linearGradient id="meteor-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%"  stopColor="rgba(255,255,255,0)" />
                <stop offset="60%" stopColor="rgba(192,132,252,0.5)" />
                <stop offset="92%" stopColor="rgba(255,255,255,1)" />
                <stop offset="100%" stopColor="rgba(255,255,255,1)" />
              </linearGradient>

              {/* Solar flare (vertical) — bright violet→white fading up */}
              <linearGradient id="flare-grad" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%"  stopColor="rgba(255,255,255,0.95)" />
                <stop offset="15%" stopColor="rgba(167,139,250,0.85)" />
                <stop offset="55%" stopColor="rgba(139,92,246,0.45)" />
                <stop offset="100%" stopColor="rgba(76,29,149,0)" />
              </linearGradient>

              {/* IMPACT beam (horizontal) — bright white at origin, streaks right */}
              <linearGradient id="beam-x-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"  stopColor="rgba(255,255,255,0.95)" />
                <stop offset="15%" stopColor="rgba(167,139,250,0.85)" />
                <stop offset="55%" stopColor="rgba(139,92,246,0.45)" />
                <stop offset="100%" stopColor="rgba(76,29,149,0)" />
              </linearGradient>

              {/* X-axis gradient — bright white→violet, much more visible */}
              <linearGradient id="axis-x-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"  stopColor="rgba(255,255,255,0.95)" />
                <stop offset="40%" stopColor="rgba(192,132,252,0.85)" />
                <stop offset="100%" stopColor="rgba(139,92,246,0.45)" />
              </linearGradient>

              {/* Y-axis gradient — bright bottom (origin) fading up */}
              <linearGradient id="axis-y-grad" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%"  stopColor="rgba(255,255,255,0.95)" />
                <stop offset="40%" stopColor="rgba(192,132,252,0.85)" />
                <stop offset="100%" stopColor="rgba(139,92,246,0.45)" />
              </linearGradient>

              <filter id="node-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="0.8" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <filter id="flare-bloom" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="1.4" />
              </filter>

              <filter id="text-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="0.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Architectural grid — barely visible scaffolding */}
            {[20, 40, 60, 80].map(v => (
              <g key={v}>
                <line x1={v} y1="4" x2={v} y2="76" stroke="rgba(255,255,255,0.022)" strokeWidth="0.15" />
                <line x1="8" y1={v} x2="96" y2={v} stroke="rgba(255,255,255,0.022)" strokeWidth="0.15" />
              </g>
            ))}

            {/* ── X axis: STATIC SKELETON (always visible, dim) ──────────
                Renders even if GSAP ignition fails for any reason — first
                paint, tab unfocus, observer race. The animated overlay below
                paints a brighter ignited line on top. */}
            <line
              x1={ORIGIN_X} y1={ORIGIN_Y} x2="98" y2={ORIGIN_Y}
              stroke="rgba(167,139,250,0.40)"
              strokeWidth="0.45"
              strokeLinecap="round"
            />
            {/* X axis: animated ignited overlay — bright */}
            <line
              className="x-axis-line"
              x1={ORIGIN_X} y1={ORIGIN_Y} x2="98" y2={ORIGIN_Y}
              stroke="url(#axis-x-grad)"
              strokeWidth="0.55"
              strokeLinecap="round"
            />
            {/* X axis arrow — always visible, animated only brightens */}
            <polygon
              points="98,74.6 100.8,76 98,77.4"
              fill="rgba(167,139,250,0.55)"
            />
            <polygon
              className="x-axis-arrow"
              points="98,74.6 100.8,76 98,77.4"
              fill="rgba(192,132,252,0.95)"
            />
            <text
              x="98" y="79.6"
              textAnchor="end"
              fontSize="2.4"
              fill="rgba(192,132,252,0.95)"
              className="x-axis-label"
              style={{ fontFamily: "var(--font-jetbrains-mono), monospace", letterSpacing: "0.22em", fontWeight: 700 }}
            >
              {t("diagram.xaxis")}
            </text>
            {/* Static x-axis label fallback (always visible, dim) */}
            <text
              x="98" y="79.6"
              textAnchor="end"
              fontSize="2.4"
              fill="rgba(167,139,250,0.45)"
              style={{ fontFamily: "var(--font-jetbrains-mono), monospace", letterSpacing: "0.22em", fontWeight: 700 }}
            >
              {t("diagram.xaxis")}
            </text>

            {/* ── Y axis: STATIC SKELETON (always visible, dim) ─────────── */}
            <line
              x1={ORIGIN_X} y1={ORIGIN_Y} x2={ORIGIN_X} y2="2"
              stroke="rgba(167,139,250,0.40)"
              strokeWidth="0.45"
              strokeLinecap="round"
            />
            {/* Y axis: animated ignited overlay */}
            <line
              className="y-axis-line"
              x1={ORIGIN_X} y1={ORIGIN_Y} x2={ORIGIN_X} y2="2"
              stroke="url(#axis-y-grad)"
              strokeWidth="0.55"
              strokeLinecap="round"
            />
            <polygon
              points="6.6,2 8,-0.8 9.4,2"
              fill="rgba(167,139,250,0.55)"
            />
            <polygon
              className="y-axis-arrow"
              points="6.6,2 8,-0.8 9.4,2"
              fill="rgba(192,132,252,0.95)"
            />
            <text
              x={ORIGIN_X - 1.8} y="3"
              textAnchor="end"
              fontSize="2.4"
              fill="rgba(192,132,252,0.95)"
              className="y-axis-label"
              style={{ fontFamily: "var(--font-jetbrains-mono), monospace", letterSpacing: "0.22em", fontWeight: 700 }}
              transform={`rotate(-90, ${ORIGIN_X - 1.8}, 3)`}
            >
              {t("diagram.yaxis")}
            </text>
            {/* Static y-axis label fallback */}
            <text
              x={ORIGIN_X - 1.8} y="3"
              textAnchor="end"
              fontSize="2.4"
              fill="rgba(167,139,250,0.45)"
              style={{ fontFamily: "var(--font-jetbrains-mono), monospace", letterSpacing: "0.22em", fontWeight: 700 }}
              transform={`rotate(-90, ${ORIGIN_X - 1.8}, 3)`}
            >
              {t("diagram.yaxis")}
            </text>

            {/* ── Solar flare column (Y-axis, vertical) ──────────────────── */}
            <rect
              className="flare-column"
              x={ORIGIN_X - 0.75}
              y={ORIGIN_Y - 72}
              width="1.5"
              height="0"
              fill="url(#flare-grad)"
              filter="url(#flare-bloom)"
            />

            {[0, 1, 2].map(i => (
              <circle
                key={`flare-streamer-${i}`}
                className="flare-streamer"
                cx={ORIGIN_X + (i - 1) * 0.4}
                cy={ORIGIN_Y - 1}
                r={0.5 + i * 0.2}
                fill="rgba(255,255,255,0.9)"
                filter="url(#flare-bloom)"
              />
            ))}

            {/* ── IMPACT beam (X-axis, horizontal) — surges right after impact */}
            <rect
              className="beam-x"
              x={ORIGIN_X}
              y={ORIGIN_Y - 0.75}
              width="0"
              height="1.5"
              fill="url(#beam-x-grad)"
              filter="url(#flare-bloom)"
            />

            {/* Horizontal beam streamers — particles racing right */}
            {[0, 1, 2].map(i => (
              <circle
                key={`beam-streamer-${i}`}
                className="beam-streamer"
                cx={ORIGIN_X + 1}
                cy={ORIGIN_Y + (i - 1) * 0.4}
                r={0.5 + i * 0.2}
                fill="rgba(255,255,255,0.9)"
                filter="url(#flare-bloom)"
              />
            ))}

            {/* ── Meteor path ────────────────────────────────────────────── */}
            <path
              className="meteor-path"
              d={`M 120 -10 L ${ORIGIN_X} ${ORIGIN_Y}`}
              stroke="url(#meteor-grad)"
              strokeWidth="0.6"
              fill="none"
              strokeLinecap="round"
              filter="url(#flare-bloom)"
            />

            {/* ── Impact flash ───────────────────────────────────────────── */}
            <circle
              className="impact-flash"
              cx={ORIGIN_X} cy={ORIGIN_Y}
              r="6"
              fill="rgba(255,255,255,0.85)"
              filter="url(#flare-bloom)"
            />

            {/* Impact shards */}
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = (i / 12) * Math.PI * 2;
              const r = 4;
              return (
                <circle
                  key={`shard-${i}`}
                  className="impact-shard"
                  cx={ORIGIN_X + Math.cos(angle) * r}
                  cy={ORIGIN_Y + Math.sin(angle) * r}
                  r="0.3"
                  fill={i % 2 === 0 ? "rgba(255,255,255,0.95)" : "rgba(167,139,250,0.95)"}
                />
              );
            })}

            {/* ── Constellation lines ────────────────────────────────────── */}
            {CONNECTIONS.map(([from, to], i) => {
              const a = NODES[from];
              const b = NODES[to];
              const len = Math.hypot(b.cx - a.cx, b.cy - a.cy);
              return (
                <line
                  key={`con-${i}`}
                  className="constellation-line"
                  x1={a.cx} y1={a.cy} x2={b.cx} y2={b.cy}
                  stroke="rgba(167,139,250,0.40)"
                  strokeWidth="0.20"
                  strokeDasharray={len}
                  strokeDashoffset={len}
                />
              );
            })}

            {/* ── Coordinate ticks (visible during hover) ────────────────── */}
            {NODES.map((node, i) => (
              <g key={`ticks-${i}`}>
                <circle
                  className={`tick-x-${i}`}
                  cx={node.cx} cy={ORIGIN_Y}
                  r="0"
                  fill="rgba(192,132,252,0.95)"
                  opacity="0"
                  filter="url(#node-glow)"
                />
                <circle
                  className={`tick-y-${i}`}
                  cx={ORIGIN_X} cy={node.cy}
                  r="0"
                  fill="rgba(192,132,252,0.95)"
                  opacity="0"
                  filter="url(#node-glow)"
                />
              </g>
            ))}

            {/* ── Spark particles ───────────────────────────────────────── */}
            {NODES.map((_, i) => (
              <g key={`sparks-${i}`}>
                {Array.from({ length: 6 }).map((_, j) => (
                  <circle
                    key={`spark-${i}-${j}`}
                    className={`spark-${i}`}
                    cx={NODES[i].cx} cy={NODES[i].cy}
                    r="0"
                    fill={j % 2 === 0 ? "white" : "rgba(167,139,250,1)"}
                    opacity="0"
                    filter="url(#node-glow)"
                  />
                ))}
              </g>
            ))}

            {/* ── Nodes ──────────────────────────────────────────────────── */}
            {NODES.map((node, i) => (
              <g
                key={node.id}
                className={`node-group node-group-${i}`}
                style={{ transformOrigin: `${node.cx}px ${node.cy}px`, cursor: interactive ? "pointer" : "default" }}
                onMouseEnter={() => handleNodeHover(node.id, i, true)}
                onMouseLeave={() => handleNodeHover(node.id, i, false)}
                onClick={() => interactive && handleLaunch(node.route)}
              >
                <circle
                  className="node-halo"
                  cx={node.cx} cy={node.cy}
                  r="3.5"
                  fill="rgba(139,92,246,0.18)"
                  opacity="0.25"
                  filter="url(#node-glow)"
                />
                <circle
                  cx={node.cx} cy={node.cy}
                  r="2"
                  fill="none"
                  stroke="rgba(167,139,250,0.55)"
                  strokeWidth="0.20"
                />
                <circle
                  className="node-core"
                  cx={node.cx} cy={node.cy}
                  r="1.2"
                  fill="white"
                  filter="url(#node-glow)"
                />
                {/* Hit area */}
                <circle
                  cx={node.cx} cy={node.cy}
                  r="5"
                  fill="transparent"
                />
              </g>
            ))}

            {/* ── Bespoke font labels (SVG text — scales with viewBox) ── */}
            {NODES.map((node, i) => {
              const labelRight = node.cx > 55;
              const labelX = labelRight ? node.cx - 2.8 : node.cx + 2.8;
              const labelY = node.cy - 2.6;
              const isHov = hovered === node.id;
              return (
                <text
                  key={`label-${node.id}`}
                  className={`node-label node-label-${i}`}
                  x={labelX}
                  y={labelY}
                  textAnchor={labelRight ? "end" : "start"}
                  fontSize={node.fontSize}
                  fill={isHov ? "rgba(255,255,255,0.98)" : "rgba(255,255,255,0.85)"}
                  filter="url(#text-glow)"
                  style={{
                    fontFamily: node.fontVar,
                    fontWeight: node.fontWeight,
                    fontStyle: node.italic ? "italic" : "normal",
                    letterSpacing: node.letterSpacing,
                    pointerEvents: "none",
                    transition: "fill 0.18s",
                  }}
                >
                  {t(`product.${node.id}.name`)}
                </text>
              );
            })}
          </svg>

          {/* ── Description card overlay (desktop) ──────────────────────── */}
          {interactive && hovered && (() => {
            const idx = NODES.findIndex(n => n.id === hovered);
            if (idx < 0) return null;
            const node = NODES[idx];
            const product = PRODUCTS[idx];
            const { side, vert } = cardPositionFor(node);

            const leftPct = (node.cx / 100) * 100;
            const topPct = (node.cy / 80) * 100;

            const cardStyle: React.CSSProperties = {
              position: "absolute",
              left: `${leftPct}%`,
              top: `${topPct}%`,
              transform: `translate(${side === "left" ? "-110%" : "10%"}, ${vert === "above" ? "-110%" : "10%"})`,
              width: "min(220px, 80vw)",
              pointerEvents: "auto",
              zIndex: 30,
            };

            return (
              <div style={cardStyle} className="hidden md:block">
                <div
                  className="relative p-4"
                  style={{
                    background: "rgba(13,11,20,0.92)",
                    backdropFilter: "blur(20px) saturate(140%)",
                    border: "1px solid rgba(167,139,250,0.30)",
                    boxShadow: "0 24px 60px rgba(76,29,149,0.35), inset 0 0 0 1px rgba(255,255,255,0.04)",
                    borderRadius: "4px",
                  }}
                >
                  <span style={{ position: "absolute", top: -1, left: -1, width: 10, height: 1, background: "linear-gradient(90deg, #c4b5fd, transparent)" }} />
                  <span style={{ position: "absolute", top: -1, left: -1, width: 1, height: 10, background: "linear-gradient(180deg, #c4b5fd, transparent)" }} />
                  <span style={{ position: "absolute", bottom: -1, right: -1, width: 10, height: 1, background: "linear-gradient(270deg, #c4b5fd, transparent)" }} />
                  <span style={{ position: "absolute", bottom: -1, right: -1, width: 1, height: 10, background: "linear-gradient(0deg, #c4b5fd, transparent)" }} />

                  <div
                    className="mb-1.5"
                    style={{
                      fontFamily: node.fontVar,
                      fontWeight: node.fontWeight,
                      fontStyle: node.italic ? "italic" : "normal",
                      letterSpacing: node.letterSpacing ?? "normal",
                      fontSize: "1.05rem",
                      color: "white",
                      lineHeight: 1.1,
                    }}
                  >
                    {product.name}
                  </div>
                  <p style={{ fontSize: "11px", color: "rgba(220,215,240,0.70)", lineHeight: 1.5, marginBottom: 12 }}>
                    {product.description}
                  </p>
                  <button
                    onClick={() => handleLaunch(node.route)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium"
                    style={{
                      color: "#0d0b14",
                      borderRadius: "3px",
                      padding: "4px 10px",
                      background: "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(192,132,252,0.85))",
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>{lang === "ja" ? "開く" : "Launch"}</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            );
          })()}
        </div>

        {/* ── Mobile description sheet ───────────────────────────────── */}
        {interactive && hovered && (() => {
          const idx = NODES.findIndex(n => n.id === hovered);
          if (idx < 0) return null;
          const node = NODES[idx];
          const product = PRODUCTS[idx];
          return (
            <div className="md:hidden fixed bottom-4 left-4 right-4 z-30">
              <div
                className="relative p-4"
                style={{
                  background: "rgba(13,11,20,0.95)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(167,139,250,0.30)",
                  boxShadow: "0 24px 60px rgba(76,29,149,0.40)",
                  borderRadius: "4px",
                }}
              >
                <div
                  className="mb-1.5"
                  style={{
                    fontFamily: node.fontVar,
                    fontWeight: node.fontWeight,
                    fontStyle: node.italic ? "italic" : "normal",
                    letterSpacing: node.letterSpacing ?? "normal",
                    fontSize: "clamp(1rem, 4.5vw, 1.25rem)",
                    color: "white",
                    lineHeight: 1.1,
                  }}
                >
                  {product.name}
                </div>
                <p style={{ fontSize: "12px", color: "rgba(220,215,240,0.70)", lineHeight: 1.5, marginBottom: 12 }}>
                  {product.description}
                </p>
                <button
                  onClick={() => handleLaunch(node.route)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium"
                  style={{
                    color: "#0d0b14",
                    borderRadius: "3px",
                    padding: "6px 14px",
                    background: "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(192,132,252,0.85))",
                  }}
                >
                  <span style={{ fontWeight: 600 }}>{lang === "ja" ? "開く" : "Launch"}</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          );
        })()}

        {/* Hint */}
        <div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] uppercase pointer-events-none"
          style={{
            color: interactive ? "rgba(167,139,250,0.55)" : "rgba(255,255,255,0.25)",
            letterSpacing: "0.24em",
            transition: "color 0.5s",
            fontFamily: "var(--font-jetbrains-mono), monospace",
          }}
        >
          {interactive ? t("diagram.click") : t("diagram.scroll")}
        </div>
      </div>

      <style jsx>{`
        @keyframes axisFlashIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </section>
  );
}
