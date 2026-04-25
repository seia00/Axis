"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const PRODUCTS = [
  {
    id: "directory",
    name: "Directory",
    tagline: "Find your people",
    description:
      "Browse 50+ verified student organizations across Japan. Filter by focus area, location, and tier to find communities that match your ambitions.",
    route: "/directory",
    cx: 20,
    cy: 75,
    color: "#818cf8",
  },
  {
    id: "network",
    name: "Network",
    tagline: "Build your circle",
    description:
      "Connect with other student founders, join organizations, and build the relationships that turn into co-founder partnerships and lifelong collaborations.",
    route: "/network",
    cx: 38,
    cy: 58,
    color: "#a78bfa",
  },
  {
    id: "opportunities",
    name: "Opportunities",
    tagline: "Discover what's out there",
    description:
      "Access competitions, fellowships, scholarships, and programs from around the world — curated and verified for high school student founders.",
    route: "/opportunities",
    cx: 52,
    cy: 48,
    color: "#60a5fa",
  },
  {
    id: "launchpad",
    name: "Launch Pad",
    tagline: "Build something real",
    description:
      "Post your project, define the roles you need, and recruit talented co-founders and teammates to build something that matters.",
    route: "/launchpad",
    cx: 68,
    cy: 35,
    color: "#34d399",
  },
  {
    id: "ventures",
    name: "Ventures",
    tagline: "Scale your vision",
    description:
      "Apply to AXIS Ventures — our youth incubator for the most ambitious student founders. Get mentorship, resources, and a community of builders.",
    route: "/ventures",
    cx: 82,
    cy: 22,
    color: "#f59e0b",
  },
  {
    id: "match",
    name: "AXIS Match",
    tagline: "Your AI navigator",
    description:
      "Our AI engine analyzes your profile and surfaces personalized opportunity matches, co-founder suggestions, and program recommendations.",
    route: "/match",
    cx: 58,
    cy: 28,
    color: "#e879f9",
  },
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

