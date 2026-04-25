"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import {
  LayoutGrid, Briefcase, Rocket, Sparkles,
  Users, TrendingUp
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const PRODUCTS = [
  {
    icon: LayoutGrid,
    name: "Directory",
    tagline: "Find your people",
    href: "/directory",
    color: "#818cf8",
    features: [
      "50+ verified student organizations across Japan",
      "Filter by focus area, location, and tier",
      "View org profiles, members, and events",
      "Direct outreach to organization leaders",
    ],
  },
  {
    icon: Briefcase,
    name: "Opportunities",
    tagline: "Discover what's out there",
    href: "/opportunities",
    color: "#60a5fa",
    features: [
      "Competitions, fellowships, and scholarships",
      "AI-powered deadline reminders via Calendar",
      "Save and track application status",
      "Verified opportunities from Diamond Challenge to MIT Launch",
    ],
  },
  {
    icon: Rocket,
    name: "Launch Pad",
    tagline: "Build something real",
    href: "/launchpad",
    color: "#34d399",
    features: [
      "Post your project and recruit teammates",
      "Define specific roles with skill requirements",
      "Review applications and accept your team",
      "Track project stage from idea → scaling",
    ],
  },
  {
    icon: Sparkles,
    name: "AXIS Match",
    tagline: "Your AI navigator",
    href: "/match",
    color: "#e879f9",
    features: [
      "AI-powered opportunity ranking by fit",
      "Co-founder compatibility scores",
      "Program recommendations based on your goals",
      "Refreshable — new matches as your profile grows",
    ],
  },
  {
    icon: Users,
    name: "Portfolio",
    tagline: "Your story, visualized",
    href: "/portfolio",
    color: "#f472b6",
    features: [
      "Vertical activity timeline like LinkedIn",
      "Impact metrics: hours, people reached, awards",
      "Radar chart and donut chart visualizations",
      "Common App export for top 10 activities",
    ],
  },
  {
    icon: TrendingUp,
    name: "AXIS Ventures",
    tagline: "Scale your vision",
    href: "/ventures",
    color: "#f59e0b",
    features: [
      "Youth incubator program for student founders",
      "Milestone tracking with mentor support",
      "Ventures-exclusive resources and templates",
      "Public showcase of accepted cohort projects",
    ],
  },
];

export function ProductCards() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.batch(".product-card", {
        onEnter: (batch) =>
          gsap.fromTo(
            batch,
            { opacity: 0, y: 60, scale: 0.97 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.7,
              ease: "power2.out",
              stagger: 0.1,
            }
          ),
        start: "top 88%",
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative z-10 py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Eight tools.{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              One platform.
            </span>
          </h2>
          <p className="text-white/50 text-base max-w-xl mx-auto">
            Everything a student founder needs — from finding opportunities to launching a venture.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {PRODUCTS.map((product) => {
            const Icon = product.icon;
            return (
              <Link
                key={product.name}
                href={product.href}
                className="product-card group opacity-0 block"
              >
                <div
                  className="h-full rounded-2xl border p-6 transition-all duration-300 backdrop-blur-sm hover:scale-[1.02]"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    borderColor: "rgba(255,255,255,0.07)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = `${product.color}40`;
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 0 30px ${product.color}12, inset 0 1px 0 rgba(255,255,255,0.05)`;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "inset 0 1px 0 rgba(255,255,255,0.05)";
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: `${product.color}18`, border: `1px solid ${product.color}30` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: product.color }} />
                    </div>
                    <span
                      className="text-xs font-medium px-2 py-1 rounded-full"
                      style={{
                        color: product.color,
                        background: `${product.color}15`,
                      }}
                    >
                      {product.tagline}
                    </span>
                  </div>

                  <h3 className="text-white font-bold text-lg mb-3">{product.name}</h3>

                  <ul className="space-y-2">
                    {product.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-white/50">
                        <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0" style={{ background: product.color }} />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <div
                    className="mt-5 text-xs font-medium transition-colors"
                    style={{ color: product.color }}
                  >
                    Explore {product.name} →
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
