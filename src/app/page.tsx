import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ArrowRight, LayoutGrid, Network, Rocket, Users, BookOpen, Star, ShieldCheck, Zap } from "lucide-react";

const stats = [
  { label: "Organizations", value: "50+", suffix: "and growing" },
  { label: "Students Reached", value: "1,000+", suffix: "across Japan" },
  { label: "Events Hosted", value: "200+", suffix: "this year" },
  { label: "Resources", value: "40+", suffix: "free to download" },
];

const products = [
  {
    icon: LayoutGrid,
    name: "AXIS Directory",
    tagline: "Find your community",
    description: "Browse and filter 50+ verified student organizations across Japan. Compare orgs, read reviews, and discover events — all in one place.",
    href: "/directory",
    color: "indigo",
  },
  {
    icon: Network,
    name: "Network Portal",
    tagline: "Run your org better",
    description: "A private workspace for org leaders. Manage your profile, access shared resources, initiate mergers, and onboard your next generation of leaders.",
    href: "/network",
    color: "violet",
  },
  {
    icon: Rocket,
    name: "AXIS Ventures",
    tagline: "Launch something new",
    description: "Apply to our incubation program for high-potential student initiatives. Get mentorship, a peer cohort, and the infrastructure to go from idea to launch.",
    href: "/ventures",
    color: "purple",
  },
  {
    icon: BookOpen,
    name: "Resource Library",
    tagline: "Shared infrastructure",
    description: "40+ free templates, playbooks, and toolkits — legal documents, budgeting tools, design assets, and succession guides for every student org.",
    href: "/network/resources",
    color: "sky",
  },
];

