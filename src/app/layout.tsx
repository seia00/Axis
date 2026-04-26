import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { PageTransition } from "@/components/animation";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarLayout } from "@/components/layout/sidebar-layout";

export const metadata: Metadata = {
  title: { default: "AXIS — Japan's Student Organization Platform", template: "%s | AXIS" },
  description: "The infrastructure backbone for Japan's student organization ecosystem. Discover, connect, and build. Free for all students, always.",
  keywords: ["student organizations", "Japan", "high school", "student clubs", "AXIS"],
  openGraph: {
    title: "AXIS — Japan's Student Organization Platform",
    description: "Discover and connect with student organizations across Japan.",
    siteName: "AXIS",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <Providers>
          {/* Fixed sidebar — minimal on landing, full on inner pages */}
          <AppSidebar />

          {/* Content area — offset right on inner pages to clear sidebar */}
          <SidebarLayout>
            <PageTransition>
              {children}
            </PageTransition>
          </SidebarLayout>
        </Providers>
      </body>
    </html>
  );
}
