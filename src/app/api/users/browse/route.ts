import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { safeError } from "@/lib/security";

/** Compute a privacy-safe display name: "Seia F." */
function displayName(name: string | null): string {
  if (!name) return "Anonymous";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1].charAt(0).toUpperCase()}.`;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    const { searchParams } = new URL(req.url);
    const page     = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const skillsQ  = searchParams.get("skills")?.split(",").map(s => s.trim()).filter(Boolean) ?? [];
    const interestQ = searchParams.get("interests")?.split(",").map(s => s.trim()).filter(Boolean) ?? [];
    const PAGE_SIZE = 30;

    const where: Record<string, unknown> = {
      banned: false,
      ...(session ? { id: { not: session.user.id } } : {}),
      ...(skillsQ.length   ? { skills:    { hasSome: skillsQ } }   : {}),
      ...(interestQ.length ? { interests: { hasSome: interestQ } } : {}),
    };

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id:             true,
        name:           true,
        skills:         true,
        interests:      true,
        goals:          true,
        experienceLevel: true,
        twitterHandle:  true,
        instagramHandle: true,
        linkedinUrl:    true,
        websiteUrl:     true,
      },
    });

    // Fetch connect-request statuses for the current user in one query
    const requestMap = new Map<string, "pending_sent" | "pending_received" | "accepted">();
    if (session) {
      const myId = session.user.id;
      const peerIds = users.map(u => u.id);
      const reqs = await prisma.connectRequest.findMany({
        where: {
          OR: [
            { fromUserId: myId, toUserId: { in: peerIds } },
            { toUserId: myId, fromUserId: { in: peerIds } },
          ],
          status: { not: "REJECTED" },
        },
        select: { id: true, fromUserId: true, toUserId: true, status: true },
      });
      for (const r of reqs) {
        const peerId = r.fromUserId === myId ? r.toUserId : r.fromUserId;
        if (r.status === "ACCEPTED") {
          requestMap.set(peerId, "accepted");
        } else if (r.fromUserId === myId) {
          requestMap.set(peerId, "pending_sent");
        } else {
          requestMap.set(peerId, "pending_received");
        }
      }
    }

    const shaped = users.map((u) => {
      const status = requestMap.get(u.id) ?? null;
      const isConnected = status === "accepted";
      return {
        id:             u.id,
        displayName:    displayName(u.name),
        skills:         u.skills,
        interests:      u.interests,
        goals:          u.goals,
        experienceLevel: u.experienceLevel,
        requestStatus:  status,
        // Social links are only revealed once connected
        ...(isConnected ? {
          twitterHandle:   u.twitterHandle,
          instagramHandle: u.instagramHandle,
          linkedinUrl:     u.linkedinUrl,
          websiteUrl:      u.websiteUrl,
        } : {}),
      };
    });

    return NextResponse.json({ users: shaped, page, pageSize: PAGE_SIZE });
  } catch (err) {
    return safeError(err);
  }
}
