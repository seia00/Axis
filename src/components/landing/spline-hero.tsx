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
        {/* Self-hosted scene — copied from prod.spline.design/M2hWmqaN2chgfdUG/...
            into public/spline/ for faster initial paint and one less external
            origin to wait on. The Spline runtime itself still pulls its WASM
            module + Roboto font from unpkg.com / fonts.gstatic.com, those
            stay whitelisted in next.config.mjs CSP. */}
        <Spline
          scene="/spline/scene.splinecode"
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
