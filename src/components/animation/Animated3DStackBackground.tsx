"use client";

import { SpaceBackground } from "@/components/animation/space-background";

// Global background rendered once in the root layout.
// The landing hero renders its own Spline scene on top of this.
export function Animated3DStackBackground() {
  return <SpaceBackground />;
}
