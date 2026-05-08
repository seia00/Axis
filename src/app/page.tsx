import { Footer } from "@/components/layout/footer";
import { AxisDiagram } from "@/components/landing/axis-diagram";
import { StatsSection } from "@/components/landing/stats-section";
import { HeroSection } from "@/components/landing/hero-section";
import { CTASection } from "@/components/landing/cta-section";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

async function getStats() {
  try {
    const [orgCount, oppCount, projectCount] = await Promise.all([
      prisma.organization.count(),
      prisma.opportunity.count(),
      prisma.project.count(),
    ]);
    return { orgCount, oppCount, projectCount };
  } catch {
    return { orgCount: 50, oppCount: 50, projectCount: 20 };
  }
}

export default async function LandingPage() {
  // Authenticated users go straight to the dashboard. Anonymous users see the
  // public landing experience (Spline hero, supernova diagram, stats, CTA).
  // Server-side redirect happens before any HTML is sent so there's no flash
  // of the landing page for logged-in users.
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");

  const stats = await getStats();

  return (
    <div className="relative min-h-screen">
      {/* HERO */}
      <HeroSection />

      {/* AXIS DIAGRAM — Supernova animation, holds heading + 6 product nodes */}
      <AxisDiagram />

      {/* STATS */}
      <StatsSection stats={stats} />

      {/* CTA */}
      <CTASection />

      {/* FOOTER */}
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}
