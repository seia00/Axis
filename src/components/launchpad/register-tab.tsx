"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { OrgRegistrationForm } from "@/components/portal/org-registration-form";
import { Button } from "@/components/ui/button";
import { Building2, ExternalLink } from "lucide-react";

interface Props {
  /** If provided, the user already leads this org */
  leadingOrg?: { name: string; slug: string } | null;
}

export function RegisterTab({ leadingOrg }: Props) {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return <div className="card animate-pulse h-64" />;
  }

  if (!session) {
    return (
      <div className="card flex flex-col items-center gap-4 py-12 text-center">
        <Building2 className="w-10 h-10 text-[var(--muted-foreground)]" />
        <div>
          <p className="text-base font-semibold text-[var(--foreground)]">Sign in to register your organization</p>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            Create an account or sign in to list your student org on AXIS.
          </p>
        </div>
        <Button onClick={() => router.push("/auth/signin?callbackUrl=/launchpad?tab=register")}>
          Sign in
        </Button>
      </div>
    );
  }

  if (leadingOrg) {
    return (
      <div className="card flex flex-col items-center gap-4 py-12 text-center">
        <Building2 className="w-10 h-10 text-indigo-400" />
        <div>
          <p className="text-base font-semibold text-[var(--foreground)]">
            You already manage <span className="text-indigo-300">{leadingOrg.name}</span>
          </p>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            Head to your org profile to update details, add events, or apply for verification.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/network/profile">
            <Button variant="secondary" className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              Edit Profile
            </Button>
          </Link>
          <Link href={`/directory/${leadingOrg.slug}`}>
            <Button variant="secondary">View Public Page</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Register Your Organization</h2>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          List your student organization on AXIS so others can find you, follow your events, and connect with your team.
        </p>
      </div>
      <OrgRegistrationForm onSuccess={() => router.push("/launchpad?tab=orgs")} />
    </div>
  );
}
