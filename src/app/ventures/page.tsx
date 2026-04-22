import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Rocket, Users, BookOpen, Target, ArrowRight, Zap } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "AXIS Ventures" };

export default function VenturesPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[var(--border)]">
        <div className="absolute inset-0 grid-bg" />
        <div className="absolute inset-0 bg-gradient-to-b from-violet-950/20 via-transparent to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/30 bg-violet-950/40 text-violet-300 text-xs font-medium mb-8">
            <Rocket className="w-3 h-3" />
            Applications open for Cohort 2
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            AXIS <span className="gradient-text">Ventures</span>
          </h1>
          <p className="text-lg text-[var(--muted-foreground)] max-w-xl mx-auto mb-8">
            An incubation program for high-potential student initiatives that don't yet exist as formal organizations. From idea to launch.
          </p>
          <Link href="/ventures/apply" className="btn-primary text-base px-6 py-3 gap-2">
            Apply to Cohort 2 <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* What you get */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <h2 className="text-2xl font-bold tracking-tight text-center mb-10">What you get</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Users, title: "Mentorship", desc: "Regular 1-on-1s with experienced student leaders and AXIS advisors." },
            { icon: Users, title: "Peer Cohort", desc: "Be part of a cohort of 5–10 ventures tackling different problems together." },
            { icon: Target, title: "Launch Checklist", desc: "A structured milestone tracker from idea validation to official launch." },
            { icon: BookOpen, title: "Full Resource Library", desc: "Immediate access to all AXIS templates, toolkits, and legal documents." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card">
              <Icon className="w-6 h-6 text-violet-400 mb-3" />
              <h3 className="text-sm font-semibold mb-2">{title}</h3>
              <p className="text-sm text-[var(--muted-foreground)]">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="border-t border-[var(--border)] bg-[var(--surface)] py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold tracking-tight text-center mb-10">The journey</h2>
          <div className="relative">
            <div className="absolute left-5 top-0 bottom-0 w-px bg-[var(--border)]" />
            <div className="space-y-8">
              {[
                { phase: "Apply", desc: "Submit your application with your idea, team, and vision.", icon: "📝" },
                { phase: "Assessment", desc: "AXIS team reviews applications. Top ventures are invited to a 20-min interview.", icon: "🔍" },
                { phase: "Cohort Launch", desc: "Accepted ventures join a 3-month cohort with weekly check-ins.", icon: "🚀" },
                { phase: "Milestone Track", desc: "Work through the launch checklist with mentor support.", icon: "📊" },
                { phase: "Launch Day", desc: "Present your venture to the AXIS community and formally join the Directory.", icon: "🎉" },
              ].map(({ phase, desc, icon }) => (
                <div key={phase} className="flex gap-6 pl-12 relative">
                  <div className="absolute left-0 w-10 h-10 rounded-full bg-[var(--surface-overlay)] border border-[var(--border)] flex items-center justify-center text-lg">
                    {icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">{phase}</h3>
                    <p className="text-sm text-[var(--muted-foreground)] mt-1">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
        <Zap className="w-10 h-10 text-violet-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold tracking-tight mb-3">Have an idea? Apply now.</h2>
        <p className="text-[var(--muted-foreground)] mb-6 max-w-md mx-auto">
          Applications for Cohort 2 are open. We accept 5–10 ventures per cohort.
        </p>
        <Link href="/ventures/apply" className="btn-primary px-6 py-3 text-base">
          Apply to Cohort 2
        </Link>
      </section>

      <Footer />
    </div>
  );
}
