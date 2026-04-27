"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, Flag, Trash2, RotateCcw, Loader2, Star, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

interface Review {
  id: string;
  rating: number;
  content: string;
  createdAt: string;
  removed: boolean;
  removedBy: string | null;
  user: { id: string; name: string | null; email: string };
  org: { id: string; name: string; slug: string };
}

type FilterStatus = "all" | "published" | "removed";

const FILTERS: { label: string; value: FilterStatus }[] = [
  { label: "All", value: "all" },
  { label: "Published", value: "published" },
  { label: "Removed / Flagged", value: "removed" },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-3 h-3 ${i < rating ? "text-amber-400 fill-amber-400" : "text-white/20"}`}
        />
      ))}
    </span>
  );
}

export default function AdminReviewsPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchReviews = useCallback(async (status: FilterStatus) => {
    setLoading(true);
    const params = status !== "all" ? `?status=${status}` : "";
    const res = await fetch(`/api/reviews${params}`);
    if (res.ok) setReviews(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchReviews(filter); }, [filter, fetchReviews]);

  const doAction = async (id: string, action: "flag" | "unflag" | "remove") => {
    setActionLoading(id + action);
    await fetch("/api/reviews", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    setActionLoading(null);
    fetchReviews(filter);
  };

  const doDelete = async (id: string) => {
    setActionLoading(id + "delete");
    await fetch(`/api/reviews?id=${id}`, { method: "DELETE" });
    setActionLoading(null);
    setDeleteId(null);
    fetchReviews(filter);
  };

  const published = reviews.filter(r => !r.removed).length;
  const removed = reviews.filter(r => r.removed).length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="w-5 h-5 text-indigo-400" />
        <h1 className="text-2xl font-bold tracking-tight">Review Moderation</h1>
        <div className="flex gap-2 ml-2">
          <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-800/40">
            {published} published
          </span>
          <span className="px-2 py-0.5 text-xs rounded-full bg-red-950/60 text-red-300 border border-red-800/40">
            {removed} removed
          </span>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-lg bg-[var(--surface-raised)] w-fit">
        {FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              filter === f.value
                ? "bg-indigo-600 text-white"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="card text-center py-16">
          <MessageSquare className="w-10 h-10 text-[var(--muted-foreground)] mx-auto mb-3 opacity-30" />
          <p className="text-[var(--muted-foreground)]">No reviews found.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-[var(--border)] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--surface-raised)]">
                {["Reviewer", "Organization", "Rating", "Review", "Date", "Status", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {reviews.map(review => (
                <>
                  <tr
                    key={review.id}
                    className={`hover:bg-[var(--surface-raised)] transition-colors ${review.removed ? "opacity-60" : ""}`}
                  >
                    {/* Reviewer */}
                    <td className="px-4 py-3">
                      <p className="font-medium text-xs">{review.user.name ?? "—"}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">{review.user.email}</p>
                    </td>
                    {/* Org */}
                    <td className="px-4 py-3">
                      <Link
                        href={`/directory/${review.org.slug}`}
                        className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                        target="_blank"
                      >
                        {review.org.name}
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                    {/* Rating */}
                    <td className="px-4 py-3">
                      <StarRating rating={review.rating} />
                    </td>
                    {/* Review preview */}
                    <td className="px-4 py-3 max-w-[240px]">
                      <p className="text-xs text-[var(--muted-foreground)] line-clamp-2">{review.content}</p>
                      {review.content.length > 80 && (
                        <button
                          onClick={() => setExpanded(expanded === review.id ? null : review.id)}
                          className="text-xs text-indigo-400 hover:text-indigo-300 mt-0.5"
                        >
                          {expanded === review.id ? "Collapse" : "Read more"}
                        </button>
                      )}
                    </td>
                    {/* Date */}
                    <td className="px-4 py-3 text-xs text-[var(--muted-foreground)] whitespace-nowrap">
                      {formatDate(review.createdAt)}
                    </td>
                    {/* Status */}
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        review.removed
                          ? "bg-red-950/60 text-red-300 border border-red-800/40"
                          : "bg-emerald-950/60 text-emerald-300 border border-emerald-800/40"
                      }`}>
                        {review.removed ? "Removed" : "Published"}
                      </span>
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {!review.removed ? (
                          <button
                            onClick={() => doAction(review.id, "flag")}
                            disabled={!!actionLoading}
                            title="Flag & hide"
                            className="p-1.5 rounded hover:bg-amber-950/30 text-[var(--muted-foreground)] hover:text-amber-400 transition-colors"
                          >
                            {actionLoading === review.id + "flag"
                              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              : <Flag className="w-3.5 h-3.5" />}
                          </button>
                        ) : (
                          <button
                            onClick={() => doAction(review.id, "unflag")}
                            disabled={!!actionLoading}
                            title="Restore"
                            className="p-1.5 rounded hover:bg-emerald-950/30 text-[var(--muted-foreground)] hover:text-emerald-400 transition-colors"
                          >
                            {actionLoading === review.id + "unflag"
                              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              : <RotateCcw className="w-3.5 h-3.5" />}
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteId(review.id)}
                          disabled={!!actionLoading}
                          title="Delete permanently"
                          className="p-1.5 rounded hover:bg-red-950/30 text-[var(--muted-foreground)] hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {/* Expanded row */}
                  {expanded === review.id && (
                    <tr key={review.id + "-expanded"} className="bg-[var(--surface-raised)]">
                      <td colSpan={7} className="px-4 py-3">
                        <p className="text-sm text-[var(--foreground)] leading-relaxed max-w-2xl">
                          {review.content}
                        </p>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
          <div className="relative bg-[var(--surface-raised)] rounded-xl border border-[var(--border)] p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-semibold mb-2">Delete Review?</h3>
            <p className="text-sm text-[var(--muted-foreground)] mb-5">
              This permanently deletes the review and cannot be undone. Use "Flag" instead if you want to hide it temporarily.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => setDeleteId(null)}>Cancel</Button>
              <Button
                onClick={() => doDelete(deleteId)}
                loading={actionLoading === deleteId + "delete"}
                className="bg-red-600 hover:bg-red-500"
              >
                Delete Permanently
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
