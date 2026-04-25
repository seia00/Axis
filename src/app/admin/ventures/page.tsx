import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminVenturesClient } from "./client";

export const metadata = { title: "Venture Applications" };

export default async function AdminVenturesPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") redirect("/");

  const applications = await prisma.project.findMany({
    where: { ventureStage: "applied" },
    orderBy: { appliedAt: "desc" },
  });

  const creatorIds = Array.from(new Set(applications.map(a => a.creatorId)));
  const creators = await prisma.user.findMany({
    where: { id: { in: creatorIds } },
    select: { id: true, name: true, email: true },
  });
  const creatorsMap = Object.fromEntries(creators.map(c => [c.id, c]));

  return <AdminVenturesClient applications={applications.map(a => ({ ...a, creator: creatorsMap[a.creatorId] }))} />;
}
