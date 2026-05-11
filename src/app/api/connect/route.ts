import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, rateLimit, safeError } from "@/lib/security";

function displayName(name: string | null): string {
  if (!name) return "Anonymous";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1].charAt(0).toUpperCase()}.`;
}

/** GET — incoming PENDING connect requests for the current user */
export async function GET(_req: NextRequest) {
  try {
    const { session, error } = await requireSession();
    if (error) return error;

    const reqs = await prisma.connectRequest.findMany({
      where: { toUserId: session.user.id, status: "PENDING" },
      orderBy: { createdAt: "desc" },
      include: {
        fromUser: {
          select: { id: true, name: true, skills: true, interests: true },
        },
      },
    });

    const shaped = reqs.map((r) => ({
      id:          r.id,
      fromUserId:  r.fromUserId,
      displayName: displayName(r.fromUser.name),
      skills:      r.fromUser.skills,
      interests:   r.fromUser.interests,
      createdAt:   r.createdAt,
    }));

    return NextResponse.json(shaped);
  } catch (err) {
    return safeError(err);
  }
}

/** POST — send a connect request */
export async function POST(req: NextRequest) {
  try {
    const { session, error } = await requireSession();
    if (error) return error;

    const limited = rateLimit(req, "connect-send", 20, 3600_000, session.user.id);
    if (limited) return limited;

    const body = await req.json().catch(() => ({}));
    const toUserId = body?.toUserId as string | undefined;
    if (!toUserId || typeof toUserId !== "string") {
      return NextResponse.json({ error: "toUserId is required" }, { status: 400 });
    }
    if (toUserId === session.user.id) {
      return NextResponse.json({ error: "Cannot connect with yourself" }, { status: 400 });
    }

    // Check target user exists
    const target = await prisma.user.findUnique({ where: { id: toUserId }, select: { id: true } });
    if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Upsert — if rejected before, reset to pending
    const existing = await prisma.connectRequest.findUnique({
      where: { fromUserId_toUserId: { fromUserId: session.user.id, toUserId } },
    });

    if (existing) {
      if (existing.status === "PENDING" || existing.status === "ACCEPTED") {
        return NextResponse.json({ error: "Request already exists" }, { status: 409 });
      }
      // Was rejected — allow re-send
      const updated = await prisma.connectRequest.update({
        where: { id: existing.id },
        data: { status: "PENDING" },
      });
      return NextResponse.json(updated, { status: 200 });
    }

    const connectReq = await prisma.connectRequest.create({
      data: { fromUserId: session.user.id, toUserId, status: "PENDING" },
    });
    return NextResponse.json(connectReq, { status: 201 });
  } catch (err) {
    return safeError(err);
  }
}

/** PATCH — accept or reject an incoming request */
export async function PATCH(req: NextRequest) {
  try {
    const { session, error } = await requireSession();
    if (error) return error;

    const body = await req.json().catch(() => ({}));
    const { requestId, action } = body as { requestId?: string; action?: string };

    if (!requestId || !["accept", "reject"].includes(action ?? "")) {
      return NextResponse.json({ error: "requestId and action (accept|reject) required" }, { status: 400 });
    }

    const req2 = await prisma.connectRequest.findUnique({ where: { id: requestId } });
    if (!req2) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (req2.toUserId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.connectRequest.update({
      where: { id: requestId },
      data: { status: action === "accept" ? "ACCEPTED" : "REJECTED" },
    });
    return NextResponse.json(updated);
  } catch (err) {
    return safeError(err);
  }
}
