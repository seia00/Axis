"use client";

import { NeuralSphereHero } from "@/components/landing/neural-sphere-hero";

export function Animated3DStackBackground() {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-[#05020b]">
      <NeuralSphereHero
        className="opacity-85"
        nodeCount={480}
        innerParticleCount={180}
        radius={2.4}
        seed={20260503}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(167,139,250,0.12),transparent_45%),linear-gradient(180deg,rgba(5,2,11,0.65)_0%,transparent_30%,transparent_70%,rgba(5,2,11,0.95)_100%)]" />
    </div>
  );
}
