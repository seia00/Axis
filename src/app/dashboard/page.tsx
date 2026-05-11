import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DashboardContent } from "./dashboard-content";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/signin?callbackUrl=/dashboard");
  const userId = session.user.id;

  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Last 7 days: one count per day for the activity bar chart
  const dailyCounts = await Promise.all(
    Array.from({ length: 7 }, (_, i) => {
      const dayStart = new Date(now);
      dayStart.setDate(dayStart.getDate() - (6 - i));
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);
      return prisma.opportunity.count({ where: { createdAt: { gte: dayStart, lte: dayEnd } } });
    }),
  );

  const [
    user,
    upcomingEvents,
    weekOppCount,
    weekOrgCount,
    totalUsers,
    totalOpportunities,
    totalOrgs,
    userMatchCount,
    oppTypeCounts,
    allFeaturedOpps,
  ] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, name: true, email: true, image: true, school: true,
        headline: true, bio: true, location: true,
        interests: true, skills: true, goals: true,
        experienceLevel: true,
        twitterHandle: true, instagramHandle: true,
        linkedinUrl: true, websiteUrl: true,
        isVerified: true,
      },
    }),
    prisma.calendarEvent.findMany({
      where: { date: { gte: now }, OR: [{ userId }, { isGlobal: true }] },
      orderBy: { date: "asc" },
      take: 3,
    }),
    prisma.opportunity.count({ where: { createdAt: { gte: oneWeekAgo } } }),
    prisma.organization.count({ where: { createdAt: { gte: oneWeekAgo } } }),
    prisma.user.count(),
    prisma.opportunity.count({ where: { isVerified: true } }),
    prisma.organization.count(),
    prisma.match.count({ where: { fromUserId: userId } }),
    // Opportunity type breakdown for the donut chart
    prisma.opportunity.groupBy({
      by: ["type"],
      _count: { type: true },
      where: { isVerified: true },
      orderBy: { _count: { type: "desc" } },
    }),
    // All verified future opps — pick one per day (deterministic rotation)
    prisma.opportunity.findMany({
      where: {
        isVerified: true,
        OR: [{ deadline: { gte: now } }, { deadline: null }],
      },
      orderBy: { createdAt: "asc" },
      take: 60,
    }),
  ]);

  if (!user) redirect("/auth/signin?callbackUrl=/dashboard");

  // Daily rotation: index into the pool by the day number since epoch
  const todayIndex = Math.floor(Date.now() / 86_400_000);
  const featuredOpportunity =
    allFeaturedOpps.length > 0 ? allFeaturedOpps[todayIndex % allFeaturedOpps.length] : null;

  // Profile completion
  const completionFields: Array<unknown> = [
    user.name, user.headline, user.bio, user.location, user.school,
    user.interests.length > 0 ? user.interests : null,
    user.skills.length > 0 ? user.skills : null,
    user.goals.length > 0 ? user.goals : null,
    user.twitterHandle, user.instagramHandle,
    user.linkedinUrl, user.websiteUrl,
  ];
  const completionPct = Math.round((completionFields.filter(Boolean).length / completionFields.length) * 100);

  return (
    <DashboardContent
      user={{ name: user.name, image: user.image, school: user.school, isVerified: user.isVerified }}
      profileCompletionPct={completionPct}
      featuredOpportunity={
        featuredOpportunity
          ? {
              id: featuredOpportunity.id,
              title: featuredOpportunity.title,
              type: featuredOpportunity.type,
              organization: featuredOpportunity.organization,
              description: featuredOpportunity.description,
              deadline: featuredOpportunity.deadline?.toISOString() ?? null,
              isVerified: featuredOpportunity.isVerified,
              location: featuredOpportunity.location,
              isRemote: featuredOpportunity.isRemote,
            }
          : null
      }
      upcomingEvents={upcomingEvents.map((e) => ({
        id: e.id, title: e.title, date: e.date.toISOString(), type: e.type, color: e.color,
      }))}
      activityCounts={{ newOpportunities: weekOppCount, newOrgs: weekOrgCount }}
      platformStats={{ totalUsers, totalOpportunities, totalOrgs, userMatchCount }}
      weeklyActivity={dailyCounts}
      oppTypeCounts={oppTypeCounts.map((o) => ({ type: o.type, count: o._count.type }))}
    />
  );
}
