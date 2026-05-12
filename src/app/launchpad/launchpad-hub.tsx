"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { useSession } from "next-auth/react";
import { Users, Building2, PlusCircle } from "lucide-react";
import { PeopleTab } from "@/components/launchpad/people-tab";
import { OrgsTab } from "@/components/launchpad/orgs-tab";
import { RegisterTab } from "@/components/launchpad/register-tab";
import { PremiumBanner } from "@/components/ui/premium-banner";

type Tab = "people" | "orgs" | "register";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "people",   label: "People",           icon: Users },
  { id: "orgs",     label: "Organizations",    icon: Building2 },
  { id: "register", label: "Register Org",     icon: PlusCircle },
];

interface Props {
  initialTab: Tab;
  leadingOrg?: { name: string; slug: string } | null;
}

export function LaunchpadHub({ initialTab, leadingOrg }: Props) {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const active       = (searchParams.get("tab") as Tab | null) ?? initialTab;
  const { data: session } = useSession();

  const setTab = useCallback((tab: Tab) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`/launchpad?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Launchpad</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          Connect with student founders, discover organizations, and register your own.
        </p>
      </div>

      {/* Tab bar */}
      <div className="border-b border-[var(--border)]">
        <div className="flex gap-1 -mb-px">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                active === id
                  ? "border-violet-500 text-[var(--foreground)]"
                  : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--border)]"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Premium banner — shown to non-subscribers only */}
      {(session?.user as { subscriptionStatus?: string })?.subscriptionStatus !== "active" && (
        <PremiumBanner variant="membership" />
      )}

      {/* Tab content */}
      {active === "people"   && <PeopleTab />}
      {active === "orgs"     && <OrgsTab />}
      {active === "register" && <RegisterTab leadingOrg={leadingOrg} />}
    </div>
  );
}
