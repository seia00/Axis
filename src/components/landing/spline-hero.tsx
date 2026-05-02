"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

const SplineScene = dynamic(() => import("@splinetool/react-spline"), {
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
      // Intercept all pointer events so Spline's own handlers work but
      // taps on the text/buttons above (z-10+) still register normally.
      style={{ pointerEvents: "none" }}
    >
      <Suspense fallback={null}>
        <SplineScene
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
