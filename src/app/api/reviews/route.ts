import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { requireSession, requireAdmin, rateLimit, safeError, safeString } from "@/lib/security";

// GET — all reviews (admin only)
export async function GET(req: NextRequest) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {};
    if (status === "published") where.removed = false;
    if (status === "removed") where.removed = true;

    const reviews = await prisma.review.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
        org:  { select: { id: true, name: true, slug: true } },
      },
      take: 500,
    });

    return NextResponse.json(reviews);
  } catch (err) {
    return safeError(err);
  }
}

const reviewSchema = z.object({
  orgId:   z.string().min(1).max(100),
  rating:  z.number().int().min(1).max(5),
  content: z.string().min(10).max(1000),
});

export async function POST(req: NextRequest) {
  try {
    const { session, error } = await requireSession();
    if (error) return error;

    // Rate limit reviews — prevent review-bombing
    const limited = rateLimit(req, "review", 10, 3600_000, session.user.id); // 10/hr
    if (limited) return limited;

    const body = await req.json().catch(() => ({}));
    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid review" }, { status: 400 });
    }
    const { orgId, rating, content } = parsed.data;

    // Verify the org exists — prevents reviewing nonexistent orgs that
    // could pollute the DB with orphan rows.
    const org = await prisma.organization.findUnique({ where: { id: orgId }, select: { id: true } });
    if (!org) return NextResponse.json({ error: "Organization not found" }, { status: 404 });

    const review = await prisma.review.upsert({
      where: { orgId_userId: { orgId, userId: session.user.id } },
      update: { rating, content: safeString(content, 1000) },
      create: { orgId, userId: session.user.id, rating, content: safeString(content, 1000) },
    });
    return NextResponse.json(review);
  } catch (err) {
    return safeError(err);
  }
}

// PATCH — flag, unflag, or remove a review (admin only)
const patchSchema = z.object({
  id:     z.string().min(1).max(100),
  action: z.enum(["flag", "unflag", "remove"]),
});

export async function PATCH(req: NextRequest) {
  try {
    const { session, error } = await requireAdmin();
    if (error) return error;

    const body = await req.json().catch(() => ({}));
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    const { id, action } = parsed.data;

    const data: Record<string, unknown> = {};
    if (action === "flag" || action === "remove") {
      data.removed = true;
      data.removedBy = session.user.id;
    } else if (action === "unflag") {
      data.removed = false;
      data.removedBy = null;
    }

    const review = await prisma.review.update({ where: { id }, data });
    return NextResponse.json(review);
  } catch (err) {
    return safeError(err);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id || id.length > 100) {
      return NextResponse.json({ error: "Missing or invalid id" }, { status: 400 });
    }

    await prisma.review.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return safeError(err);
  }
}
