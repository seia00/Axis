"use client";

import { useState } from "react";
import { Session } from "next-auth";
import { StarRating } from "@/components/ui/star-rating";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";
import { MessageSquare, Lock } from "lucide-react";
import Link from "next/link";

interface Review {
  id: string;
  rating: number;
  content: string;
  createdAt: string;
  userName: string;
  userSchool: string | null;
}

interface Props {
  orgId: string;
  reviews: Review[];
  avgRating: number | null;
  totalReviews: number;
  session: Session | null;
  userReview: { rating: number; content: string } | null;
}

export function OrgReviewSection({ orgId, reviews, totalReviews, session, userReview }: Props) {
  const [rating, setRating] = useState(userReview?.rating ?? 0);
  const [content, setContent] = useState(userReview?.content ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (rating === 0 || content.trim().length < 10) {
      setError("Please provide a rating and at least 10 characters.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId, rating, content }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to submit");
      }
      setSubmitted(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-5">
        <MessageSquare className="w-4 h-4 text-indigo-400" />
        <h2 className="text-sm font-semibold">Student Reviews</h2>
        <span className="text-xs text-[var(--muted-foreground)]">({totalReviews})</span>
      </div>

      {/* Submit review */}
      {session ? (
        !userReview && !submitted ? (
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] p-4 mb-5">
            <p className="text-sm font-medium mb-3">Share your experience</p>
            <StarRating
              rating={rating}
              interactive
              onRate={setRating}
              size="lg"
              className="mb-3"
            />
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write an honest, constructive review..."
              rows={3}
              className="mb-3"
            />
            {error && <p className="text-xs text-red-400 mb-2">{error}</p>}
            <Button onClick={handleSubmit} loading={submitting} size="sm">
              Submit Review
            </Button>
            <p className="text-xs text-[var(--muted-foreground)] mt-2">
              Reviews are anonymous — org leaders cannot see your identity.
            </p>
          </div>
        ) : submitted ? (
          <div className="rounded-lg border border-emerald-800/30 bg-emerald-950/20 p-4 mb-5 text-sm text-emerald-300">
            Review submitted — thank you!
          </div>
        ) : (
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] p-4 mb-5 text-sm text-[var(--muted-foreground)]">
            You've already reviewed this organization.
          </div>
        )
      ) : (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] p-4 mb-5 flex items-center gap-3">
          <Lock className="w-4 h-4 text-[var(--muted-foreground)] flex-shrink-0" />
          <div>
            <p className="text-sm font-medium">Sign in to leave a review</p>
            <p className="text-xs text-[var(--muted-foreground)]">Reviews require a verified student account.</p>
          </div>
          <Link href="/auth/signin" className="btn-primary text-xs py-1.5 px-3 ml-auto">
            Sign in
          </Link>
        </div>
      )}

      {/* Reviews list */}
      {reviews.length === 0 ? (
        <p className="text-sm text-[var(--muted-foreground)] text-center py-6">
          No reviews yet. Be the first!
        </p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-[var(--border)] pb-4 last:border-0 last:pb-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <StarRating rating={review.rating} size="sm" />
                  <span className="text-xs font-medium">Anonymous Student</span>
                  {review.userSchool && (
                    <span className="text-xs text-[var(--muted-foreground)]">· {review.userSchool}</span>
                  )}
                </div>
                <span className="text-xs text-[var(--muted-foreground)]">{formatDate(review.createdAt)}</span>
              </div>
              <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">{review.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
