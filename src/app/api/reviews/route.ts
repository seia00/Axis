import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// GET — all reviews (admin only)
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status"); // "published" | "removed" | null (all)

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
  });

  return NextResponse.json(reviews);
}

const reviewSchema = z.object({
  orgId: z.string(),
  rating: z.number().int().min(1).max(5),
  content: z.string().min(10).max(1000),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const { orgId, rating, content } = parsed.data;

  try {
    const review = await prisma.review.upsert({
      where: { orgId_userId: { orgId, userId: session.user.id } },
      update: { rating, content },
      create: { orgId, userId: session.user.id, rating, content },
    });
    return NextResponse.json(review);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// PATCH — flag, unflag, or remove a review (admin only)
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { id, action } = body as { id: string; action: "flag" | "unflag" | "remove" };
  if (!id || !action) return NextResponse.json({ error: "Missing id or action" }, { status: 400 });

  const data: Record<string, unknown> = {};
  if (action === "flag") {
    data.removed = true;
    data.removedBy = session.user.id;
  } else if (action === "unflag") {
    data.removed = false;
    data.removedBy = null;
  } else if (action === "remove") {
    data.removed = true;
    data.removedBy = session.user.id;
  }

  const review = await prisma.review.update({ where: { id }, data });
  return NextResponse.json(review);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await prisma.review.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
