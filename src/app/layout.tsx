import type { Metadata } from "next";
import {
  Inter,
  JetBrains_Mono,
  Space_Grotesk,
  Instrument_Serif,
  IBM_Plex_Mono,
} from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { PageTransition, Animated3DStackBackground } from "@/components/animation";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { SidebarLayout } from "@/components/layout/sidebar-layout";

// ── Bespoke fonts loaded as CSS variables ──────────────────────────────────
// Each axis diagram node uses one of these to feel like a different brand —
// see src/components/landing/axis-diagram.tsx for the pairings.

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
  weight: ["400", "500", "600", "700"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
  weight: ["400", "500", "600", "700"],
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-instrument",
  weight: ["400"],
  style: ["normal", "italic"],
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-plex-mono",
  weight: ["400", "500", "600"],
});

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
  // Compose all font CSS variable classes onto <html>
  const fontClasses = [
    inter.variable,
    jetbrainsMono.variable,
    spaceGrotesk.variable,
    instrumentSerif.variable,
    ibmPlexMono.variable,
  ].join(" ");

  return (
    <html lang="en" className={`dark ${fontClasses}`}>
      <body className="antialiased min-h-screen text-[var(--foreground)]">
        <Animated3DStackBackground />
        <Providers>
          {/* Desktop sidebar */}
          <AppSidebar />
          {/* Mobile top nav (dropdown) */}
          <MobileNav />

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