export function AxisDiagram() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const router = useRouter();
  const [activeDesc, setActiveDesc] = useState<number>(-1);
  const [interactive, setInteractive] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Set initial state — dots invisible, labels invisible
      gsap.set(".axis-dot", { scale: 0, opacity: 0, transformOrigin: "center center" });
      gsap.set(".axis-label", { opacity: 0, y: 6 });
      gsap.set(".constellation-line", { strokeDashoffset: 300, opacity: 0 });

      // Use strokeDasharray for line drawing
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

      // Draw axes
      tl.to(".x-axis-line", { strokeDashoffset: 0, duration: 1.5, ease: "none" })
        .to(".y-axis-line", { strokeDashoffset: 0, duration: 1.5, ease: "none" }, "-=1")
        .to(".axis-label-x, .axis-label-y", { opacity: 1, duration: 0.5 }, "-=0.3");

      // Plot each product
      PRODUCTS.forEach((_, i) => {
        const dotClass = `.axis-dot-${i}`;
        const labelClass = `.axis-label-${i}`;

        tl.to(dotClass, { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(2)" })
          .to(labelClass, { opacity: 1, y: 0, duration: 0.4 }, "-=0.2")
          .call(() => setActiveDesc(i))
          .to({}, { duration: 0.8 }); // pause on this dot
      });

      // Draw constellation lines
      tl.to({}, { duration: 0.3 }); // brief pause
      CONNECTIONS.forEach(([, ], i) => {
        tl.to(`.constellation-line-${i}`, {
          strokeDashoffset: 0,
          opacity: 1,
          duration: 0.4,
          ease: "none",
        }, i === 0 ? undefined : "-=0.2");
      });

      // Fade axes, make interactive
      tl.to(".x-axis-line, .y-axis-line", { opacity: 0.12, duration: 0.5 })
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

    const dot = document.querySelector(`.axis-dot-click-${product.id}`) as HTMLElement;
    if (dot) {
      gsap.to(dot, { scale: 60, opacity: 0.8, duration: 0.7, ease: "power2.in" });
    }
    gsap.to(".axis-section-content", { opacity: 0, duration: 0.5, delay: 0.2 });

    setTimeout(() => {
      router.push(product.route);
    }, 800);
  };

  // Get the description to show
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
        {/* Description panel */}
        <div className="absolute left-6 top-1/2 -translate-y-1/2 w-64 pointer-events-none z-20 hidden lg:block">
          <div
            className="transition-all duration-500"
            style={{
              opacity: displayProduct ? 1 : 0,
              transform: displayProduct ? "translateY(0)" : "translateY(8px)",
            }}
          >
            {displayProduct && (
              <div
                className="rounded-xl p-5 border backdrop-blur-md"
                style={{
                  background: "rgba(10, 16, 40, 0.75)",
                  borderColor: `${displayProduct.color}30`,
                  boxShadow: `0 0 30px ${displayProduct.color}15`,
                }}
              >
                <div
                  className="text-xs font-semibold uppercase tracking-widest mb-1"
                  style={{ color: displayProduct.color }}
                >
                  {displayProduct.tagline}
                </div>
                <div className="text-white font-bold text-lg mb-2">{displayProduct.name}</div>
                <p className="text-white/55 text-sm leading-relaxed">{displayProduct.description}</p>
                {interactive && (
                  <button
                    onClick={() => handleDotClick(displayProduct)}
                    className="mt-3 text-xs font-medium transition-colors pointer-events-auto"
                    style={{ color: displayProduct.color }}
                  >
                    Explore →
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* SVG Axis Diagram */}
        <div className="relative w-full max-w-2xl mx-auto px-8" style={{ aspectRatio: "1 / 0.75" }}>
          <svg
            ref={svgRef}
            viewBox="0 0 100 80"
            className="w-full h-full overflow-visible"
            style={{ filter: "drop-shadow(0 0 1px rgba(255,255,255,0.1))" }}
          >
            {/* Grid lines (subtle) */}
            {[20, 40, 60, 80].map((v) => (
              <g key={v}>
                <line x1={v} y1="4" x2={v} y2="76" stroke="rgba(255,255,255,0.04)" strokeWidth="0.3" />
                <line x1="8" y1={v} x2="96" y2={v} stroke="rgba(255,255,255,0.04)" strokeWidth="0.3" />
              </g>
            ))}

            {/* X axis */}
            <line
              className="x-axis-line"
              x1="10" y1="76" x2="96" y2="76"
              stroke="rgba(255,255,255,0.5)"
              strokeWidth="0.6"
              strokeLinecap="round"
            />
            {/* Arrowhead X */}
            <polygon points="96,74.8 99,76 96,77.2" fill="rgba(255,255,255,0.5)" className="axis-label-x" style={{ opacity: 0 }} />

            {/* Y axis */}
            <line
              className="y-axis-line"
              x1="10" y1="76" x2="10" y2="4"
              stroke="rgba(255,255,255,0.5)"
              strokeWidth="0.6"
              strokeLinecap="round"
            />
            {/* Arrowhead Y */}
            <polygon points="8.8,4 10,1 11.2,4" fill="rgba(255,255,255,0.5)" className="axis-label-y" style={{ opacity: 0 }} />

            {/* Axis labels */}
            <text x="100" y="77" textAnchor="end" fontSize="3.5" fill="rgba(255,255,255,0.5)" className="axis-label-x" style={{ opacity: 0 }}>Impact →</text>
            <text x="11" y="3" textAnchor="start" fontSize="3.5" fill="rgba(255,255,255,0.5)" className="axis-label-y" style={{ opacity: 0 }} transform="rotate(-90, 11, 3) translate(-62, 0)">Growth ↑</text>

            {/* Constellation lines */}
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
                  stroke="rgba(255,255,255,0.12)"
                  strokeWidth="0.3"
                  strokeDasharray={len}
                  strokeDashoffset={len}
                />
              );
            })}

            {/* Dots */}
            {PRODUCTS.map((product, i) => (
              <g key={product.id} className={`axis-dot axis-dot-${i}`} style={{ transformOrigin: `${product.cx}px ${product.cy}px` }}>
                {/* Outer glow ring */}
                <circle
                  cx={product.cx}
                  cy={product.cy}
                  r="3.5"
                  fill="none"
                  stroke={product.color}
                  strokeWidth="0.4"
                  opacity="0.4"
                />
                {/* Glow */}
                <circle
                  cx={product.cx}
                  cy={product.cy}
                  r="2"
                  fill={product.color}
                  opacity="0.2"
                />
                {/* Core dot */}
                <circle
                  cx={product.cx}
                  cy={product.cy}
                  r="1.2"
                  fill={product.color}
                />
              </g>
            ))}

            {/* Labels */}
            {PRODUCTS.map((product, i) => (
              <text
                key={product.id}
                className={`axis-label axis-label-${i}`}
                x={product.cx + (product.cx > 50 ? -3 : 3)}
                y={product.cy - 3.5}
                textAnchor={product.cx > 50 ? "end" : "start"}
                fontSize="3"
                fill="rgba(255,255,255,0.75)"
                fontWeight="600"
              >
                {product.name}
              </text>
            ))}
          </svg>

          {/* Invisible click targets (positioned over dots) */}
          {interactive && (
            <div className="absolute inset-0 pointer-events-none">
              {PRODUCTS.map((product) => {
                // Map SVG coords (0-100) to percentage of container
                const leftPct = (product.cx / 100) * 100;
                const topPct = (product.cy / 80) * 100;
                return (
                  <div
                    key={product.id}
                    className={`axis-dot-click-${product.id} absolute pointer-events-auto cursor-pointer`}
                    style={{
                      left: `${leftPct}%`,
                      top: `${topPct}%`,
                      transform: "translate(-50%, -50%)",
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                    }}
                    onMouseEnter={() => setHovered(product.id)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => handleDotClick(product)}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Mobile description */}
        <div className="absolute bottom-8 left-4 right-4 lg:hidden">
          <div
            className="transition-all duration-500"
            style={{ opacity: displayProduct ? 1 : 0 }}
          >
            {displayProduct && (
              <div
                className="rounded-xl p-4 border backdrop-blur-md text-center"
                style={{
                  background: "rgba(10, 16, 40, 0.85)",
                  borderColor: `${displayProduct.color}30`,
                }}
              >
                <div className="text-white font-bold text-base mb-1">{displayProduct.name}</div>
                <p className="text-white/55 text-xs leading-relaxed line-clamp-2">{displayProduct.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Scroll hint */}
        {!interactive && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/25 text-xs text-center">
            scroll to explore
          </div>
        )}
        {interactive && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/40 text-xs text-center animate-pulse">
            click any node to enter
          </div>
        )}
      </div>

      {/* Transition overlay */}
      {transitioning && (
        <div className="fixed inset-0 z-50 bg-[#050a18] opacity-0" id="transition-overlay" />
      )}
    </section>
  );
}
