import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { TierBadge } from "@/components/ui/badge";
import { StarRating } from "@/components/ui/star-rating";
import { GitCompare, Check, Minus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export const metadata = { title: "Compare Organizations" };

interface Props {
  searchParams: { orgs?: string };
}

export default async function ComparePage({ searchParams }: Props) {
  const slugs = (searchParams.orgs ?? "").split(",").filter(Boolean).slice(0, 3);

  const orgs = slugs.length > 0
    ? await prisma.organization.findMany({
        where: { slug: { in: slugs } },
        include: {
          reviews: { select: { rating: true } },
          _count: { select: { reviews: true } },
        },
      })
    : [];

  const enriched = orgs.map((org) => ({
    ...org,
    avgRating: org.reviews.length > 0
      ? org.reviews.reduce((s, r) => s + r.rating, 0) / org.reviews.length
      : null,
  }));

  const fields = [
    { label: "Focus Areas", key: "focusArea", render: (v: string[]) => v.join(", ") || "—" },
    { label: "Activity Type", key: "activityType", render: (v: string[]) => v.join(", ") || "—" },
    { label: "Location", key: "location", render: (v: string) => v },
    { label: "Scope", key: "isNational", render: (v: boolean) => v ? "National" : "Regional" },
    { label: "School Level", key: "schoolLevel", render: (v: string[]) => v.join(", ") || "—" },
    { label: "Member Count", key: "memberCount", render: (v: number | null) => v ? `${v} members` : "—" },
    { label: "Verification", key: "verified", render: (v: boolean) => v ? <span className="flex items-center gap-1 text-emerald-400"><Check className="w-3.5 h-3.5" /> Verified</span> : <span className="flex items-center gap-1 text-[var(--muted-foreground)]"><Minus className="w-3.5 h-3.5" /> Not verified</span> },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-2 mb-2">
          <GitCompare className="w-5 h-5 text-indigo-400" />
          <h1 className="text-2xl font-bold tracking-tight">Compare Organizations</h1>
        </div>
        <p className="text-sm text-[var(--muted-foreground)] mb-8">
          Select up to 3 organizations to compare side-by-side
        </p>

        {enriched.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[var(--muted-foreground)] mb-4">
              Select organizations from the Directory to compare them.
            </p>
            <Link href="/directory" className="btn-primary">
              Browse Directory
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="w-40 text-left p-4 text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider border-b border-[var(--border)]">
                    Field
                  </th>
                  {enriched.map((org) => (
                    <th key={org.id} className="p-4 border-b border-[var(--border)] min-w-48">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] flex items-center justify-center overflow-hidden">
                          {org.logoUrl ? (
                            <Image src={org.logoUrl} alt={org.name} width={48} height={48} className="object-cover" />
                          ) : (
                            <span className="text-sm font-bold text-indigo-400">{org.name.slice(0, 2).toUpperCase()}</span>
                          )}
                        </div>
                        <Link href={`/directory/${org.slug}`} className="text-sm font-semibold hover:text-indigo-300 transition-colors text-center">
                          {org.name}
                        </Link>
                        <TierBadge tier={org.tier} />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Rating row */}
                <tr>
                  <td className="p-4 text-sm text-[var(--muted-foreground)] border-b border-[var(--border)]">Rating</td>
                  {enriched.map((org) => (
                    <td key={org.id} className="p-4 text-center border-b border-[var(--border)]">
                      {org.avgRating !== null ? (
                        <div className="flex flex-col items-center gap-1">
                          <StarRating rating={Math.round(org.avgRating)} size="sm" />
                          <span className="text-sm font-semibold">{org.avgRating.toFixed(1)}</span>
                          <span className="text-xs text-[var(--muted-foreground)]">({org._count.reviews} reviews)</span>
                        </div>
                      ) : (
                        <span className="text-sm text-[var(--muted-foreground)]">No reviews</span>
                      )}
                    </td>
                  ))}
                </tr>

                {fields.map(({ label, key, render }) => (
                  <tr key={key}>
                    <td className="p-4 text-sm text-[var(--muted-foreground)] border-b border-[var(--border)]">{label}</td>
                    {enriched.map((org) => (
                      <td key={org.id} className="p-4 text-sm text-center border-b border-[var(--border)]">
                        {(render as any)((org as any)[key])}
                      </td>
                    ))}
                  </tr>
                ))}

                {/* Action row */}
                <tr>
                  <td className="p-4" />
                  {enriched.map((org) => (
                    <td key={org.id} className="p-4 text-center">
                      <Link href={`/directory/${org.slug}`} className="btn-primary text-xs py-1.5 px-4">
                        View Profile
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
