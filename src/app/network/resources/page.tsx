import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { hasActiveSubscription } from "@/lib/billing";
import { ResourceCategory } from "@prisma/client";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Download, FileText, DollarSign, Palette, Mail, Users, Package, Lock } from "lucide-react";

export const metadata = { title: "Resource Library" };

const categoryMeta: Record<ResourceCategory, { label: string; icon: typeof FileText; color: string }> = {
  LEGAL: { label: "Legal Templates", icon: FileText, color: "indigo" },
  FINANCIAL: { label: "Financial Tools", icon: DollarSign, color: "emerald" },
  DESIGN: { label: "Design Assets", icon: Palette, color: "violet" },
  COMMUNICATIONS: { label: "Communications", icon: Mail, color: "sky" },
  SUCCESSION: { label: "Succession Playbooks", icon: Users, color: "amber" },
  OTHER: { label: "Other Resources", icon: Package, color: "gray" },
};

export default async function ResourceLibraryPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/signin?callbackUrl=/network/resources");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { subscriptionStatus: true },
  });
  const canAccessResources = hasActiveSubscription(user?.subscriptionStatus);

  const resources = await prisma.resource.findMany({
    orderBy: { uploadedAt: "desc" },
  });

  const grouped = resources.reduce((acc, r) => {
    if (!acc[r.category]) acc[r.category] = [];
    acc[r.category].push(r);
    return acc;
  }, {} as Record<ResourceCategory, typeof resources>);

  const allCategories = Object.keys(categoryMeta) as ResourceCategory[];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight mb-1">Resource Library</h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          Premium templates, toolkits, and playbooks for AXIS member organizations.
        </p>
      </div>

      {!canAccessResources && (
        <div className="rounded-lg border border-cyan-500/20 bg-cyan-950/20 p-5 mb-8 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
            <div>
              <h2 className="font-semibold text-sm">Resource downloads require an active subscription</h2>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">
                Subscribe from Settings to unlock downloads. Your access is checked on the server before every download.
              </p>
            </div>
          </div>
          <Link href="/settings" className="btn-primary text-sm whitespace-nowrap">
            Upgrade / Subscribe
          </Link>
        </div>
      )}

      <div className="space-y-8">
        {allCategories.map((category) => {
          const meta = categoryMeta[category];
          const Icon = meta.icon;
          const items = grouped[category] ?? [];

          return (
            <div key={category}>
              <div className="flex items-center gap-2 mb-4">
                <Icon className={`w-4 h-4 text-${meta.color}-400`} />
                <h2 className="text-sm font-semibold">{meta.label}</h2>
                <span className="text-xs text-[var(--muted-foreground)]">({items.length} resources)</span>
              </div>

              {items.length === 0 ? (
                <div className="rounded-lg border border-[var(--border)] border-dashed p-6 text-center">
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Resources coming soon. Check back later!
                  </p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {items.map((resource) => (
                    <div
                      key={resource.id}
                      className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 hover:border-indigo-500/30 transition-all"
                    >
                      <p className="text-sm font-medium mb-1">{resource.title}</p>
                      {resource.description && (
                        <p className="text-xs text-[var(--muted-foreground)] mb-3 line-clamp-2">
                          {resource.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[var(--muted-foreground)]">
                          {resource.downloadCount} downloads
                        </span>
                        {canAccessResources ? (
                          <a
                            href={`/api/resources/${resource.id}/download`}
                            className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                          >
                            <Download className="w-3 h-3" />
                            Download
                          </a>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
                            <Lock className="w-3 h-3" />
                            Locked
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
