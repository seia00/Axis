"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/language-context";

export function CTASection() {
  const { t } = useLanguage();

  return (
    <section className="relative z-10 py-32 px-4 text-center">
      {/* Single ambient glow behind CTA */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        aria-hidden
      >
        <div
          className="w-[400px] h-[220px]"
          style={{
            background: "radial-gradient(ellipse, rgba(139,92,246,0.08) 0%, transparent 70%)",
            filter: "blur(50px)",
          }}
        />
      </div>

      <div className="relative max-w-lg mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
          {t("cta.headline")}
        </h2>
        <p className="text-white/40 text-base mb-8 leading-relaxed">
          {t("cta.sub")}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/auth/signin"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-lg bg-white text-black font-medium text-sm transition-colors duration-150 hover:bg-white/90"
          >
            {t("cta.join")}
          </Link>
          <Link
            href="/directory"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-lg border border-white/[0.10] text-white/55 hover:text-white hover:border-white/[0.20] font-medium text-sm transition-all duration-200"
          >
            {t("cta.browse")}
          </Link>
        </div>
      </div>
    </section>
  );
}
