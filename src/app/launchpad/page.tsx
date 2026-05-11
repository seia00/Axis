import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LaunchpadHub } from "./launchpad-hub";

type Tab = "people" | "orgs" | "register";
const VALID_TABS: Tab[] = ["people", "orgs", "register"];

export default async function LaunchpadPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const params     = await searchParams;
  const rawTab     = params?.tab ?? "people";
  const initialTab = (VALID_TABS.includes(rawTab as Tab) ? rawTab : "people") as Tab;

  // Server-side: check if the current user already leads an org (for the Register tab)
  let leadingOrg: { name: string; slug: string } | null = null;
  const session = await getServerSession(authOptions);
  if (session) {
    const org = await prisma.organization.findFirst({
      where:  { leaderId: session.user.id },
      select: { name: true, slug: true },
    });
    leadingOrg = org ?? null;
  }

  return (
    <Suspense fallback={null}>
      <LaunchpadHub initialTab={initialTab} leadingOrg={leadingOrg} />
    </Suspense>
  );
}
