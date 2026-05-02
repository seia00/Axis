"use client";

import Spline from "@splinetool/react-spline/next";
import { Suspense } from "react";

interface SplineHeroProps {
  className?: string;
}

// Spline particle planet — uses the Next.js-optimized export which handles
// client-only loading internally (no need for next/dynamic wrapper).
export function SplineHero({ className = "" }: SplineHeroProps) {
  return (
    <div
      className={`absolute inset-0 z-0 ${className}`}
      // Wrapper itself ignores pointer events so taps fall through to the text
      // and CTA buttons (z-10+) above. The Spline canvas re-enables them so
      // the scene's own interactions still work.
      style={{ pointerEvents: "none" }}
    >
      <Suspense fallback={null}>
        <Spline
          scene="https://prod.spline.design/M2hWmqaN2chgfdUG/scene.splinecode"
          style={{
            width: "100%",
            height: "100%",
            pointerEvents: "auto",
          }}
        />
      </Suspense>
    </div>
  );
}
