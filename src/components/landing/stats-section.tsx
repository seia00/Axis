"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface Props {
  stats: { orgCount: number; oppCount: number; projectCount: number };
}

export function StatsSection({ stats }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const items = [
    { value: Math.max(stats.orgCount, 50),      label: "Organizations",    suffix: "+" },
    { value: 1000,                               label: "Students Reached", suffix: "+" },
    { value: Math.max(stats.oppCount, 50),       label: "Opportunities",    suffix: "+" },
    { value: Math.max(stats.projectCount, 20),   label: "Projects Launched", suffix: "+" },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Fade in the entire section
      gsap.fromTo(
        ".stats-section",
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".stats-section",
            start: "top 88%",
            once: true,
          },
        }
      );

      // Count-up per stat
      items.forEach((item, i) => {
        const el = document.querySelector(`.stat-number-${i}`);
        if (!el) return;

        ScrollTrigger.create({
          trigger: el,
          start: "top 88%",
          once: true,
          onEnter: () => {
            const counter = { val: 0 };
            gsap.to(counter, {
              val: item.value,
              duration: 1.6,
              ease: "power2.out",
              delay: i * 0.08,
              onUpdate: () => {
                if (el) el.textContent = Math.round(counter.val).toLocaleString();
              },
            });
          },
        });
      });
    }, ref);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section ref={ref} className="relative z-10 py-24 px-4">
      <div className="stats-section max-w-4xl mx-auto">
        {/* Section label */}
        <p className="text-center text-white/25 text-[10px] uppercase tracking-[0.22em] mb-12">
          By the numbers
        </p>

        {/* Stats row with dividers */}
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/[0.06]">
          {items.map((item, i) => (
            <div key={item.label} className="text-center px-8 py-4">
              <div className="flex items-baseline justify-center gap-0.5 mb-1">
                <span className={`stat-number-${i} text-4xl md:text-5xl font-bold text-white tabular-nums tracking-tight`}>
                  0
                </span>
                <span className="text-xl md:text-2xl font-bold text-white/40">
                  {item.suffix}
                </span>
              </div>
              <p className="text-white/35 text-xs mt-1 tracking-wide">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
