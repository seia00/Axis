"use client";

/**
 * Warp Transition — global "hyperspace jump" effect for cinematic navigation.
 *
 * Exports a single function `triggerWarp(originX, originY)` that:
 *   1. Dispatches a window CustomEvent("axis:warp", { detail: { x, y } })
 *   2. SpaceBackground listens for this event and accelerates stars
 *      radially outward from the origin point for ~700ms
 *   3. Toggles a body data-attr `data-warp-active="true"` for the duration
 *      so other components (e.g. blur overlays) can react via CSS
 *
 * No mounted component needed — purely event-driven so it composes with
 * the existing PageTransition without conflicting AnimatePresence.
 */

const WARP_DURATION_MS = 700;

export function triggerWarp(originX?: number, originY?: number) {
  if (typeof window === "undefined") return;

  const x = originX ?? window.innerWidth / 2;
  const y = originY ?? window.innerHeight / 2;

  // Mark body for the duration of the warp
  document.body.dataset.warpActive = "true";

  // Dispatch event for SpaceBackground (and any other listeners)
  window.dispatchEvent(
    new CustomEvent("axis:warp", { detail: { x, y, duration: WARP_DURATION_MS } })
  );

  // Auto-clear after duration
  setTimeout(() => {
    delete document.body.dataset.warpActive;
  }, WARP_DURATION_MS);
}

export const WARP_EVENT = "axis:warp" as const;
export const WARP_DURATION = WARP_DURATION_MS;

export interface WarpDetail {
  x: number;
  y: number;
  duration: number;
}
