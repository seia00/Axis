import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { OrgProfileEditor } from "@/components/portal/org-profile-editor";

export const metadata = { title: "Edit Profile" };

export default async function OrgProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/signin");

  const org = await prisma.organization.findFirst({
    where: { leaderId: session.user.id },
  });

  if (!org) redirect("/network/join");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight mb-1">Edit Profile</h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          Changes are reflected publicly in the Directory immediately.
        </p>
      </div>
      <OrgProfileEditor org={org} />
    </div>
  );
}
