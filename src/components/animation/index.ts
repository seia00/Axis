export { PageTransition } from "./page-transition";
export { Reveal } from "./reveal";
export { StaggerContainer, StaggerItem } from "./stagger";
export { Animated3DStackBackground } from "./Animated3DStackBackground";
export { triggerWarp, WARP_EVENT, WARP_DURATION, type WarpDetail } from "./warp-transition";

// LiquidGlass is intentionally NOT re-exported here.
//
// It depends on @react-three/fiber + three.js (~230kb gzipped). Re-exporting
// from the barrel would force every page that imports anything from this
// module (e.g. <StaggerContainer>) to bundle Three.js, even pages that don't
// use glass at all.
//
// Always import directly from the file:
//
//   import { LiquidGlass } from "@/components/animation/liquid-glass";
//
// Next.js will then code-split it into its own chunk, loaded only on pages
// that actually use it.
