"use client";

import { motion, type Transition } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronDown } from "lucide-react";

const EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.65, delay, ease: EASE } satisfies Transition,
});

const fadeIn = (delay = 0) => ({
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.7, delay, ease: EASE } satisfies Transition,
});

export function HeroSection() {
  return (
    <section className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center pt-16">
      {/* Glow blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-violet-700/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[300px] h-[200px] bg-indigo-600/12 rounded-full blur-[80px] pointer-events-none" />

      {/* Logo */}
      <motion.div {...fadeIn(0.1)} className="mb-6">
        <div className="relative inline-flex items-center justify-center">
          <div className="absolute inset-0 scale-75 bg-violet-600/20 rounded-full blur-3xl" />
          <Image
            src="/AXISLOGO.png"
            alt="AXIS"
            width={480}
            height={240}
            className="relative w-64 sm:w-80 lg:w-[420px] h-auto object-contain drop-shadow-[0_0_60px_rgba(139,92,246,0.5)] select-none"
            priority
          />
        </div>
      </motion.div>

      {/* Badge */}
      <motion.div
        {...fadeUp(0.35)}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-950/40 text-indigo-300 text-xs font-medium mb-6 backdrop-blur-sm"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
        Now live across Japan — 50+ organizations and counting
      </motion.div>

      {/* Heading */}
      <motion.h1
        {...fadeUp(0.5)}
        className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-5 text-white"
      >
        Where ambition
        <br />
        <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
          meets opportunity.
        </span>
      </motion.h1>

      {/* Sub */}
      <motion.p
        {...fadeUp(0.65)}
        className="text-base sm:text-lg text-white/55 max-w-xl mx-auto mb-10 leading-relaxed"
      >
        AXIS is Japan's platform for student founders — discover opportunities,
        recruit your team, build your portfolio, and launch your venture.{" "}
        <span className="text-white/80">Free forever.</span>
      </motion.p>

      {/* CTAs */}
      <motion.div {...fadeUp(0.75)} className="flex flex-col sm:flex-row items-center gap-3 mb-20">
        <Link
          href="/auth/signin"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-indigo-600/25"
        >
          Get Started Free
          <ArrowRight className="w-4 h-4" />
        </Link>
        <a
          href="#axis-diagram"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-white/15 text-white/70 hover:text-white hover:border-white/30 font-medium text-sm transition-all duration-200 backdrop-blur-sm"
        >
          Explore the Platform
        </a>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        {...fadeIn(1.1)}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-white/30 text-xs tracking-widest uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: EASE, delay: 1.2 } satisfies Transition}
        >
          <ChevronDown className="w-5 h-5 text-white/40" />
        </motion.div>
      </motion.div>
    </section>
  );
}
