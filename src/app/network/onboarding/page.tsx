import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Check, Circle, ExternalLink } from "lucide-react";

export const metadata = { title: "Onboarding Hub" };

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/signin");

  const org = await prisma.organization.findFirst({ where: { leaderId: session.user.id } });
  if (!org) redirect("/network/join");

  const steps = [
    {
      title: "Complete your org profile",
      description: "Add mission, location, focus areas, and contact links.",
      complete: !!(org.mission && org.location && org.focusArea.length > 0),
      href: "/network/profile",
    },
    {
      title: "Add a logo and banner",
      description: "Visual identity helps students recognize your org in the Directory.",
      complete: !!(org.logoUrl),
      href: "/network/profile",
    },
    {
      title: "Create your first event",
      description: "Events show up in the unified AXIS calendar and drive discovery.",
      complete: false,
      href: "/network/events/new",
    },
    {
      title: "Download the Onboarding Playbook",
      description: "Our step-by-step guide to running your org on AXIS infrastructure.",
      complete: false,
      href: "/network/resources",
    },
    {
      title: "Invite your co-leaders",
      description: "Add team members so they can manage the org profile too.",
      complete: false,
      href: "/network/team",
    },
    {
      title: "Apply for Verified status",
      description: "Once you have 10+ members and active events, apply for the Verified badge.",
      complete: org.tier !== "MEMBER",
      href: "/network/dashboard",
    },
  ];

  const completed = steps.filter((s) => s.complete).length;
  const progress = Math.round((completed / steps.length) * 100);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight mb-1">Onboarding Hub</h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          Complete these steps to get your org fully set up on AXIS.
        </p>
      </div>

      {/* Progress */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium">{completed} of {steps.length} steps completed</p>
          <p className="text-sm font-bold text-indigo-400">{progress}%</p>
        </div>
        <div className="h-2 bg-[var(--surface-overlay)] rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-600 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {steps.map(({ title, description, complete, href }) => (
          <div
            key={title}
            className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${
              complete
                ? "border-emerald-800/30 bg-emerald-950/10"
                : "border-[var(--border)] bg-[var(--surface)]"
            }`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
              complete ? "bg-emerald-600" : "border-2 border-[var(--border)]"
            }`}>
              {complete ? (
                <Check className="w-3.5 h-3.5 text-white" />
              ) : (
                <Circle className="w-3 h-3 text-[var(--muted-foreground)]" />
              )}
            </div>
            <div className="flex-1">
              <p className={`text-sm font-medium ${complete ? "text-[var(--muted-foreground)] line-through" : ""}`}>
                {title}
              </p>
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{description}</p>
            </div>
            {!complete && (
              <a href={href} className="btn-secondary text-xs py-1 px-3 flex-shrink-0 gap-1">
                Go <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        ))}
      </div>

      {/* Succession section */}
      <div className="mt-8">
        <h2 className="text-sm font-semibold mb-4">Succession Planning</h2>
        <div className="card border-amber-800/20 bg-amber-950/10">
          <p className="text-sm font-medium mb-2">Leadership Handover Guide</p>
          <p className="text-sm text-[var(--muted-foreground)] mb-4">
            Plan ahead for leadership transitions. Our succession playbook walks you through how to document processes, train incoming leaders, and ensure continuity.
          </p>
          <a href="/network/resources" className="btn-secondary text-sm gap-2">
            Download Succession Playbook
          </a>
        </div>
      </div>
    </div>
  );
}