const testimonials = [
  {
    quote: "AXIS gave us the infrastructure we didn't know we needed. Our merger process was smooth because of their facilitation team.",
    org: "Tokyo Youth Climate Network",
    tier: "VERIFIED" as const,
  },
  {
    quote: "The Resource Library saved us 20+ hours of legal paperwork. The MOU templates alone were worth joining the network.",
    org: "Kansai Debate Alliance",
    tier: "PARTNER" as const,
  },
  {
    quote: "We went from a group chat to a fully onboarded AXIS member in one week. The checklist was incredibly clear.",
    org: "Osaka Social Innovation Lab",
    tier: "MEMBER" as const,
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg" />
        <div className="absolute inset-0 bg-gradient-to-b from-violet-950/10 via-transparent to-transparent" />

        {/* Deep ambient glow orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-violet-700/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-indigo-600/15 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-20 text-center">
          {/* Logo hero mark */}
          <div className="relative inline-flex items-center justify-center mb-6">
            {/* Glow layers behind logo */}
            <div className="absolute inset-0 scale-75 bg-violet-600/30 rounded-full blur-3xl logo-pulse" />
            <div className="absolute inset-0 scale-50 bg-indigo-500/20 rounded-full blur-2xl" />
            <Image
              src="/AXISLOGO.png"
              alt="AXIS"
              width={480}
              height={240}
              className="relative w-72 sm:w-96 lg:w-[480px] h-auto object-contain drop-shadow-[0_0_80px_rgba(139,92,246,0.55)] select-none"
              priority
            />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-950/40 text-indigo-300 text-xs font-medium mb-6">
            <Zap className="w-3 h-3" />
            Now live across Japan — 50+ organizations and counting
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08] mb-5">
            <span className="gradient-text">Infrastructure</span>
            {" "}for Japan's
            <br />
            student org ecosystem.
          </h1>

          <p className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto mb-10 leading-relaxed">
            The platform backbone that helps student organizations across Japan discover each other,
            share resources, merge strategically, and grow sustainably.{" "}
            <span className="text-[var(--foreground)]">Built by high schoolers. Free forever.</span>
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/directory" className="btn-primary text-base px-6 py-3 gap-2">
              Browse Organizations
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/community" className="btn-secondary text-base px-6 py-3">
              How AXIS Works
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            {stats.map(({ label, value, suffix }) => (
              <div key={label} className="text-center">
                <p className="text-3xl font-bold gradient-text">{value}</p>
                <p className="text-sm font-medium text-[var(--foreground)] mt-0.5">{label}</p>
                <p className="text-xs text-[var(--muted-foreground)]">{suffix}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-24">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold tracking-tight mb-3">Four products. One platform.</h2>
          <p className="text-[var(--muted-foreground)] max-w-xl mx-auto">
            Everything a student organization needs — from discovery to operations to growth.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {products.map(({ icon: Icon, name, tagline, description, href }) => (
            <Link
              key={href}
              href={href}
              className="group rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 hover:border-indigo-500/30 hover:bg-[var(--surface-raised)] transition-all duration-200"
            >
              <div className={`w-10 h-10 rounded-lg bg-indigo-600/10 border border-indigo-600/20 flex items-center justify-center mb-4`}>
                <Icon className="w-5 h-5 text-indigo-400" />
              </div>
              <p className="text-xs font-medium text-indigo-400 mb-1">{tagline}</p>
              <h3 className="text-base font-semibold text-[var(--foreground)] mb-2">{name}</h3>
              <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">{description}</p>
              <div className="flex items-center gap-1 mt-4 text-xs text-indigo-400 group-hover:text-indigo-300 transition-colors">
                Explore {name} <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Tier system */}
      <section className="border-t border-b border-[var(--border)] bg-[var(--surface)] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-3">The AXIS Tier System</h2>
            <p className="text-[var(--muted-foreground)]">Three tiers of recognition — from Member to Partner.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { badge: "AXIS Member", icon: Users, color: "indigo", description: "Any student organization can join AXIS as a Member. Get listed in the Directory, access the Resource Library, and join the Network." },
              { badge: "AXIS Verified", icon: ShieldCheck, color: "violet", description: "Verified organizations meet defined activity, membership, and profile standards. Get a trust badge and priority visibility in the Directory." },
              { badge: "AXIS Partner", icon: Star, color: "amber", description: "Partners are the most active organizations in the network. Deep collaboration opportunities, featured placement, and direct AXIS support." },
            ].map(({ badge, icon: Icon, color, description }) => (
              <div key={badge} className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-6">
                <Icon className={`w-8 h-8 mb-4 ${color === "indigo" ? "text-indigo-400" : color === "violet" ? "text-violet-400" : "text-amber-400"}`} />
                <h3 className="font-semibold mb-2">{badge}</h3>
                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight mb-3">From the network</h2>
          <p className="text-[var(--muted-foreground)]">What org leaders say about AXIS.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map(({ quote, org, tier }) => (
            <div key={org} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
              <div className="flex items-center gap-1 mb-4">
                {[1,2,3,4,5].map(s => <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
              </div>
              <p className="text-sm text-[var(--foreground)] leading-relaxed mb-4">"{quote}"</p>
              <div className="flex items-center justify-between">
                <p className="text-xs text-[var(--muted-foreground)]">{org}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  tier === "PARTNER" ? "bg-amber-950/80 text-amber-300 border border-amber-800/40" :
                  tier === "VERIFIED" ? "bg-violet-950/80 text-violet-300 border border-violet-800/40" :
                  "bg-indigo-950/80 text-indigo-300 border border-indigo-800/40"
                }`}>{tier === "PARTNER" ? "★ Partner" : tier === "VERIFIED" ? "✓ Verified" : "Member"}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-24">
        <div className="relative rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/40 to-violet-950/40 p-12 text-center overflow-hidden">
          <div className="absolute inset-0 grid-bg opacity-50" />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-96 h-48 bg-violet-700/15 rounded-full blur-3xl" />
          </div>
          <div className="relative">
            <div className="flex justify-center mb-6">
              <Image
                src="/AXISLOGO.png"
                alt="AXIS"
                width={160}
                height={80}
                className="h-12 w-auto object-contain drop-shadow-[0_0_30px_rgba(139,92,246,0.6)]"
              />
            </div>
            <h2 className="text-3xl font-bold tracking-tight mb-3">Ready to join the network?</h2>
            <p className="text-[var(--muted-foreground)] mb-8 max-w-lg mx-auto">
              Whether you're leading an org or looking for community, AXIS is free to join and always will be.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/auth/signin" className="btn-primary px-6 py-3 text-base">
                Join AXIS — It's Free
              </Link>
              <Link href="/directory" className="btn-secondary px-6 py-3 text-base">
                Browse Directory
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
