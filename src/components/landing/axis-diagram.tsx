"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLanguage } from "@/contexts/language-context";

gsap.registerPlugin(ScrollTrigger);

const PRODUCT_NODES = [
  { id: "directory",     route: "/directory",     cx: 20, cy: 75 },
  { id: "network",       route: "/network",        cx: 38, cy: 58 },
  { id: "opportunities", route: "/opportunities",  cx: 52, cy: 48 },
  { id: "launchpad",     route: "/launchpad",      cx: 68, cy: 35 },
  { id: "ventures",      route: "/ventures",       cx: 82, cy: 22 },
  { id: "match",         route: "/match",          cx: 58, cy: 28 },
];

// Constellation connections [fromIndex, toIndex]
const CONNECTIONS = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [2, 5],
  [4, 5],
];

// Accent violet — single color for all dots
const ACCENT = "#8b5cf6";

export function AxisDiagram() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const router = useRouter();
  const { t } = useLanguage();
  const [activeDesc, setActiveDesc] = useState<number>(-1);
  const [interactive, setInteractive] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [transitioning, setTransitioning] = useState(false);

  // Build translated product list — used in render only (not in GSAP setup)
  const PRODUCTS = PRODUCT_NODES.map(node => ({
    ...node,
    name:        t(`product.${node.id}.name`),
    tagline:     t(`product.${node.id}.tagline`),
    description: t(`product.${node.id}.desc`),
  }));

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(".axis-dot", { scale: 0, opacity: 0, transformOrigin: "center center" });
      gsap.set(".axis-label", { opacity: 0, y: 5 });
      gsap.set(".constellation-line", { strokeDashoffset: 300, opacity: 0 });

      const axisLen = 600;
      gsap.set(".x-axis-line", { strokeDasharray: axisLen, strokeDashoffset: axisLen });
      gsap.set(".y-axis-line", { strokeDasharray: axisLen, strokeDashoffset: axisLen });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=3200",
          pin: true,
          scrub: 1.2,
          anticipatePin: 1,
        },
      });

      // Draw axes — very faint
      tl.to(".x-axis-line", { strokeDashoffset: 0, duration: 1.5, ease: "none" })
        .to(".y-axis-line", { strokeDashoffset: 0, duration: 1.5, ease: "none" }, "-=1")
        .to(".axis-label-x, .axis-label-y", { opacity: 1, duration: 0.5 }, "-=0.3");

      // Plot each product dot
      PRODUCT_NODES.forEach((_, i) => {
        tl.to(`.axis-dot-${i}`, { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.8)" })
          .to(`.axis-label-${i}`, { opacity: 1, y: 0, duration: 0.4 }, "-=0.2")
          .call(() => setActiveDesc(i))
          .to({}, { duration: 0.8 });
      });

      // Constellation lines
      tl.to({}, { duration: 0.3 });
      CONNECTIONS.forEach(([,], i) => {
        tl.to(`.constellation-line-${i}`, {
          strokeDashoffset: 0,
          opacity: 1,
          duration: 0.4,
          ease: "none",
        }, i === 0 ? undefined : "-=0.2");
      });

      // Fade axis lines back, unlock interactive
      tl.to(".x-axis-line, .y-axis-line", { opacity: 0.08, duration: 0.5 })
        .call(() => {
          setInteractive(true);
          setActiveDesc(-1);
        });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleDotClick = (product: typeof PRODUCTS[0]) => {
    if (!interactive || transitioning) return;
    setTransitioning(true);

    const dot = document.querySelector(`.dot-glow-${product.id}`) as HTMLElement;
    if (dot) {
      // Warp — expand glow to fill screen
      gsap.to(dot, {
        scale: 50,
        opacity: 0.7,
        duration: 0.9,
        ease: "power3.in",
      });
    }
    gsap.to(".axis-section-content", { opacity: 0, duration: 0.45, delay: 0.45 });

    setTimeout(() => router.push(product.route), 900);
  };

  const descProduct = activeDesc >= 0 ? PRODUCTS[activeDesc] : null;
  const hoveredProduct = hovered ? PRODUCTS.find((p) => p.id === hovered) : null;
  const displayProduct = hoveredProduct || descProduct;

  return (
    <section
      id="axis-diagram"
      ref={sectionRef}
      className="relative z-10 w-full"
      style={{ minHeight: "100vh" }}
    >
      <div className="axis-section-content relative w-full h-screen flex items-center justify-center">

        {/* Description panel — left side, desktop only */}
        <div className="absolute left-20 top-1/2 -translate-y-1/2 w-60 pointer-events-none z-20 hidden lg:block">
          <div
            className="transition-all duration-400"
            style={{
              opacity: displayProduct ? 1 : 0,
              transform: displayProduct ? "translateY(0)" : "translateY(8px)",
            }}
          >
            {displayProduct && (
              <div className="rounded-xl p-5 border border-white/[0.06] bg-white/[0.03]">
                <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/30 mb-2">
                  {displayProduct.tagline}
                </div>
                <div className="text-white font-semibold text-base mb-2 tracking-tight">
                  {displayProduct.name}
                </div>
                <p className="text-white/45 text-xs leading-relaxed">
                  {displayProduct.description}
                </p>
                {interactive && (
                  <button
                    onClick={() => handleDotClick(displayProduct)}
                    className="mt-4 text-xs font-medium text-white/50 hover:text-white pointer-events-auto transition-colors duration-150"
                  >
                    {t("diagram.enter")} {displayProduct.name} →
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* SVG diagram */}
        <div
          className="relative w-full max-w-2xl mx-auto px-8"
          style={{ aspectRatio: "1 / 0.75" }}
        >
          <svg
            ref={svgRef}
            viewBox="0 0 100 80"
            className="w-full h-full overflow-visible"
          >
            {/* Very faint grid */}
            {[20, 40, 60, 80].map((v) => (
              <g key={v}>
                <line
                  x1={v} y1="4" x2={v} y2="76"
                  stroke="rgba(255,255,255,0.025)"
                  strokeWidth="0.2"
                />
                <line
                  x1="8" y1={v} x2="96" y2={v}
                  stroke="rgba(255,255,255,0.025)"
                  strokeWidth="0.2"
                />
              </g>
            ))}

            {/* X axis — very faint */}
            <line
              className="x-axis-line"
              x1="10" y1="76" x2="96" y2="76"
              stroke="rgba(255,255,255,0.10)"
              strokeWidth="0.5"
              strokeLinecap="round"
            />
            <polygon
              points="96,74.8 99,76 96,77.2"
              fill="rgba(255,255,255,0.10)"
              className="axis-label-x"
              style={{ opacity: 0 }}
            />

            {/* Y axis — very faint */}
            <line
              className="y-axis-line"
              x1="10" y1="76" x2="10" y2="4"
              stroke="rgba(255,255,255,0.10)"
              strokeWidth="0.5"
              strokeLinecap="round"
            />
            <polygon
              points="8.8,4 10,1 11.2,4"
              fill="rgba(255,255,255,0.10)"
              className="axis-label-y"
              style={{ opacity: 0 }}
            />

            {/* Axis labels — tiny, faint, uppercase */}
            <text
              x="100" y="77"
              textAnchor="end"
              fontSize="2.8"
              fill="rgba(255,255,255,0.25)"
              className="axis-label-x"
              style={{ opacity: 0, fontFamily: "Inter, sans-serif", letterSpacing: "0.15em" }}
            >
              {t("diagram.xaxis")}
            </text>
            <text
              x="11" y="3"
              textAnchor="start"
              fontSize="2.8"
              fill="rgba(255,255,255,0.25)"
              className="axis-label-y"
              style={{ opacity: 0, fontFamily: "Inter, sans-serif", letterSpacing: "0.15em" }}
              transform="rotate(-90, 11, 3) translate(-62, 0)"
            >
              {t("diagram.yaxis")}
            </text>

            {/* Constellation lines — almost invisible */}
            {CONNECTIONS.map(([from, to], i) => {
              const pFrom = PRODUCTS[from];
              const pTo = PRODUCTS[to];
              const dx = pTo.cx - pFrom.cx;
              const dy = pTo.cy - pFrom.cy;
              const len = Math.sqrt(dx * dx + dy * dy);
              return (
                <line
                  key={i}
                  className={`constellation-line constellation-line-${i}`}
                  x1={pFrom.cx} y1={pFrom.cy}
                  x2={pTo.cx} y2={pTo.cy}
                  stroke="rgba(255,255,255,0.04)"
                  strokeWidth="0.25"
                  strokeDasharray={len}
                  strokeDashoffset={len}
                />
              );
            })}

            {/* Dots — monochrome white with violet glow */}
            {PRODUCTS.map((product, i) => (
              <g
                key={product.id}
                className={`axis-dot axis-dot-${i}`}
                style={{ transformOrigin: `${product.cx}px ${product.cy}px` }}
              >
                {/* Glow halo */}
                <circle
                  cx={product.cx}
                  cy={product.cy}
                  r="3.5"
                  fill="none"
                  stroke={ACCENT}
                  strokeWidth="0.3"
                  opacity={hovered === product.id ? 0.6 : 0.25}
                />
                {/* Soft glow fill */}
                <circle
                  cx={product.cx}
                  cy={product.cy}
                  r="2"
                  fill={ACCENT}
                  opacity={hovered === product.id ? 0.25 : 0.12}
                />
                {/* Core dot — white */}
                <circle
                  cx={product.cx}
                  cy={product.cy}
                  r="1.2"
                  fill="white"
                  opacity={hovered === product.id ? 1 : 0.85}
                />
              </g>
            ))}

            {/* Labels — clean, minimal */}
            {PRODUCTS.map((product, i) => (
              <text
                key={product.id}
                className={`axis-label axis-label-${i}`}
                x={product.cx + (product.cx > 50 ? -3 : 3)}
                y={product.cy - 3.5}
                textAnchor={product.cx > 50 ? "end" : "start"}
                fontSize="2.8"
                fill={hovered === product.id ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.65)"}
                fontWeight="500"
                style={{ fontFamily: "Inter, sans-serif", letterSpacing: "-0.01em" }}
              >
                {product.name}
              </text>
            ))}

            {/* Taglines — even fainter */}
            {PRODUCTS.map((product, i) => (
              <text
                key={`tag-${product.id}`}
                className={`axis-label axis-label-${i}`}
                x={product.cx + (product.cx > 50 ? -3 : 3)}
                y={product.cy - 0.5}
                textAnchor={product.cx > 50 ? "end" : "start"}
                fontSize="2.2"
                fill="rgba(255,255,255,0.30)"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                {product.tagline}
              </text>
            ))}
          </svg>

          {/* Invisible click targets + glow elements over dots */}
          {interactive && (
            <div className="absolute inset-0 pointer-events-none">
              {PRODUCTS.map((product) => {
                const leftPct = (product.cx / 100) * 100;
                const topPct = (product.cy / 80) * 100;
                const isHov = hovered === product.id;
                return (
                  <div
                    key={product.id}
                    className="absolute pointer-events-auto"
                    style={{
                      left: `${leftPct}%`,
                      top: `${topPct}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    {/* Expandable glow — used for warp transition */}
                    <div
                      className={`dot-glow-${product.id} absolute inset-0 rounded-full`}
                      style={{
                        width: 12,
                        height: 12,
                        transform: "translate(-50%, -50%) translate(6px, 6px)",
                        background: `radial-gradient(circle, ${ACCENT} 0%, transparent 70%)`,
                        filter: isHov ? "blur(4px)" : "blur(2px)",
                        opacity: isHov ? 0.7 : 0.3,
                        transition: "opacity 0.2s, filter 0.2s",
                      }}
                    />
                    {/* Click target */}
                    <div
                      className="cursor-pointer"
                      style={{
                        width: 40,
                        height: 40,
                        transform: "translate(-50%, -50%)",
                        position: "absolute",
                        borderRadius: "50%",
                      }}
                      onMouseEnter={() => setHovered(product.id)}
                      onMouseLeave={() => setHovered(null)}
                      onClick={() => handleDotClick(product)}
                      role="button"
                      tabIndex={0}
                      aria-label={`Navigate to ${product.name}`}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") handleDotClick(product);
                      }}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Mobile description */}
        <div className="absolute bottom-8 left-4 right-4 lg:hidden">
          <div
            className="transition-all duration-400"
            style={{ opacity: displayProduct ? 1 : 0 }}
          >
            {displayProduct && (
              <div className="rounded-xl p-4 border border-white/[0.06] bg-white/[0.03] text-center">
                <div className="text-white font-semibold text-sm mb-1 tracking-tight">
                  {displayProduct.name}
                </div>
                <p className="text-white/40 text-xs leading-relaxed line-clamp-2">
                  {displayProduct.description}
                </p>
                {interactive && (
                  <button
                    onClick={() => handleDotClick(displayProduct)}
                    className="mt-2 text-xs text-white/50 hover:text-white transition-colors"
                  >
                    {t("diagram.enter")} →
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Scroll hint */}
        {!interactive && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/20 text-[10px] tracking-[0.2em] uppercase">
            {t("diagram.scroll")}
          </div>
        )}
        {interactive && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/30 text-[10px] tracking-[0.15em] uppercase">
            {t("diagram.click")}
          </div>
        )}
      </div>
    </section>
  );
}
