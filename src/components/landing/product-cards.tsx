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
import { useLanguage } from "@/contexts/language-context";

gsap.registerPlugin(ScrollTrigger);

const PRODUCT_META = [
  { id: "directory",    icon: LayoutGrid,  href: "/directory"    },
  { id: "opportunities",icon: Briefcase,   href: "/opportunities" },
  { id: "launchpad",    icon: Rocket,      href: "/launchpad"     },
  { id: "match",        icon: Sparkles,    href: "/match"         },
  { id: "portfolio",    icon: Users,       href: "/portfolio"     },
  { id: "ventures",     icon: TrendingUp,  href: "/ventures"      },
];

export function ProductCards() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

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
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            {t("products.heading")}{" "}
            <span className="gradient-text">{t("products.heading.accent")}</span>
          </h2>
          <p className="text-white/40 text-base max-w-lg mx-auto leading-relaxed">
            {t("products.subtext")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PRODUCT_META.map(({ id, icon: Icon, href }) => {
            const name     = t(`product.${id}.name`);
            const tagline  = t(`product.${id}.tagline`);
            const features = [
              t(`product.${id}.f1`),
              t(`product.${id}.f2`),
              t(`product.${id}.f3`),
              t(`product.${id}.f4`),
            ];

            return (
              <Link
                key={id}
                href={href}
                className="product-card group opacity-0 block"
              >
                <div className="relative h-full rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-250 hover:border-white/[0.10] hover:bg-white/[0.035] overflow-hidden">
                  {/* Top accent line */}
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
                    {name}
                  </h3>
                  <p className="text-white/35 text-xs mb-4 leading-relaxed">
                    {tagline}
                  </p>

                  {/* Features */}
                  <div className="space-y-2">
                    {features.map((f, i) => (
                      <p key={i} className="text-xs text-white/35 leading-snug">
                        {f}
                      </p>
                    ))}
                  </div>

                  {/* Enter link */}
                  <div className="mt-5 text-xs text-white/25 group-hover:text-white/55 transition-colors duration-200">
                    {t("products.explore")} {name} →
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
