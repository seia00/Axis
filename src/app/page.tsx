import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
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
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[500px] h-[300px] bg-indigo-700/10 rounded-full blur-[100px]" />
      </div>
      <div className="relative max-w-2xl mx-auto">
        <h2 className="text-4xl sm:text-5xl font-bold text-white mb-5 leading-tight">
          Ready to start?
        </h2>
        <p className="text-white/50 text-lg mb-8">
          Join Japan's growing community of student founders — free, forever.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="/auth/signin"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg text-white font-semibold text-sm transition-all duration-200 hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
              boxShadow: "0 0 30px rgba(79,70,229,0.3)",
            }}
          >
            Join AXIS Free
          </a>
          <Link
            href="/directory"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg border text-white/70 hover:text-white font-semibold text-sm transition-all duration-200 backdrop-blur-sm"
            style={{ borderColor: "rgba(255,255,255,0.15)" }}
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
    <div className="relative min-h-screen" style={{ background: "#050a18" }}>
      {/* Starfield — fixed, behind everything */}
      <Starfield />

      {/* Navbar sits above starfield */}
      <div className="relative z-50">
        <Navbar />
      </div>

      {/* HERO */}
      <HeroSection />

      {/* AXIS DIAGRAM — the signature scroll section */}
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
