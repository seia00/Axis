import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { requireSession, sanitizeUrl, safeError, safeString } from "@/lib/security";

// Tight zod schema — every field length-capped, URLs validated separately.
const profileSchema = z.object({
  bio:              z.string().max(500).optional(),
  headline:         z.string().max(120).optional(),
  location:         z.string().max(100).optional(),
  school:           z.string().max(150).optional(),
  username:         z.string().max(40).optional(),
  twitterHandle:    z.string().max(50).optional(),
  instagramHandle:  z.string().max(50).optional(),
  linkedinUrl:      z.string().max(500).optional(),
  websiteUrl:       z.string().max(500).optional(),
});

export async function GET() {
  try {
    const { session, error } = await requireSession();
    if (error) return error;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true, bio: true, headline: true, location: true, school: true, username: true,
        twitterHandle: true, instagramHandle: true, linkedinUrl: true, websiteUrl: true,
      },
    });

    return NextResponse.json(user);
  } catch (err) {
    return safeError(err);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { session, error } = await requireSession();
    if (error) return error;

    const body = await req.json().catch(() => ({}));
    const parsed = profileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid profile data" }, { status: 400 });
    }
    const input = parsed.data;
    const data: Record<string, string | null> = {};

    // Plain text fields — trim and length-cap
    if (input.bio !== undefined)             data.bio = safeString(input.bio, 500) || null;
    if (input.headline !== undefined)        data.headline = safeString(input.headline, 120) || null;
    if (input.location !== undefined)        data.location = safeString(input.location, 100) || null;
    if (input.school !== undefined)          data.school = safeString(input.school, 150) || null;
    if (input.twitterHandle !== undefined)   data.twitterHandle = safeString(input.twitterHandle, 50).replace(/^@/, "") || null;
    if (input.instagramHandle !== undefined) data.instagramHandle = safeString(input.instagramHandle, 50).replace(/^@/, "") || null;

    // URL fields — must pass sanitizeUrl (rejects javascript:, data:, etc.)
    if (input.linkedinUrl !== undefined) {
      if (input.linkedinUrl.trim() === "") {
        data.linkedinUrl = null;
      } else {
        const safe = sanitizeUrl(input.linkedinUrl);
        if (!safe) return NextResponse.json({ error: "Invalid LinkedIn URL" }, { status: 400 });
        data.linkedinUrl = safe;
      }
    }
    if (input.websiteUrl !== undefined) {
      if (input.websiteUrl.trim() === "") {
        data.websiteUrl = null;
      } else {
        const safe = sanitizeUrl(input.websiteUrl);
        if (!safe) return NextResponse.json({ error: "Invalid website URL" }, { status: 400 });
        data.websiteUrl = safe;
      }
    }

    // Username has its own constraints — letters/numbers/underscore/dash, lowercase, unique
    if (input.username !== undefined) {
      const proposed = input.username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 40);
      if (proposed) {
        if (proposed.length < 3) {
          return NextResponse.json({ error: "Username must be at least 3 characters" }, { status: 400 });
        }
        const conflict = await prisma.user.findFirst({
          where: { username: proposed, NOT: { id: session.user.id } },
          select: { id: true },
        });
        if (conflict) {
          return NextResponse.json({ error: "Username already taken" }, { status: 409 });
        }
        data.username = proposed;
      }
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data,
      select: {
        bio: true, headline: true, location: true, school: true, username: true,
        twitterHandle: true, instagramHandle: true, linkedinUrl: true, websiteUrl: true,
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    return safeError(err);
  }
}
