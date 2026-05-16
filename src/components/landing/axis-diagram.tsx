"use client";

/**
 * Supernova Axis Diagram — scroll-driven via GSAP ScrollTrigger
 *
 * The section pins to the top of the viewport while the user scrolls through
 * ~1400px of scroll distance. Every element is driven 1:1 by scroll position
 * (scrub: 0.4) so the user is always in control.
 *
 * Scroll sequence:
 *   0–6%    Meteor enters from top-right → IMPACT flash at origin
 *   6–75%   X-axis + Y-axis + all constellation lines extend SIMULTANEOUSLY
 *   60–95%  Nodes scale in with slight stagger
 *   95–100% Interactive mode unlocks (hover / click / warp)
 *
 * Hover a node: supernova scale, 6 sparks race to axes, coordinate ticks appear
 * Click Launch: viewport flashes white-violet, warp transition fires
 *
 * NOTE: labels use SVG <text> (not foreignObject) so they scale with the
 * viewBox. foreignObject HTML gets multiplied by the viewBox→pixel ratio,
 * making rem-sized text enormous on wide screens.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLanguage } from "@/contexts/language-context";
import { triggerWarp } from "@/components/animation/warp-transition";

gsap.registerPlugin(ScrollTrigger);

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
  { id: "calendar",      route: "/calendar",      cx: 22, cy: 70, fontVar: "var(--font-plex-mono)",       fontWeight: 500, letterSpacing: "0.04em", fontSize: 2.4 },
  { id: "resources",     route: "/resources",     cx: 38, cy: 56, fontVar: "var(--font-instrument)",      fontWeight: 400, italic: true, letterSpacing: "-0.01em", fontSize: 3.2 },
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

  const PRODUCTS = NODES.map(node => ({
    ...node,
    name:        t(`product.${node.id}.name`),
    description: t(`product.${node.id}.desc`),
  }));

  // ── Scroll-driven timeline ─────────────────────────────────────────────
  // Section pins as user scrolls in. The timeline scrubs with scroll position
  // (1:1 with `scrub: 1`), so the user controls the pace.
  //
  // KEY CHANGE FROM AUTOPLAY VERSION: X-axis line + Y-axis line + all
  // constellation lines + X-beam + Y-flare all extend SIMULTANEOUSLY during
  // the main 6-75% scroll segment. No more sequential ignition.
  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Initial state — everything hidden / collapsed
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
      // Set each constellation line's dasharray to its actual SVG length so the
      // draw-on-scroll effect spans the full animation duration (not just a pop).
      CONNECTIONS.forEach(([from, to], i) => {
        const len = Math.hypot(NODES[to].cx - NODES[from].cx, NODES[to].cy - NODES[from].cy);
        gsap.set(`.constellation-line-${i}`, { strokeDasharray: len, strokeDashoffset: len, opacity: 0 });
      });
      NODES.forEach((_, i) => {
        gsap.set(`.node-group-${i}`, { scale: 0, opacity: 0, transformOrigin: "center center" });
        gsap.set(`.node-label-${i}`, { opacity: 0, y: 4 });
      });

      // ── Master scroll-scrubbed timeline ────────────────────────────────
      // Section pins while user scrolls 2200px. Everything is sequential:
      //   Phase 1 (0–8%)    : Meteor streaks in + IMPACT at origin
      //   Phase 2 (8–38%)   : X-axis draws left → right
      //   Phase 3 (38–65%)  : Y-axis draws bottom → top
      //   Phase 4 (65–100%) : Nodes pop in one-by-one, each connecting line
      //                       draws immediately after its two nodes appear
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=2200",
          pin: true,
          scrub: 0.4,
          anticipatePin: 1,
        },
      });

      // ── Phase 1: Meteor + IMPACT (0 → 0.8) ─────────────────────────
      tl.to(".meteor-path", {
        strokeDashoffset: 0,
        duration: 0.6,
        ease: "power2.in",
      }, 0);
      tl.to(".impact-flash", { opacity: 0.7, duration: 0.08 }, 0.6);
      tl.to(".impact-flash", { opacity: 0,   duration: 0.32, ease: "power2.in" }, 0.68);
      tl.to(".impact-shard", {
        attr: { r: 2.5 }, opacity: 0,
        stagger: 0.004, duration: 0.45, ease: "power3.out",
      }, 0.6);

      // ── Phase 2: X-axis draws (0.8 → 3.8) ─────────────────────────
      const X_START = 0.8;
      const X_DUR   = 3.0;

      tl.to(".x-axis-line", {
        strokeDashoffset: 0, duration: X_DUR, ease: "none",
      }, X_START);
      // Beam races ahead of the line tip like a pulse
      tl.to(".beam-x", {
        attr: { width: 90 }, duration: X_DUR, ease: "none",
      }, X_START);
      tl.to(".beam-x", { opacity: 0.35, duration: X_DUR * 0.5 }, X_START + X_DUR * 0.5);
      tl.fromTo(".beam-streamer",
        { attr: { cx: ORIGIN_X + 1 }, opacity: 0.9 },
        { attr: { cx: 95 }, opacity: 0, duration: X_DUR, stagger: 0.18, ease: "power2.out" },
        X_START);
      // Arrow + label appear at the very end of the X draw
      tl.to(".x-axis-arrow, .x-axis-label", { opacity: 1, duration: 0.4 }, X_START + X_DUR - 0.3);

      // ── Phase 3: Y-axis draws (3.8 → 6.5) ─────────────────────────
      const Y_START = X_START + X_DUR + 0.0;
      const Y_DUR   = 2.7;

      tl.to(".y-axis-line", {
        strokeDashoffset: 0, duration: Y_DUR, ease: "none",
      }, Y_START);
      tl.to(".flare-column", {
        attr: { height: 72 }, duration: Y_DUR, ease: "none",
      }, Y_START);
      tl.to(".flare-column", { opacity: 0.35, duration: Y_DUR * 0.5 }, Y_START + Y_DUR * 0.5);
      tl.fromTo(".flare-streamer",
        { attr: { cy: ORIGIN_Y - 1 }, opacity: 0.9 },
        { attr: { cy: 5 }, opacity: 0, duration: Y_DUR, stagger: 0.18, ease: "power2.out" },
        Y_START);
      tl.to(".y-axis-arrow, .y-axis-label", { opacity: 1, duration: 0.4 }, Y_START + Y_DUR - 0.3);

      // ── Phase 4: nodes one-by-one + connecting lines (6.5 → 10) ───
      // Each node gets an equal slice of the remaining scroll budget.
      // The constellation line between node[i] and node[i+1] draws
      // right after node[i+1] appears.
      const N_START    = Y_START + Y_DUR + 0.2;
      const N_BUDGET   = 3.8;
      const SLOT       = N_BUDGET / NODES.length;   // time per node

      NODES.forEach((_, i) => {
        const t0 = N_START + i * SLOT;

        // Node pops in
        tl.to(`.node-group-${i}`, {
          scale: 1, opacity: 1,
          duration: SLOT * 0.55,
          ease: "back.out(2.2)",
        }, t0);
        tl.to(`.node-label-${i}`, {
          opacity: 1, y: 0,
          duration: SLOT * 0.4,
          ease: "power2.out",
        }, t0 + SLOT * 0.15);

        // Draw every connection whose SECOND endpoint is node i.
        // The line is ready once both its endpoints are visible.
        CONNECTIONS.forEach(([, to], lineIdx) => {
          if (to !== i) return;
          tl.to(`.constellation-line-${lineIdx}`, {
            strokeDashoffset: 0,
            opacity: 0.22,
            duration: SLOT * 0.65,
            ease: "power1.out",
          }, t0 + SLOT * 0.25);
        });
      });

      // Unlock interactivity after last node
      tl.call(() => setInteractive(true), [], N_START + N_BUDGET - 0.1);
    }, sectionRef);

    return () => ctx.revert();
  }, []);

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
    <>
      {/* ── Gap OUTSIDE the pin — separates hero from the pinned section.
          This space scrolls normally and is never locked by ScrollTrigger. */}
      <div className="h-[28vh] min-h-[160px]" aria-hidden="true" />

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

      {/* ── Pinned section — exactly 100vh tall so when ScrollTrigger locks it
          the graph is centered in the viewport from the very first frame. */}
      <section
        id="axis-diagram"
        ref={sectionRef}
        className="relative z-10 w-full"
        style={{ height: "100vh" }}
      >
        {/* Inner flex column — centers heading + diagram vertically */}
        <div
          className="w-full h-full flex flex-col items-center justify-center px-4"
          style={{ gap: "0.75rem" }}
        >

      {/* ── Heading ────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 text-center">
        <h2
          className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white"
          style={{ letterSpacing: "-0.04em", lineHeight: 1.05 }}
        >
          {t("diagram.heading")}{" "}
          <span className="gradient-text">{t("diagram.heading.accent")}</span>
        </h2>
        <p
          className="mt-2 text-sm sm:text-base mx-auto max-w-xl"
          style={{ color: "var(--text-secondary)" }}
        >
          {t("diagram.subtext")}
        </p>
      </div>

      {/* ── Diagram — fills the remaining height, never overflows viewport */}
      <div className="relative flex-1 w-full flex items-center justify-center min-h-0">
        <div
          className="relative w-full"
          style={{
            maxWidth: "min(860px, 92vw)",
            /* Keep the SVG within the flex container's remaining height */
            maxHeight: "calc(100vh - 180px)",
            aspectRatio: "100 / 80",
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
              return (
                <line
                  key={`con-${i}`}
                  className={`constellation-line constellation-line-${i}`}
                  x1={a.cx} y1={a.cy} x2={b.cx} y2={b.cy}
                  stroke="rgba(167,139,250,0.40)"
                  strokeWidth="0.22"
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
                <div className="liquid-glass-strong relative p-4" style={{ borderRadius: 4 }}>
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
              <div className="liquid-glass-strong relative p-4" style={{ borderRadius: 4 }}>
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

        {/* Scroll / click hint — sits at the bottom of the diagram area */}
        <div
          className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] uppercase pointer-events-none"
          style={{
            color: interactive ? "rgba(167,139,250,0.55)" : "rgba(255,255,255,0.25)",
            letterSpacing: "0.24em",
            transition: "color 0.5s",
            fontFamily: "var(--font-jetbrains-mono), monospace",
          }}
        >
          {interactive ? t("diagram.click") : t("diagram.scroll")}
        </div>
      </div>   {/* end diagram flex wrapper */}
        </div> {/* end inner flex column */}
      </section>

      <style jsx>{`
        @keyframes axisFlashIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  );
}
