import { Footer } from "@/components/layout/footer";
import { AxisDiagram } from "@/components/landing/axis-diagram";
import { ProductCards } from "@/components/landing/product-cards";
import { StatsSection } from "@/components/landing/stats-section";
import { HeroSection } from "@/components/landing/hero-section";
import { CTASection } from "@/components/landing/cta-section";
import { prisma } from "@/lib/prisma";

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
  const stats = await getStats();

  return (
    <div className="relative min-h-screen">
      {/* HERO */}
      <HeroSection />

      {/* AXIS DIAGRAM — signature scroll section */}
      <AxisDiagram />

      {/* PRODUCT CARDS */}
      <ProductCards />

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
