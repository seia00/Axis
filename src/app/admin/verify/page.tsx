import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminVerifyClient } from "./client";

export const metadata = { title: "Verify Items" };

export default async function AdminVerifyPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") redirect("/");

  const [pendingOpportunities, usersWithActivities] = await Promise.all([
    prisma.opportunity.findMany({
      where: { isVerified: false },
      orderBy: { createdAt: "desc" },
    }),
    prisma.activity.groupBy({
      by: ["userId"],
      _count: { _all: true },
      having: { userId: { _count: { gte: 3 } } },
    }),
  ]);

  const userIds = usersWithActivities.map(u => u.userId);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, email: true, image: true },
  });

  return <AdminVerifyClient opportunities={pendingOpportunities} users={users} activityCounts={Object.fromEntries(usersWithActivities.map(u => [u.userId, u._count._all]))} />;
}
