"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

/**
 * Page-level enter animation.
 *
 * AnimatePresence mode="wait" is intentionally omitted here. In Next.js App
 * Router, server-side redirects fire two rapid navigation events (e.g.
 * /network → /network/dashboard). AnimatePresence tries to keep the exiting
 * element alive for each event, which results in multiple motion.div instances
 * at different animation stages simultaneously. React's hook-order checker then
 * sees a different number of hooks on consecutive renders → Error #310.
 *
 * Without AnimatePresence there are no exit animations, but enter animations
 * still work correctly and there is no hook-count mismatch.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
}
