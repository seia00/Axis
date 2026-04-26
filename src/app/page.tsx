import Link from "next/link";
import { Footer } from "@/components/layout/footer";
import { Starfield } from "@/components/landing/starfield";
import { AxisDiagram } from "@/components/landing/axis-diagram";
import { ProductCards } from "@/components/landing/product-cards";
import { StatsSection } from "@/components/landing/stats-section";
import { HeroSection } from "@/components/landing/hero-section";
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

function CTASection() {
  return (
    <section className="relative z-10 py-32 px-4 text-center">
      {/* Single ambient glow behind CTA */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        aria-hidden
      >
        <div
          className="w-[400px] h-[220px]"
          style={{
            background: "radial-gradient(ellipse, rgba(139,92,246,0.08) 0%, transparent 70%)",
            filter: "blur(50px)",
          }}
        />
      </div>

      <div className="relative max-w-lg mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
          Ready to start building?
        </h2>
        <p className="text-white/40 text-base mb-8 leading-relaxed">
          Join Japan's community of student founders — free, forever.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/auth/signin"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-lg bg-white text-black font-medium text-sm transition-colors duration-150 hover:bg-white/90"
          >
            Join AXIS Free
          </Link>
          <Link
            href="/directory"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-lg border border-white/[0.10] text-white/55 hover:text-white hover:border-white/[0.20] font-medium text-sm transition-all duration-200"
          >
            Browse Directory
          </Link>
        </div>
      </div>
    </section>
  );
}

export default async function LandingPage() {
  const stats = await getStats();

  return (
    <div className="relative min-h-screen bg-[#09090b]">
      {/* Starfield canvas — fixed, behind everything */}
      <Starfield />

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
