"use client";

import { motion, type Transition } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronDown, Compass, Layers3 } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { SplineHero } from "@/components/landing/spline-hero";

const EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: EASE } satisfies Transition,
});

const fadeIn = (delay = 0) => ({
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.7, delay, ease: EASE } satisfies Transition,
});

// Hero section — bg-transparent so the global SpaceBackground canvas
// (#05020b + violet nebula + stars) shows through both this section AND
// the axis-diagram section below for a seamless visual continuum.
// The Spline scene + gradients render on top.
export function HeroSection() {
  const { t, toggle, lang } = useLanguage();

  return (
    <section className="relative z-10 flex min-h-[100svh] items-center overflow-hidden px-4 pt-20 pb-24 text-center">
      {/* Spline particle planet — fills the full hero */}
      <SplineHero />

      {/* Subtle vignette so edges don't feel cut-off */}
      <div className="absolute inset-0 z-[1] bg-[radial-gradient(ellipse_120%_80%_at_50%_50%,transparent_45%,rgba(5,2,11,0.55)_100%)]" />
      {/* Top + bottom fade — text legibility. Bottom stop is fully transparent
          so the SpaceBackground starfield continues unbroken into the next
          section. No more visible color seam at the hero → axis boundary. */}
      <div className="absolute inset-0 z-[1] bg-[linear-gradient(180deg,rgba(5,2,11,0.78)_0%,rgba(5,2,11,0.22)_28%,rgba(5,2,11,0.18)_68%,rgba(5,2,11,0)_100%)]" />
      {/* Side fade — keeps content centred visually */}
      <div className="absolute inset-0 z-[1] bg-[linear-gradient(90deg,rgba(5,2,11,0.62)_0%,transparent_28%,transparent_72%,rgba(5,2,11,0.62)_100%)]" />

      {/* Language toggle — top right */}
      <motion.button
        {...fadeIn(0.05)}
        onClick={toggle}
        className="absolute right-4 top-5 z-20 inline-flex items-center gap-1.5 rounded-lg border border-violet-200/15 bg-violet-950/20 px-3 py-1.5 text-xs font-medium text-violet-50/72 shadow-[0_18px_50px_rgba(76,29,149,0.18)] backdrop-blur-md transition-all duration-200 hover:border-violet-200/30 hover:text-white sm:right-6 sm:top-6"
        aria-label="Toggle language"
      >
        <span className="text-[10px]">{lang === "en" ? "🇯🇵" : "🇬🇧"}</span>
        {t("lang.toggle")}
      </motion.button>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center">
        {/* Badge — sits above the logo */}
        <motion.div
          {...fadeUp(0.18)}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-200/15 bg-violet-950/20 px-3 py-1 text-xs tracking-wide text-violet-50/74 shadow-[0_18px_50px_rgba(76,29,149,0.22)] backdrop-blur-md"
        >
          <Compass className="h-3.5 w-3.5 text-violet-200" />
          {t("hero.badge")}
        </motion.div>

        {/* Logo */}
        <motion.div {...fadeIn(0.1)} className="mb-8">
          <Image
            src="/AXISLOGO.png"
            alt="AXIS"
            width={480}
            height={240}
            className="h-auto w-48 select-none object-contain drop-shadow-[0_18px_38px_rgba(0,0,0,0.55)] sm:w-64 lg:w-[310px]"
            priority
          />
        </motion.div>

        {/* Headline */}
        <motion.h1
          {...fadeUp(0.42)}
          className="mb-5 max-w-4xl text-5xl font-bold leading-[1.05] tracking-normal text-white drop-shadow-[0_18px_50px_rgba(0,0,0,0.65)] sm:text-6xl lg:text-7xl"
        >
          {lang === "en" ? (
            <>
              Where ambition meets{" "}
              <span className="text-violet-100">opportunity.</span>
            </>
          ) : (
            <>
              野心と機会が
              <span className="text-violet-100">出会う場所。</span>
            </>
          )}
        </motion.h1>

        {/* Sub */}
        <motion.p
          {...fadeUp(0.54)}
          className="mx-auto mb-10 max-w-[560px] text-base leading-relaxed text-white/74 drop-shadow-[0_10px_26px_rgba(0,0,0,0.6)] sm:text-lg"
        >
          {t("hero.subtext")}{" "}
          <span className="text-white">{t("hero.subtext.free")}</span>
        </motion.p>

        {/* CTAs */}
        <motion.div
          {...fadeUp(0.64)}
          className="mb-20 flex flex-col items-center gap-3 sm:flex-row"
        >
          {/* Primary — white on dark */}
          <Link
            href="/auth/signin"
            className="inline-flex items-center gap-2 rounded-lg bg-violet-50 px-6 py-3 text-sm font-medium text-violet-950 shadow-[0_22px_60px_rgba(139,92,246,0.24)] transition-colors duration-150 hover:bg-white focus:outline-none focus:ring-2 focus:ring-violet-200/30"
          >
            {t("hero.cta.primary")}
            <ArrowRight className="h-4 w-4" />
          </Link>

          {/* Secondary — glass */}
          <a
            href="#axis-diagram"
            className="inline-flex items-center gap-2 rounded-lg border border-violet-200/15 bg-violet-950/18 px-6 py-3 text-sm font-medium text-violet-50/76 backdrop-blur-md transition-all duration-200 hover:border-violet-200/35 hover:text-white"
          >
            <Layers3 className="h-4 w-4" />
            {t("hero.cta.secondary")}
          </a>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        {...fadeIn(1.05)}
        className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2"
      >
        <span className="text-[10px] uppercase tracking-[0.25em] text-white/45">{t("hero.scroll")}</span>
        <motion.div
          animate={{ y: [0, 7, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: EASE, delay: 1.2 } satisfies Transition}
        >
          <ChevronDown className="h-4 w-4 text-white/55" />
        </motion.div>
      </motion.div>
    </section>
  );
}
