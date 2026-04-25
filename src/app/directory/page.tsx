import { prisma } from "@/lib/prisma";
import { DirectorySearch } from "@/components/directory/directory-search";
import { OrgCard } from "@/components/directory/org-card";
import { LayoutGrid } from "lucide-react";
import { OrgTier, Prisma } from "@prisma/client";

interface SearchParams {
  q?: string;
  focus?: string;
  type?: string;
  location?: string;
  level?: string;
  tier?: string;
  sort?: string;
}

async function getOrgs(params: SearchParams) {
  const where: Prisma.OrganizationWhereInput = {};

  if (params.q) {
    where.OR = [
      { name: { contains: params.q, mode: "insensitive" } },
      { mission: { contains: params.q, mode: "insensitive" } },
    ];
  }

  if (params.focus) {
    where.focusArea = { has: params.focus };
  }

  if (params.tier) {
    where.tier = params.tier as OrgTier;
  }

  const orderBy: Prisma.OrganizationOrderByWithRelationInput =
    params.sort === "newest" ? { createdAt: "desc" } :
    params.sort === "alpha" ? { name: "asc" } :
    params.sort === "views" ? { profileViews: "desc" } :
    { createdAt: "desc" };

  const orgs = await prisma.organization.findMany({
    where,
    orderBy,
    include: {
      _count: { select: { reviews: true, events: true } },
      reviews: { select: { rating: true } },
    },
    take: 50,
  });

  return orgs.map((org) => ({
    ...org,
    avgRating: org.reviews.length > 0
      ? org.reviews.reduce((s, r) => s + r.rating, 0) / org.reviews.length
      : null,
    reviewCount: org._count.reviews,
    eventCount: org._count.events,
  }));
}

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const [orgs, totalCount] = await Promise.all([
    getOrgs(searchParams),
    prisma.organization.count(),
  ]);

  const focusAreas = [
    "Environment", "Technology", "Arts", "Sports", "Academic",
    "Social Impact", "Entrepreneurship", "Culture", "Health", "STEM",
  ];

  const hasActiveFilters = Object.values(searchParams).some(Boolean);

  return (
    <div>
      {/* Hero Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <LayoutGrid className="w-5 h-5 text-indigo-400" />
          <h1 className="text-2xl font-bold tracking-tight">Organization Directory</h1>
        </div>
        <p className="text-sm text-[var(--muted-foreground)] max-w-2xl">
          Discover student organizations across Japan — from entrepreneurship clubs to social enterprises to research groups.
        </p>
        <p className="text-xs text-[var(--muted-foreground)] mt-2">
          <span className="font-medium text-[var(--foreground)]">{totalCount}</span> organizations listed
        </p>
      </div>

      {/* Search & Filters */}
      <DirectorySearch focusAreas={focusAreas} initialParams={searchParams as Record<string, string | undefined>} />

      {/* Results count when filtered */}
      {hasActiveFilters && (
        <p className="text-xs text-[var(--muted-foreground)] mt-4">
          Showing <span className="font-medium text-[var(--foreground)]">{orgs.length}</span> result{orgs.length !== 1 ? "s" : ""}
          {searchParams.q && <> for &quot;<span className="text-[var(--foreground)]">{searchParams.q}</span>&quot;</>}
        </p>
      )}

      {/* Results */}
      {orgs.length === 0 ? (
        <div className="text-center py-20">
          <LayoutGrid className="w-12 h-12 text-[var(--muted-foreground)] mx-auto mb-4 opacity-50" />
          <h3 className="text-base font-medium mb-2">No organizations found</h3>
          <p className="text-sm text-[var(--muted-foreground)]">
            No organizations match your search. Try different filters or check back soon.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {orgs.map((org) => (
            <OrgCard key={org.id} org={org} />
          ))}
        </div>
      )}
    </div>
  );
}
