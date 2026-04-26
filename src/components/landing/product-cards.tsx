"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import {
  LayoutGrid,
  Briefcase,
  Rocket,
  Sparkles,
  Users,
  TrendingUp,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const PRODUCTS = [
  {
    icon: LayoutGrid,
    name: "Directory",
    tagline: "Find your people",
    href: "/directory",
    features: [
      "50+ verified organizations across Japan",
      "Filter by focus area, location, and tier",
      "View org profiles, members, and events",
      "Direct outreach to org leaders",
    ],
  },
  {
    icon: Briefcase,
    name: "Opportunities",
    tagline: "Discover what's out there",
    href: "/opportunities",
    features: [
      "Competitions, fellowships, and scholarships",
      "AI-powered deadline reminders via Calendar",
      "Save and track application status",
      "Verified — from Diamond Challenge to MIT Launch",
    ],
  },
  {
    icon: Rocket,
    name: "Launch Pad",
    tagline: "Build something real",
    href: "/launchpad",
    features: [
      "Post your project and recruit teammates",
      "Define specific roles with skill requirements",
      "Review applications and build your team",
      "Track stage: idea → prototype → scaling",
    ],
  },
  {
    icon: Sparkles,
    name: "AXIS Match",
    tagline: "Your AI navigator",
    href: "/match",
    features: [
      "AI-powered opportunity ranking by fit",
      "Co-founder compatibility scores",
      "Program recommendations from your goals",
      "New matches as your profile grows",
    ],
  },
  {
    icon: Users,
    name: "Portfolio",
    tagline: "Your story, visualized",
    href: "/portfolio",
    features: [
      "Activity timeline like a founder's LinkedIn",
      "Impact metrics: hours, reach, awards",
      "Radar chart and visualization dashboard",
      "Common App export for top 10 activities",
    ],
  },
  {
    icon: TrendingUp,
    name: "AXIS Ventures",
    tagline: "Scale your vision",
    href: "/ventures",
    features: [
      "Youth incubator for student founders",
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
            { opacity: 0, y: 24 },
            {
              opacity: 1,
              y: 0,
              duration: 0.55,
              ease: "power2.out",
              stagger: 0.08,
            }
          ),
        start: "top 90%",
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative z-10 py-28 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Section header — minimal */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Eight tools.{" "}
            <span className="gradient-text">One platform.</span>
          </h2>
          <p className="text-white/40 text-base max-w-lg mx-auto leading-relaxed">
            Everything a student founder needs — from discovery to launch.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PRODUCTS.map((product) => {
            const Icon = product.icon;
            return (
              <Link
                key={product.name}
                href={product.href}
                className="product-card group opacity-0 block"
              >
                <div className="relative h-full rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-250 hover:border-white/[0.10] hover:bg-white/[0.035] overflow-hidden">
                  {/* Top accent line — barely visible, appears on hover */}
                  <div
                    className="absolute top-0 left-[15%] right-[15%] h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background:
                        "linear-gradient(to right, transparent, rgba(139,92,246,0.35), transparent)",
                    }}
                  />

                  {/* Icon */}
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-4 bg-white/[0.04] border border-white/[0.06]">
                    <Icon className="w-4 h-4 text-white/60" />
                  </div>

                  {/* Name + tagline */}
                  <h3 className="text-white font-semibold text-base mb-1 tracking-tight">
                    {product.name}
                  </h3>
                  <p className="text-white/35 text-xs mb-4 leading-relaxed">
                    {product.tagline}
                  </p>

                  {/* Features — plain lines, no bullets */}
                  <div className="space-y-2">
                    {product.features.map((f) => (
                      <p key={f} className="text-xs text-white/35 leading-snug">
                        {f}
                      </p>
                    ))}
                  </div>

                  {/* Subtle "enter" link */}
                  <div className="mt-5 text-xs text-white/25 group-hover:text-white/55 transition-colors duration-200">
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
