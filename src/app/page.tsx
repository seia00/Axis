import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { prisma } from "@/lib/prisma";
import {
  ArrowRight, LayoutGrid, Rocket, Users, BookOpen,
  Zap, Sparkles, Calendar, Briefcase, TrendingUp, Clock,
  ShieldCheck
} from "lucide-react";
import { differenceInDays } from "date-fns";

const features = [
  {
    icon: LayoutGrid,
    name: "Directory",
    description: "Discover 50+ student organizations across Japan — filter by focus area, location, and tier.",
    href: "/directory",
    color: "indigo",
  },
  {
    icon: Briefcase,
    name: "Opportunities",
    description: "Find competitions, fellowships, and programs tailored to student founders.",
    href: "/opportunities",
    color: "blue",
  },
  {
    icon: Rocket,
    name: "Launch Pad",
    description: "Post your project and recruit co-founders and teammates to build together.",
    href: "/launchpad",
    color: "violet",
  },
  {
    icon: Sparkles,
    name: "AXIS Match",
    description: "AI-powered matching connects you to opportunities, people, and programs.",
    href: "/match",
    color: "purple",
  },
  {
    icon: Users,
    name: "Portfolio",
    description: "Build a profile showcasing your activities, achievements, and impact.",
    href: "/portfolio",
    color: "pink",
  },
  {
    icon: Calendar,
    name: "Calendar",
    description: "Track deadlines, events, and milestones — all in one organized view.",
    href: "/calendar",
    color: "emerald",
  },
  {
    icon: BookOpen,
    name: "Resources",
    description: "Templates, guides, and tools for student founders — free to download.",
    href: "/resources",
    color: "amber",
  },
  {
    icon: TrendingUp,
    name: "Ventures",
    description: "Apply to AXIS Ventures — our youth incubator for ambitious student founders.",
    href: "/ventures",
    color: "orange",
  },
];

const colorMap: Record<string, string> = {
  indigo: "text-indigo-400 bg-indigo-600/10 border-indigo-600/20",
  blue: "text-blue-400 bg-blue-600/10 border-blue-600/20",
  violet: "text-violet-400 bg-violet-600/10 border-violet-600/20",
  purple: "text-purple-400 bg-purple-600/10 border-purple-600/20",
  pink: "text-pink-400 bg-pink-600/10 border-pink-600/20",
  emerald: "text-emerald-400 bg-emerald-600/10 border-emerald-600/20",
  amber: "text-amber-400 bg-amber-600/10 border-amber-600/20",
  orange: "text-orange-400 bg-orange-600/10 border-orange-600/20",
};

const steps = [
  {
    number: "01",
    title: "Create your profile",
    description: "Add your interests, skills, and goals so AXIS can personalize your experience.",
  },
  {
    number: "02",
    title: "Discover what's out there",
    description: "Browse opportunities, projects, and organizations across Japan's student ecosystem.",
  },
  {
    number: "03",
    title: "Build your story",
    description: "Log activities, earn your Verified badge, and track your impact over time.",
  },
];

async function getSpotlightData() {
  try {
    const [opportunities, projects, orgCount, opportunityCount, projectCount] = await Promise.all([
      prisma.opportunity.findMany({
        where: {
          isVerified: true,
          deadline: { gte: new Date() },
        },
        orderBy: { deadline: "asc" },
        take: 4,
      }),
      prisma.project.findMany({
        orderBy: { createdAt: "desc" },
        take: 3,
        include: {
          _count: { select: { roles: true } },
          creator: { select: { name: true, image: true } },
        },
      }),
      prisma.organization.count(),
      prisma.opportunity.count(),
      prisma.project.count(),
    ]);
    return { opportunities, projects, orgCount, opportunityCount, projectCount };
  } catch {
    return {
      opportunities: [],
      projects: [],
      orgCount: 50,
      opportunityCount: 0,
      projectCount: 0,
    };
  }
}

