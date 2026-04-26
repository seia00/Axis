"use client";

import { motion, type Transition } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronDown } from "lucide-react";

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

export function HeroSection() {
  return (
    <section className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
      {/* Single ambient glow — so soft you almost miss it */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[360px] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse, rgba(139,92,246,0.10) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      {/* Logo */}
      <motion.div {...fadeIn(0.1)} className="mb-10">
        <Image
          src="/AXISLOGO.png"
          alt="AXIS"
          width={480}
          height={240}
          className="w-48 sm:w-64 lg:w-[300px] h-auto object-contain select-none"
          style={{ opacity: 0.85 }}
          priority
        />
      </motion.div>

      {/* Badge */}
      <motion.div
        {...fadeUp(0.28)}
        className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.06] bg-white/[0.03] text-white/45 text-xs mb-8 tracking-wide"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-violet-500/80" />
        Live across Japan — 50+ organizations and counting
      </motion.div>

      {/* Headline */}
      <motion.h1
        {...fadeUp(0.42)}
        className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-[-0.03em] leading-[1.05] mb-5 text-white max-w-3xl"
      >
        Where ambition meets{" "}
        <span className="gradient-text">opportunity.</span>
      </motion.h1>

      {/* Sub */}
      <motion.p
        {...fadeUp(0.54)}
        className="text-base sm:text-lg text-white/45 max-w-[500px] mx-auto mb-10 leading-relaxed"
      >
        Japan's platform for student founders — discover opportunities, build your team,
        and launch your venture.{" "}
        <span className="text-white/65">Free, forever.</span>
      </motion.p>

      {/* CTAs */}
      <motion.div
        {...fadeUp(0.64)}
        className="flex flex-col sm:flex-row items-center gap-3 mb-24"
      >
        {/* Primary — white on dark (Linear/Vercel signature) */}
        <Link
          href="/auth/signin"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white text-black font-medium text-sm transition-colors duration-150 hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-white/20"
        >
          Get Started Free
          <ArrowRight className="w-4 h-4" />
        </Link>

        {/* Secondary — ghost */}
        <a
          href="#axis-diagram"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-white/[0.10] text-white/55 hover:text-white hover:border-white/[0.20] font-medium text-sm transition-all duration-200"
        >
          Explore Platform
        </a>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        {...fadeIn(1.05)}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-white/20 text-[10px] tracking-[0.25em] uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 7, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: EASE, delay: 1.2 } satisfies Transition}
        >
          <ChevronDown className="w-4 h-4 text-white/25" />
        </motion.div>
      </motion.div>
    </section>
  );
}
