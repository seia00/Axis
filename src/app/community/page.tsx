export const dynamic = "force-dynamic";

import { Footer } from "@/components/layout/footer";
import { NewsletterForm } from "@/components/community/newsletter-form";
import { prisma } from "@/lib/prisma";
import { ExternalLink, Users, Building, Calendar, FileText, TrendingUp } from "lucide-react";

export const metadata = { title: "Community & About" };

const teamMembers = [
  { name: "Seia Funayama", role: "Founder & CEO", school: "International School" },
  { name: "Alex Tanaka", role: "Head of Product", school: "Tokyo International" },
  { name: "Mia Watanabe", role: "Head of Growth", school: "Osaka School" },
  { name: "Ken Suzuki", role: "Lead Engineer", school: "Keio Senior High" },
];

export default async function CommunityPage() {
  const stats = await prisma.impactStat.findMany();
  const statMap = stats.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {} as Record<string, number>);

  const liveStats = [
    { label: "Organizations", value: statMap.total_orgs ?? 0, icon: Building },
    { label: "Students Reached", value: statMap.total_students ?? 0, icon: Users },
    { label: "Events Hosted", value: statMap.total_events ?? 0, icon: Calendar },
    { label: "Resources Downloaded", value: statMap.total_downloads ?? 0, icon: FileText },
  ];

  return (
    <div className="min-h-screen">

      {/* About */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-16 pb-12">
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">AX</span>
            </div>
            <span className="text-lg font-bold">AXIS</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Infrastructure for Japan's
            <br />
            student org ecosystem.
          </h1>
          <p className="text-lg text-[var(--muted-foreground)] leading-relaxed">
            AXIS was founded by high school students who saw a broken system — amazing student organizations operating in silos, reinventing the wheel, and struggling with operations, succession, and visibility. We built the platform we wished existed.
          </p>
        </div>
      </section>

      <div className="border-t border-[var(--border)]" />

      {/* Mission & Principles */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <h2 className="text-2xl font-bold tracking-tight mb-6">What we believe</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { title: "Free forever", body: "AXIS will never charge students or organizations. The platform is a public good." },
            { title: "Student-led", body: "AXIS is built and operated entirely by high schoolers. We know the problem because we lived it." },
            { title: "Open infrastructure", body: "Our resources, templates, and tools are shared freely across the entire network." },
            { title: "Privacy first", body: "Student data is never sold or shared. Reviews are anonymous. Profiles show only what orgs choose to share." },
          ].map(({ title, body }) => (
            <div key={title} className="card">
              <h3 className="font-semibold text-sm mb-2">{title}</h3>
              <p className="text-sm text-[var(--muted-foreground)]">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="border-t border-[var(--border)]" />

      {/* Live stats */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-indigo-400" />
          <h2 className="text-2xl font-bold tracking-tight">Live Impact Dashboard</h2>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-slow" />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {liveStats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="card text-center">
              <Icon className="w-5 h-5 text-indigo-400 mx-auto mb-2" />
              <p className="text-3xl font-bold gradient-text">{value.toLocaleString()}</p>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">{label}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-[var(--muted-foreground)] text-center">
          Stats update in real-time ·{" "}
          <a href="/community/impact" className="text-indigo-400 hover:text-indigo-300">
            View full impact report →
          </a>
        </p>
      </section>

      <div className="border-t border-[var(--border)]" />

      {/* Team */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <h2 className="text-2xl font-bold tracking-tight mb-6">Student Leadership Team</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {teamMembers.map(({ name, role, school }) => (
            <div key={name} className="card text-center p-4">
              <div className="w-12 h-12 rounded-full bg-indigo-950 border border-indigo-800/40 flex items-center justify-center text-indigo-300 font-semibold text-sm mx-auto mb-3">
                {name.split(" ").map(n => n[0]).join("")}
              </div>
              <p className="text-sm font-medium">{name}</p>
              <p className="text-xs text-indigo-400 mt-0.5">{role}</p>
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{school}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="border-t border-[var(--border)]" />

      {/* Discord */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <h2 className="text-2xl font-bold tracking-tight mb-4">Join the Community</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="card p-5">
            <p className="text-sm font-semibold mb-2">Public Student Discord</p>
            <p className="text-sm text-[var(--muted-foreground)] mb-4">
              Open to all students. Find co-founders, ask questions, discover events.
            </p>
            <a
              href="https://discord.gg/axis"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-sm gap-2"
            >
              Join Discord <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
          <div className="card p-5 border-indigo-500/20">
            <p className="text-sm font-semibold mb-2">Member Discord (Org Leaders Only)</p>
            <p className="text-sm text-[var(--muted-foreground)] mb-4">
              Private space for verified org leaders. Share resources, ask for advice, coordinate events.
            </p>
            <a
              href="/network/dashboard"
              className="btn-secondary text-sm gap-2"
            >
              Access via Network Portal <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      <div className="border-t border-[var(--border)]" />

      {/* Newsletter */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-2xl font-bold tracking-tight mb-2">Stay in the loop</h2>
          <p className="text-[var(--muted-foreground)] mb-6">
            New orgs, upcoming events, platform updates, and community stories. No spam, ever.
          </p>
          <NewsletterForm />
        </div>
      </section>

      <Footer />
    </div>
  );
}
