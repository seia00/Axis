"use client";

/**
 * Supernova Axis Diagram
 *
 * Cinematic title-card animation that fires once when the section enters view:
 *   T+0.0s   Section enters viewport
 *   T+0.2s   Meteor enters from top-right, streaks toward origin
 *   T+0.7s   IMPACT — explosion at origin, X-axis ignites left→right
 *   T+1.1s   Solar flare surges upward, Y-axis ignites bottom→top
 *   T+1.6s   Constellation lines draw between connected nodes
 *   T+1.7s   Nodes spawn one by one, each with bespoke typography
 *   T+2.6s   Interactive mode unlocked
 *
 * Hover/tap a node: scale → 1.8 supernova, 6 sparks shoot to X/Y axes
 *  highlighting the node's coordinates, and an anchored description card
 *  materializes showing name/description/Launch CTA.
 *
 * Click Launch: viewport flashes white-violet, route changes.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { useLanguage } from "@/contexts/language-context";
import { triggerWarp } from "@/components/animation/warp-transition";

// ─── Product nodes ────────────────────────────────────────────────────────────
//
// Position is in viewBox units (0-100 horizontal, 0-80 vertical, origin at 8,76).
// `font` controls the bespoke typography — we use CSS variables wired in
// layout.tsx via next/font/google so each node feels like a different brand.

interface NodeDef {
  id: string;
  route: string;
  cx: number;
  cy: number;
  /** CSS variable name set by next/font/google in layout.tsx */
  fontVar: string;
  /** Font weight + transform for extra personality */
  fontWeight: number;
  italic?: boolean;
  letterSpacing?: string;
}

const NODES: NodeDef[] = [
  // Directory — technical, alphabetical lookup feel
  { id: "directory",     route: "/directory",     cx: 20, cy: 75, fontVar: "var(--font-plex-mono)",       fontWeight: 500, letterSpacing: "0.02em" },
  // Network — editorial, human-feeling serif
  { id: "network",       route: "/network",       cx: 38, cy: 58, fontVar: "var(--font-instrument)",      fontWeight: 400, italic: true, letterSpacing: "-0.01em" },
  // Opportunities — italic momentum
  { id: "opportunities", route: "/opportunities", cx: 52, cy: 48, fontVar: "var(--font-inter)",           fontWeight: 600, italic: true, letterSpacing: "-0.02em" },
  // Match — AI/data product, monospace
  { id: "match",         route: "/match",         cx: 58, cy: 28, fontVar: "var(--font-jetbrains-mono)",  fontWeight: 600, letterSpacing: "0.04em" },
  // Launchpad — heavy display
  { id: "launchpad",     route: "/launchpad",     cx: 68, cy: 35, fontVar: "var(--font-inter)",           fontWeight: 800, letterSpacing: "-0.04em" },
  // Ventures — futuristic display
  { id: "ventures",      route: "/ventures",      cx: 82, cy: 22, fontVar: "var(--font-space-grotesk)",   fontWeight: 700, letterSpacing: "-0.03em" },
];

