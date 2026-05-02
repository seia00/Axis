import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

// Routes /network → /network/dashboard (if user leads an org) or
// /network/join (if not). Skipping the dashboard double-bounce avoids a
// momentarily-blank page while the redirect chain resolves.
export default async function NetworkPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/signin?callbackUrl=/network/dashboard");

  const org = await prisma.organization.findFirst({
    where: { leaderId: session.user.id },
    select: { id: true },
  });

  if (org) redirect("/network/dashboard");
  redirect("/network/join");
}
