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
    { value: Math.max(stats.orgCount, 50), label: "Organizations", suffix: "+" },
    { value: 1000, label: "Students Reached", suffix: "+" },
    { value: Math.max(stats.oppCount, 50), label: "Opportunities", suffix: "+" },
    { value: Math.max(stats.projectCount, 20), label: "Projects Launched", suffix: "+" },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      items.forEach((item, i) => {
        const el = document.querySelector(`.stat-number-${i}`);
        if (!el) return;

        ScrollTrigger.create({
          trigger: el,
          start: "top 85%",
          once: true,
          onEnter: () => {
            const counter = { val: 0 };
            gsap.to(counter, {
              val: item.value,
              duration: 1.8,
              ease: "power2.out",
              delay: i * 0.1,
              onUpdate: () => {
                if (el) el.textContent = Math.round(counter.val).toLocaleString();
              },
            });
          },
        });
      });

      gsap.fromTo(
        ".stats-section",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".stats-section",
            start: "top 85%",
            once: true,
          },
        }
      );
    }, ref);

    return () => ctx.revert();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section ref={ref} className="relative z-10 py-24 px-4">
      <div
        className="stats-section max-w-4xl mx-auto rounded-2xl p-12 border backdrop-blur-md"
        style={{
          background: "rgba(255,255,255,0.025)",
          borderColor: "rgba(255,255,255,0.07)",
        }}
      >
        <p className="text-center text-white/40 text-xs uppercase tracking-widest mb-10">
          By the numbers
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {items.map((item, i) => (
            <div key={item.label} className="text-center">
              <div className="flex items-baseline justify-center gap-0.5">
                <span
                  className={`stat-number-${i} text-4xl font-bold text-white`}
                  style={{ textShadow: "0 0 30px rgba(99,102,241,0.4)" }}
                >
                  0
                </span>
                <span className="text-2xl font-bold text-white/60">{item.suffix}</span>
              </div>
              <p className="text-white/45 text-sm mt-1">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
