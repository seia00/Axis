import Link from "next/link";
import Image from "next/image";
import { TierBadge } from "@/components/ui/badge";
import { StarRating } from "@/components/ui/star-rating";
import { MapPin, Calendar, Users } from "lucide-react";
import { OrgTier } from "@prisma/client";
import { truncate } from "@/lib/utils";

interface OrgCardOrg {
  id: string;
  name: string;
  slug: string;
  mission: string;
  logoUrl: string | null;
  location: string;
  focusArea: string[];
  tier: OrgTier;
  memberCount: number | null;
  avgRating: number | null;
  reviewCount: number;
  eventCount: number;
}

export function OrgCard({ org }: { org: OrgCardOrg }) {
  return (
    <Link
      href={`/directory/${org.slug}`}
      className="group block rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:border-indigo-500/30 hover:bg-[var(--surface-raised)] transition-all duration-200"
    >
      <div className="p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] flex items-center justify-center flex-shrink-0 overflow-hidden">
            {org.logoUrl ? (
              <Image src={org.logoUrl} alt={org.name} width={40} height={40} className="object-cover" />
            ) : (
              <span className="text-sm font-bold text-indigo-400">
                {org.name.slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-[var(--foreground)] truncate group-hover:text-indigo-300 transition-colors">
              {org.name}
            </h3>
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-[var(--muted-foreground)] flex-shrink-0" />
              <span className="text-xs text-[var(--muted-foreground)] truncate">{org.location}</span>
            </div>
          </div>
          <TierBadge tier={org.tier} />
        </div>

        <p className="text-sm text-[var(--muted-foreground)] leading-relaxed mb-4 line-clamp-2">
          {truncate(org.mission, 120)}
        </p>

        <div className="flex flex-wrap gap-1 mb-4">
          {org.focusArea.slice(0, 3).map((area) => (
            <span
              key={area}
              className="px-2 py-0.5 text-xs rounded-full bg-[var(--surface-overlay)] text-[var(--muted-foreground)] border border-[var(--border)]"
            >
              {area}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
          <div className="flex items-center gap-3">
            {org.memberCount && (
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {org.memberCount}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {org.eventCount} events
            </span>
          </div>
          {org.avgRating !== null ? (
            <div className="flex items-center gap-1">
              <StarRating rating={Math.round(org.avgRating)} size="sm" />
              <span className="font-medium">{org.avgRating.toFixed(1)}</span>
              <span className="text-[var(--muted-foreground)]">({org.reviewCount})</span>
            </div>
          ) : (
            <span className="text-[var(--muted-foreground)]">No reviews yet</span>
          )}
        </div>
      </div>
    </Link>
  );
}
