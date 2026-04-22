import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { TierBadge } from "@/components/ui/badge";
import { StarRating } from "@/components/ui/star-rating";
import { OrgReviewSection } from "@/components/directory/org-review-section";
import { formatDate } from "@/lib/utils";
import { MapPin, Globe, ExternalLink, Users, Eye } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const org = await prisma.organization.findUnique({ where: { slug: params.slug } });
  if (!org) return { title: "Not Found" };
  return { title: org.name, description: org.mission.slice(0, 160) };
}

export default async function OrgProfilePage({ params }: Props) {
  const session = await getServerSession(authOptions);

  const org = await prisma.organization.findUnique({
    where: { slug: params.slug },
    include: {
      leader: { select: { name: true } },
      events: {
        where: { date: { gte: new Date() } },
        orderBy: { date: "asc" },
        take: 5,
      },
      reviews: {
        where: { removed: false },
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, school: true } } },
        take: 10,
      },
      _count: { select: { reviews: true } },
    },
  });

  if (!org) notFound();

  await prisma.organization.update({
    where: { id: org.id },
    data: { profileViews: { increment: 1 } },
  });

  const avgRating =
    org.reviews.length > 0
      ? org.reviews.reduce((s, r) => s + r.rating, 0) / org.reviews.length
      : null;

  const userReview = session
    ? org.reviews.find((r) => r.userId === (session.user as any)?.id)
    : null;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Banner */}
      <div className="h-40 sm:h-52 rounded-xl overflow-hidden border border-[var(--border)] bg-gradient-to-br from-indigo-950 to-violet-950 mb-6 relative">
        {org.bannerUrl && (
          <Image src={org.bannerUrl} alt="" fill className="object-cover opacity-50" />
        )}
        <div className="absolute inset-0 grid-bg opacity-40" />
      </div>

      {/* Profile header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start mb-8 -mt-10 px-1">
        <div className="w-20 h-20 rounded-xl border-4 border-[var(--background)] bg-[var(--surface-raised)] flex items-center justify-center overflow-hidden flex-shrink-0">
          {org.logoUrl ? (
            <Image src={org.logoUrl} alt={org.name} width={80} height={80} className="object-cover" />
          ) : (
            <span className="text-2xl font-bold text-indigo-400">{org.name.slice(0, 2).toUpperCase()}</span>
          )}
        </div>

        <div className="flex-1 pt-2">
          <div className="flex flex-wrap items-start gap-2">
            <h1 className="text-2xl font-bold tracking-tight mr-2">{org.name}</h1>
            <TierBadge tier={org.tier} />
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-[var(--muted-foreground)]">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {org.location}
            </span>
            {org.memberCount && (
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {org.memberCount} members
              </span>
            )}
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {org.profileViews} views
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {org.website && (
            <a
              href={org.website}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary py-1.5 px-3 text-xs gap-1.5"
            >
              <Globe className="w-3.5 h-3.5" />
              Website
            </a>
          )}
          {org.instagram && (
            <a
              href={`https://instagram.com/${org.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary py-1.5 px-3 text-xs gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Instagram
            </a>
          )}
          <Link
            href={`/directory/compare?orgs=${org.slug}`}
            className="btn-secondary py-1.5 px-3 text-xs"
          >
            Compare
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Mission */}
          <div className="card">
            <h2 className="text-sm font-semibold text-[var(--foreground)] mb-3">Mission</h2>
            <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">{org.mission}</p>
            {org.activitySummary && (
              <>
                <h3 className="text-sm font-semibold text-[var(--foreground)] mt-4 mb-2">What We Do</h3>
                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">{org.activitySummary}</p>
              </>
            )}
          </div>

          {/* Upcoming events */}
          {org.events.length > 0 && (
            <div className="card">
              <h2 className="text-sm font-semibold text-[var(--foreground)] mb-4">Upcoming Events</h2>
              <div className="space-y-3">
                {org.events.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-[var(--surface-raised)] border border-[var(--border)]"
                  >
                    <div className="w-10 h-10 rounded-lg bg-indigo-950/60 border border-indigo-800/30 flex flex-col items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-indigo-300">
                        {new Date(event.date).toLocaleDateString("en", { month: "short" })}
                      </span>
                      <span className="text-sm font-bold text-indigo-200">
                        {new Date(event.date).getDate()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{event.title}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {event.location ?? (event.isOnline ? "Online" : "TBD")}
                      </p>
                    </div>
                    {event.registrationLink && (
                      <a
                        href={event.registrationLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 flex-shrink-0"
                      >
                        Register <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          <OrgReviewSection
            orgId={org.id}
            reviews={org.reviews.map((r) => ({
              id: r.id,
              rating: r.rating,
              content: r.content,
              createdAt: r.createdAt.toISOString(),
              userName: r.user?.name ?? "Anonymous",
              userSchool: r.user?.school ?? null,
            }))}
            avgRating={avgRating}
            totalReviews={org._count.reviews}
            session={session}
            userReview={userReview ? { rating: userReview.rating, content: userReview.content } : null}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Quick stats */}
          <div className="card">
            <h3 className="text-sm font-semibold mb-4">Details</h3>
            <dl className="space-y-3">
              {[
                { label: "Focus Areas", value: org.focusArea.join(", ") || "—" },
                { label: "Activity Type", value: org.activityType.join(", ") || "—" },
                { label: "School Level", value: org.schoolLevel.join(", ") || "—" },
                { label: "Scope", value: org.isNational ? "National" : "Regional" },
                { label: "Joined AXIS", value: formatDate(org.createdAt) },
              ].map(({ label, value }) => (
                <div key={label}>
                  <dt className="text-xs text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-sm text-[var(--foreground)] mt-0.5">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Rating summary */}
          {avgRating !== null && (
            <div className="card text-center">
              <p className="text-4xl font-bold gradient-text mb-1">{avgRating.toFixed(1)}</p>
              <StarRating rating={Math.round(avgRating)} size="md" className="justify-center" />
              <p className="text-xs text-[var(--muted-foreground)] mt-2">
                {org._count.reviews} student review{org._count.reviews !== 1 ? "s" : ""}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
