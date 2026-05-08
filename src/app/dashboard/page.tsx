import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DashboardContent } from "./dashboard-content";

export const metadata = { title: "Dashboard" };

/**
 * Logged-in command center.
 *
 * Anonymous users hitting this URL get bounced to sign-in with a callback
 * back here. Logged-in users see a personalized dashboard with quick-access
 * cards, profile completion, featured opportunity, and upcoming events.
 *
 * Data fetched in parallel (promise.all) so the cold render is fast even
 * when DB latency is high.
 */
export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/dashboard");
  }
  const userId = session.user.id;

  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // ── Pull all dashboard data in parallel ────────────────────────────────
  const [user, featuredOpportunity, upcomingEvents, weekOppCount, weekOrgCount] =
    await Promise.all([
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
      // Featured opp: most recently created verified opportunity with future
      // deadline. Falls back to most recent if no verified ones exist.
      prisma.opportunity
        .findFirst({
          where: {
            isVerified: true,
            OR: [{ deadline: { gte: now } }, { deadline: null }],
          },
          orderBy: { createdAt: "desc" },
        })
        .then(
          (opp) =>
            opp ??
            prisma.opportunity.findFirst({
              orderBy: { createdAt: "desc" },
            }),
        ),
      // Upcoming events: next 3 calendar events (user's own OR global)
      prisma.calendarEvent.findMany({
        where: {
          date: { gte: now },
          OR: [{ userId }, { isGlobal: true }],
        },
        orderBy: { date: "asc" },
        take: 3,
      }),
      // Activity counts — last 7 days
      prisma.opportunity.count({ where: { createdAt: { gte: oneWeekAgo } } }),
      prisma.organization.count({ where: { createdAt: { gte: oneWeekAgo } } }),
    ]);

  if (!user) {
    // Session exists but user row deleted — force re-auth
    redirect("/auth/signin?callbackUrl=/dashboard");
  }

  // ── Profile completion: % of fillable fields with non-empty values ─────
  const completionFields: Array<unknown> = [
    user.name, user.headline, user.bio, user.location, user.school,
    user.interests.length > 0 ? user.interests : null,
    user.skills.length > 0 ? user.skills : null,
    user.goals.length > 0 ? user.goals : null,
    user.twitterHandle, user.instagramHandle,
    user.linkedinUrl, user.websiteUrl,
  ];
  const filled = completionFields.filter(Boolean).length;
  const completionPct = Math.round((filled / completionFields.length) * 100);

  return (
    <DashboardContent
      user={{
        name: user.name,
        image: user.image,
        school: user.school,
        isVerified: user.isVerified,
      }}
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
        id: e.id,
        title: e.title,
        date: e.date.toISOString(),
        type: e.type,
        color: e.color,
      }))}
      activityCounts={{
        newOpportunities: weekOppCount,
        newOrgs: weekOrgCount,
      }}
    />
  );
}