// Constellation connections — index pairs
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
  const { t } = useLanguage();

  const [interactive, setInteractive] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [flashing, setFlashing] = useState(false);
  const ignitedRef = useRef(false);

  const PRODUCTS = NODES.map(node => ({
    ...node,
    name:        t(`product.${node.id}.name`),
    description: t(`product.${node.id}.desc`),
  }));

  // ── Master ignition timeline ────────────────────────────────────────────
  const ignite = useCallback(() => {
    if (ignitedRef.current) return;
    ignitedRef.current = true;

    const tl = gsap.timeline();

    // ── Phase 1: Meteor (T+0.2 → T+0.7) ────────────────────────────────
    tl.to(".meteor-path", {
      strokeDashoffset: 0,
      duration: 0.5,
      ease: "power2.in",
      delay: 0.2,
    });

    // ── Phase 2: IMPACT — explosion + X-axis ignition (T+0.7) ───────────
    tl.to(".impact-flash", {
      opacity: 0.55,
      duration: 0.08,
      ease: "power2.out",
    });
    tl.to(".impact-flash", {
      opacity: 0,
      duration: 0.45,
      ease: "power2.in",
    });

    // Spawn 12 explosion shards
    tl.to(".impact-shard", {
      attr: { r: 2.5 },
      opacity: 0,
      stagger: 0.005,
      duration: 0.7,
      ease: "power3.out",
    }, "<");

    // X-axis ignites left→right
    tl.to(".x-axis-line", {
      strokeDashoffset: 0,
      duration: 0.5,
      ease: "power2.out",
    }, "<+0.05");
    tl.to(".x-axis-arrow, .x-axis-label", {
      opacity: 1,
      duration: 0.3,
    }, "-=0.15");

    // ── Phase 3: Solar flare (Y-axis) (T+1.1) ───────────────────────────
    tl.to(".flare-column", {
      attr: { height: 72 },
      duration: 0.45,
      ease: "power3.out",
    }, "+=0.05");
    tl.to(".flare-column", {
      opacity: 0.45,
      duration: 0.5,
      ease: "power2.in",
    }, "+=0.1");

    // Y-axis line catches fire after the flare
    tl.to(".y-axis-line", {
      strokeDashoffset: 0,
      duration: 0.45,
      ease: "power2.out",
    }, "-=0.6");
    tl.to(".y-axis-arrow, .y-axis-label", {
      opacity: 1,
      duration: 0.3,
    }, "-=0.15");

    // Flare streamers — three rising particles
    tl.fromTo(".flare-streamer",
      { attr: { cy: ORIGIN_Y - 1 }, opacity: 0.9 },
      {
        attr: { cy: 5 },
        opacity: 0,
        duration: 1.3,
        stagger: 0.12,
        ease: "power2.out",
      },
      "-=0.8");

    // ── Phase 4: Constellation lines (T+1.6) ────────────────────────────
    tl.to(".constellation-line", {
      strokeDashoffset: 0,
      opacity: 0.18,
      duration: 0.5,
      stagger: 0.06,
      ease: "none",
    }, "+=0.05");

    // ── Phase 5: Node spawn (T+1.7) ─────────────────────────────────────
    NODES.forEach((_, i) => {
      tl.to(`.node-group-${i}`, {
        scale: 1,
        opacity: 1,
        duration: 0.45,
        ease: "back.out(2.4)",
      }, i === 0 ? "+=0" : "<+0.12");
      tl.to(`.node-label-${i}`, {
        opacity: 1,
        y: 0,
        duration: 0.35,
        ease: "power2.out",
      }, "<+0.1");
    });

    // ── Phase 6: Fade axes back to idle, unlock interactive (T+2.6) ─────
    tl.to(".x-axis-line, .y-axis-line", {
      opacity: 0.35,
      duration: 0.5,
    }, "+=0.2");
    tl.call(() => setInteractive(true));
  }, []);

  // ── Set initial state + intersection observer ───────────────────────────
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hide everything initially
      gsap.set(".meteor-path", { strokeDasharray: 200, strokeDashoffset: 200 });
      gsap.set(".impact-flash", { opacity: 0 });
      gsap.set(".impact-shard", { attr: { r: 0.3 }, opacity: 1 });
      gsap.set(".flare-column", { attr: { height: 0 }, opacity: 1 });
      gsap.set(".flare-streamer", { opacity: 0 });
      gsap.set(".x-axis-line", { strokeDasharray: 100, strokeDashoffset: 100, opacity: 1 });
      gsap.set(".y-axis-line", { strokeDasharray: 100, strokeDashoffset: 100, opacity: 1 });
      gsap.set(".x-axis-arrow, .y-axis-arrow, .x-axis-label, .y-axis-label", { opacity: 0 });
      gsap.set(".constellation-line", { strokeDasharray: 100, strokeDashoffset: 100, opacity: 0 });
      NODES.forEach((_, i) => {
        gsap.set(`.node-group-${i}`, { scale: 0, opacity: 0, transformOrigin: "center center" });
        gsap.set(`.node-label-${i}`, { opacity: 0, y: 6 });
      });
    }, sectionRef);

    // Trigger ignition once when 40% of section is in view
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) ignite();
      },
      { threshold: 0.4 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);

    return () => {
      ctx.revert();
      observer.disconnect();
    };
  }, [ignite]);

  // ── Hover supernova: spark particles + glow ─────────────────────────────
  const handleNodeHover = useCallback((nodeId: string, idx: number, isEnter: boolean) => {
    if (!interactive) return;
    setHovered(isEnter ? nodeId : null);
    const node = NODES[idx];
    if (!node) return;

    if (isEnter) {
      // Scale up
      gsap.to(`.node-group-${idx} .node-core`, {
        attr: { r: 1.8 },
        duration: 0.22,
        ease: "back.out(2)",
      });
      gsap.to(`.node-group-${idx} .node-halo`, {
        attr: { r: 8 },
        opacity: 0.55,
        duration: 0.32,
        ease: "power2.out",
      });

      // Spark particles → 3 to X-axis (vertical drop), 3 to Y-axis (horizontal slide)
      const sparks = svgRef.current?.querySelectorAll(`.spark-${idx}`);
      if (sparks) {
        sparks.forEach((spark, i) => {
          const goY = i < 3;          // first 3 → drop to X-axis
          const targetX = goY ? node.cx : ORIGIN_X;
          const targetY = goY ? ORIGIN_Y : node.cy;
          gsap.fromTo(spark,
            {
              attr: { cx: node.cx, cy: node.cy, r: 0.6 },
              opacity: 1,
            },
            {
              attr: { cx: targetX, cy: targetY, r: 0.4 },
              opacity: 0,
              duration: 0.55 + i * 0.05,
              ease: "power2.in",
              delay: i * 0.02,
            }
          );
        });
      }

      // Coordinate ticks light up briefly
      gsap.fromTo(`.tick-x-${idx}`,
        { opacity: 0, attr: { r: 0 } },
        { opacity: 1, attr: { r: 0.9 }, duration: 0.5, delay: 0.5, ease: "power2.out" }
      );
      gsap.fromTo(`.tick-y-${idx}`,
        { opacity: 0, attr: { r: 0 } },
        { opacity: 1, attr: { r: 0.9 }, duration: 0.5, delay: 0.5, ease: "power2.out" }
      );
      gsap.to(`.tick-x-${idx}, .tick-y-${idx}`, {
        opacity: 0,
        duration: 0.4,
        delay: 1.4,
        ease: "power2.in",
      });
    } else {
      // Restore
      gsap.to(`.node-group-${idx} .node-core`, {
        attr: { r: 1.2 },
        duration: 0.25,
        ease: "power2.out",
      });
      gsap.to(`.node-group-${idx} .node-halo`, {
        attr: { r: 3.5 },
        opacity: 0.25,
        duration: 0.25,
      });
    }
  }, [interactive]);

  // ── Launch: warp + flash + route ────────────────────────────────────────
  const handleLaunch = useCallback((route: string, originX?: number, originY?: number) => {
    if (!interactive) return;
    // Fire warp event so SpaceBackground stars accelerate radially outward
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
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
      pulses.push(tween);
    });
    return () => { pulses.forEach(p => p.kill()); };
  }, [interactive]);

  // ── Card position: choose quadrant that avoids viewport edge ────────────
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
      style={{ minHeight: "min(100vh, 880px)" }}
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

      <div className="relative w-full h-screen flex items-center justify-center px-4">

        {/* SVG diagram — bleeds off into the void via overflow:visible */}
        <div className="relative w-full max-w-5xl mx-auto" style={{ aspectRatio: "1 / 0.75" }}>
          <svg
            ref={svgRef}
            viewBox="0 0 100 80"
            className="w-full h-full"
            style={{ overflow: "visible" }}
          >
            <defs>
              {/* Meteor gradient — white core fading to violet then transparent */}
              <linearGradient id="meteor-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%"  stopColor="rgba(255,255,255,0)" />
                <stop offset="60%" stopColor="rgba(192,132,252,0.4)" />
                <stop offset="92%" stopColor="rgba(255,255,255,1)" />
                <stop offset="100%" stopColor="rgba(255,255,255,1)" />
              </linearGradient>

              {/* Solar flare gradient — bright violet bottom fading up */}
              <linearGradient id="flare-grad" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%"  stopColor="rgba(255,255,255,0.95)" />
                <stop offset="15%" stopColor="rgba(167,139,250,0.85)" />
                <stop offset="55%" stopColor="rgba(139,92,246,0.45)" />
                <stop offset="100%" stopColor="rgba(76,29,149,0)" />
              </linearGradient>

              {/* Axis gradient — white→violet ignited line */}
              <linearGradient id="axis-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"  stopColor="rgba(255,255,255,0.85)" />
                <stop offset="40%" stopColor="rgba(167,139,250,0.65)" />
                <stop offset="100%" stopColor="rgba(139,92,246,0.20)" />
              </linearGradient>

              {/* Glow filter for nodes/halos */}
              <filter id="node-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="0.8" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Heavy bloom for flare/meteor */}
              <filter id="flare-bloom" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="1.4" />
              </filter>
            </defs>

            {/* ── Architectural grid (very faint) ────────────────────────── */}
            {[20, 40, 60, 80].map(v => (
              <g key={v}>
                <line x1={v} y1="4" x2={v} y2="76" stroke="rgba(255,255,255,0.018)" strokeWidth="0.15" />
                <line x1="8" y1={v} x2="96" y2={v} stroke="rgba(255,255,255,0.018)" strokeWidth="0.15" />
              </g>
            ))}

            {/* ── X axis ─────────────────────────────────────────────────── */}
            <line
              className="x-axis-line"
              x1={ORIGIN_X} y1={ORIGIN_Y} x2="98" y2={ORIGIN_Y}
              stroke="url(#axis-grad)"
              strokeWidth="0.45"
              strokeLinecap="round"
            />
            <polygon
              className="x-axis-arrow"
              points="98,74.8 100.5,76 98,77.2"
              fill="rgba(167,139,250,0.55)"
            />
            <text
              x="100" y="79.5"
              textAnchor="end"
              fontSize="2.4"
              fill="rgba(167,139,250,0.55)"
              className="x-axis-label"
              style={{ fontFamily: "var(--font-jetbrains-mono), monospace", letterSpacing: "0.18em", fontWeight: 600 }}
            >
              {t("diagram.xaxis")}
            </text>

            {/* ── Y axis ─────────────────────────────────────────────────── */}
            <line
              className="y-axis-line"
              x1={ORIGIN_X} y1={ORIGIN_Y} x2={ORIGIN_X} y2="2"
              stroke="url(#axis-grad)"
              strokeWidth="0.45"
              strokeLinecap="round"
            />
            <polygon
              className="y-axis-arrow"
              points="6.8,2 8,-0.5 9.2,2"
              fill="rgba(167,139,250,0.55)"
            />
            <text
              x={ORIGIN_X - 2} y="4"
              textAnchor="end"
              fontSize="2.4"
              fill="rgba(167,139,250,0.55)"
              className="y-axis-label"
              style={{
                fontFamily: "var(--font-jetbrains-mono), monospace",
                letterSpacing: "0.18em",
                fontWeight: 600,
              }}
              transform={`rotate(-90, ${ORIGIN_X - 2}, 4)`}
            >
              {t("diagram.yaxis")}
            </text>

            {/* ── Solar flare column ─────────────────────────────────────── */}
            <rect
              className="flare-column"
              x={ORIGIN_X - 0.75}
              y={ORIGIN_Y - 72}
              width="1.5"
              height="0"
              fill="url(#flare-grad)"
              filter="url(#flare-bloom)"
            />

            {/* Flare ascending streamers */}
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

            {/* Impact shards radiating out */}
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
                  stroke="rgba(167,139,250,0.30)"
                  strokeWidth="0.18"
                  strokeDasharray={len}
                  strokeDashoffset={len}
                />
              );
            })}

            {/* ── Coordinate ticks (visible during hover supernova) ──────── */}
            {NODES.map((node, i) => (
              <g key={`ticks-${i}`}>
                <circle
                  className={`tick-x-${i}`}
                  cx={node.cx} cy={ORIGIN_Y}
                  r="0"
                  fill="rgba(167,139,250,0.95)"
                  opacity="0"
                  filter="url(#node-glow)"
                />
                <circle
                  className={`tick-y-${i}`}
                  cx={ORIGIN_X} cy={node.cy}
                  r="0"
                  fill="rgba(167,139,250,0.95)"
                  opacity="0"
                  filter="url(#node-glow)"
                />
              </g>
            ))}

            {/* ── Spark particles (one set per node) ────────────────────── */}
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
                {/* Halo */}
                <circle
                  className="node-halo"
                  cx={node.cx} cy={node.cy}
                  r="3.5"
                  fill="rgba(139,92,246,0.18)"
                  opacity="0.25"
                  filter="url(#node-glow)"
                />
                {/* Ring */}
                <circle
                  cx={node.cx} cy={node.cy}
                  r="2"
                  fill="none"
                  stroke="rgba(167,139,250,0.50)"
                  strokeWidth="0.18"
                />
                {/* Core */}
                <circle
                  className="node-core"
                  cx={node.cx} cy={node.cy}
                  r="1.2"
                  fill="white"
                  filter="url(#node-glow)"
                />

                {/* Hit area — invisible larger circle for easier targeting */}
                <circle
                  cx={node.cx} cy={node.cy}
                  r="5"
                  fill="transparent"
                />
              </g>
            ))}

            {/* ── Bespoke font labels (foreignObject for real CSS fonts) ─ */}
            {NODES.map((node, i) => {
              const labelRight = node.cx > 50;
              const fx = labelRight ? node.cx - 18 : node.cx + 2.5;
              const fy = node.cy - 5.5;
              return (
                <foreignObject
                  key={`label-${node.id}`}
                  className={`node-label node-label-${i}`}
                  x={fx} y={fy}
                  width="18" height="4"
                  style={{ overflow: "visible", pointerEvents: "none" }}
                >
                  <div
                    style={{
                      fontFamily: node.fontVar,
                      fontWeight: node.fontWeight,
                      fontStyle: node.italic ? "italic" : "normal",
                      letterSpacing: node.letterSpacing ?? "normal",
                      fontSize: "clamp(0.55rem, 1.6vw, 0.85rem)",
                      color: hovered === node.id ? "rgba(255,255,255,0.98)" : "rgba(255,255,255,0.78)",
                      textAlign: labelRight ? "right" : "left",
                      lineHeight: 1.0,
                      whiteSpace: "nowrap",
                      textShadow: "0 0 12px rgba(139,92,246,0.35)",
                      transition: "color 0.18s",
                    }}
                  >
                    {t(`product.${node.id}.name`)}
                  </div>
                </foreignObject>
              );
            })}
          </svg>

          {/* ── Description card overlay (desktop) ────────────────────────
                Anchored to hovered node, uses the bespoke font for the name
                and offers a Launch CTA. */}
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
                    background: "rgba(13,11,20,0.88)",
                    backdropFilter: "blur(20px) saturate(140%)",
                    border: "1px solid rgba(167,139,250,0.30)",
                    boxShadow: "0 24px 60px rgba(76,29,149,0.35), inset 0 0 0 1px rgba(255,255,255,0.04)",
                    borderRadius: "4px",
                  }}
                >
                  {/* Chromatic edge accents */}
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
                  <p
                    className="mb-3"
                    style={{
                      fontSize: "11px",
                      color: "rgba(220,215,240,0.65)",
                      lineHeight: 1.5,
                    }}
                  >
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
                    <span style={{ fontWeight: 600 }}>Launch</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            );
          })()}
        </div>

        {/* ── Mobile description sheet — bottom anchored ─────────────── */}
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
                <p style={{ fontSize: "12px", color: "rgba(220,215,240,0.65)", lineHeight: 1.5, marginBottom: 12 }}>
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
                  <span style={{ fontWeight: 600 }}>Launch</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          );
        })()}

        {/* Hint text — fades out once interactive */}
        <div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] uppercase"
          style={{
            color: interactive ? "rgba(167,139,250,0.40)" : "rgba(255,255,255,0.20)",
            letterSpacing: "0.22em",
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
