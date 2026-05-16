"use client";

import dynamic from "next/dynamic";

// Spline uses async internals that are incompatible with the `/next` export
// in a Client Component context. We load the standard package via next/dynamic
// with ssr:false so it only ever runs in the browser.
const Spline = dynamic(() => import("@splinetool/react-spline"), {
  ssr: false,
  loading: () => null,
});

interface SplineHeroProps {
  className?: string;
}

export function SplineHero({ className = "" }: SplineHeroProps) {
  return (
    <div
      className={`absolute inset-0 z-0 ${className}`}
      style={{ pointerEvents: "none" }}
    >
      {/* Self-hosted scene — see public/spline/. The Spline runtime pulls its
          WASM module + Roboto font from unpkg.com / fonts.gstatic.com. */}
      <Spline
        scene="/spline/scene.splinecode"
        style={{ width: "100%", height: "100%", pointerEvents: "auto" }}
      />
    </div>
  );
}
