"use client";

import { usePathname } from "next/navigation";

/**
 * Wraps page content and adds left padding to clear the fixed AppSidebar
 * on all routes except the landing page ("/").
 */
export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  return (
    <div className={isLanding ? "" : "md:pl-60"}>
      {children}
    </div>
  );
}