export default async function HomePage() {
  const { opportunities, projects, orgCount, opportunityCount, projectCount } = await getSpotlightData();

  const stats = [
    { label: "Organizations", value: `${orgCount}+` },
    { label: "Students Reached", value: "1,000+"},
    { label: "Opportunities", value: opportunityCount > 0 ? `${opportunityCount}+` : "50+" },
    { label: "Projects", value: projectCount > 0 ? `${projectCount}+` : "20+" },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* SECTION 1 — Hero */}
      <section id="hero" className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg" />
        <div className="absolute inset-0 bg-gradient-to-b from-violet-950/10 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-violet-700/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-indigo-600/15 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-20 text-center">
          <div className="relative inline-flex items-center justify-center mb-6">
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
            Everything a student founder needs,
            <br />
            <span className="gradient-text">in one place.</span>
          </h1>

          <p className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto mb-10 leading-relaxed">
            AXIS connects Japan's student organizations — discover opportunities, build your team,
            track your portfolio, and grow your venture.{" "}
            <span className="text-[var(--foreground)]">Built by high schoolers. Free forever.</span>
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/auth/signin" className="btn-primary text-base px-6 py-3 gap-2">
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="#features" className="btn-secondary text-base px-6 py-3">
              Explore the Platform
            </a>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            {stats.map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="text-3xl font-bold gradient-text">{value}</p>
                <p className="text-sm font-medium text-[var(--foreground)] mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 2 — Feature Grid */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 py-24">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold tracking-tight mb-3">Everything You Need</h2>
          <p className="text-[var(--muted-foreground)] max-w-xl mx-auto">
            Eight tools, one platform. Everything a student founder needs to discover, build, and grow.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map(({ icon: Icon, name, description, href, color }) => {
            const colorClass = colorMap[color] ?? colorMap.indigo;
            const [textColor] = colorClass.split(" ");
            return (
              <Link
                key={href}
                href={href}
                className="group bg-[var(--surface-raised)] border border-[var(--border)] rounded-xl p-5 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className={`w-10 h-10 rounded-lg border flex items-center justify-center mb-4 ${colorClass}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-semibold text-[var(--foreground)] mb-2">{name}</h3>
                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">{description}</p>
                <div className={`flex items-center gap-1 mt-3 text-xs group-hover:gap-2 transition-all ${textColor}`}>
                  Explore <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* SECTION 3 — How It Works */}
      <section className="border-t border-b border-[var(--border)] bg-[var(--surface)] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-3">How It Works</h2>
            <p className="text-[var(--muted-foreground)]">Three steps to getting started on AXIS.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map(({ number, title, description }) => (
              <div key={number} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-600/10 border border-indigo-600/20 text-indigo-400 text-lg font-bold mb-4">
                  {number}
                </div>
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4 — Opportunities Spotlight */}
      {opportunities.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-24">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight mb-1">Upcoming Opportunities</h2>
              <p className="text-sm text-[var(--muted-foreground)]">Verified opportunities with upcoming deadlines</p>
            </div>
            <Link href="/opportunities" className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {opportunities.map(opp => {
              const daysLeft = opp.deadline ? differenceInDays(new Date(opp.deadline), new Date()) : null;
              return (
                <Link
                  key={opp.id}
                  href={`/opportunities/${opp.id}`}
                  className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-xl p-5 hover:border-indigo-500/30 hover:-translate-y-0.5 transition-all flex flex-col"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-950/60 text-indigo-300 capitalize">{opp.type}</span>
                    {opp.isVerified && <ShieldCheck className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />}
                  </div>
                  <h3 className="text-sm font-semibold mb-1 line-clamp-2">{opp.title}</h3>
                  <p className="text-xs text-[var(--muted-foreground)] mb-3">{opp.organization}</p>
                  <div className="mt-auto flex flex-wrap gap-1">
                    {opp.tags.slice(0, 2).map(t => (
                      <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-[var(--surface)] text-[var(--muted-foreground)]">{t}</span>
                    ))}
                  </div>
                  {daysLeft !== null && (
                    <div className="mt-3 pt-3 border-t border-[var(--border)] flex items-center gap-1 text-xs">
                      <Clock className="w-3 h-3 flex-shrink-0" />
                      <span className={daysLeft <= 7 ? "text-red-400" : daysLeft <= 30 ? "text-orange-400" : "text-[var(--muted-foreground)]"}>
                        {daysLeft <= 0 ? "Closing soon" : `${daysLeft}d left`}
                      </span>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* SECTION 5 — Launch Pad Spotlight */}
      {projects.length > 0 && (
        <section className={`${opportunities.length > 0 ? "border-t border-[var(--border)] bg-[var(--surface)]" : ""} py-20`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold tracking-tight mb-1">Recent Projects</h2>
                <p className="text-sm text-[var(--muted-foreground)]">Browse the latest projects looking for team members</p>
              </div>
              <Link href="/launchpad" className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
                Explore All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              {projects.map(project => (
                <Link
                  key={project.id}
                  href={`/launchpad/${project.id}`}
                  className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-xl p-5 hover:border-indigo-500/30 hover:-translate-y-0.5 transition-all flex flex-col"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--surface)] text-[var(--muted-foreground)] capitalize border border-[var(--border)]">
                      {project.stage}
                    </span>
                    {project._count.roles > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-600/10 text-indigo-400 border border-indigo-600/20">
                        {project._count.roles} open role{project._count.roles !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold mb-1">{project.title}</h3>
                  {project.tagline && <p className="text-xs text-indigo-300 mb-2">{project.tagline}</p>}
                  <p className="text-xs text-[var(--muted-foreground)] line-clamp-2 flex-1">{project.description}</p>
                  <div className="mt-3 pt-3 border-t border-[var(--border)] flex items-center gap-1.5">
                    {project.creator?.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={project.creator.image} alt="" className="w-5 h-5 rounded-full" />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-indigo-600/20 flex items-center justify-center">
                        <Users className="w-3 h-3 text-indigo-400" />
                      </div>
                    )}
                    <span className="text-xs text-[var(--muted-foreground)]">{project.creator?.name ?? "Anonymous"}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SECTION 6 — Stats Banner */}
      <section className="border-t border-b border-[var(--border)] bg-gradient-to-r from-indigo-950/30 via-violet-950/20 to-indigo-950/30 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            {stats.map(({ label, value }) => (
              <div key={label}>
                <p className="text-3xl font-bold gradient-text">{value}</p>
                <p className="text-sm text-[var(--muted-foreground)] mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7 — CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-24">
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
              Join thousands of student founders and organization leaders across Japan. Free to join, always.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/auth/signin" className="btn-primary px-6 py-3 text-base gap-2">
                Join AXIS Free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/directory" className="btn-secondary px-6 py-3 text-base">
                Browse Directory
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8 — Footer */}
      <Footer />
    </div>
  );
}
