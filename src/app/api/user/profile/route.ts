import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { requireSession, sanitizeUrl, safeError, safeString } from "@/lib/security";

const extracurricularSchema = z.object({
  name:        z.string().max(100),
  elaboration: z.string().max(500).optional(),
});

const profileSchema = z.object({
  name:             z.string().max(80).optional(),
  bio:              z.string().max(500).optional(),
  headline:         z.string().max(120).optional(),
  location:         z.string().max(100).optional(),
  school:           z.string().max(150).optional(),
  username:         z.string().max(40).optional(),
  age:              z.coerce.number().int().min(5).max(120).optional().nullable(),
  country:          z.string().max(100).optional(),
  prefecture:       z.string().max(100).optional(),
  extracurriculars: z.array(extracurricularSchema).max(20).optional(),
  interests:        z.array(z.string().max(100)).max(30).optional(),
  skills:           z.array(z.string().max(100)).max(30).optional(),
  goals:            z.array(z.string().max(100)).max(30).optional(),
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
        age: true, country: true, prefecture: true, extracurriculars: true,
        interests: true, skills: true, goals: true,
        twitterHandle: true, instagramHandle: true, linkedinUrl: true, websiteUrl: true,
        subscriptionStatus: true, priceId: true, currentPeriodEnd: true,
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
      return NextResponse.json({ error: "Invalid profile data", details: parsed.error.flatten() }, { status: 400 });
    }
    const input = parsed.data;
    const data: Record<string, unknown> = {};

    // Name
    if (input.name !== undefined)
      data.name = safeString(input.name, 80) || null;

    // Plain text fields
    if (input.bio !== undefined)             data.bio = safeString(input.bio, 500) || null;
    if (input.headline !== undefined)        data.headline = safeString(input.headline, 120) || null;
    if (input.location !== undefined)        data.location = safeString(input.location, 100) || null;
    if (input.school !== undefined)          data.school = safeString(input.school, 150) || null;
    if (input.country !== undefined)         data.country = safeString(input.country, 100) || null;
    if (input.prefecture !== undefined)      data.prefecture = safeString(input.prefecture, 100) || null;
    if (input.twitterHandle !== undefined)   data.twitterHandle = safeString(input.twitterHandle, 50).replace(/^@/, "") || null;
    if (input.instagramHandle !== undefined) data.instagramHandle = safeString(input.instagramHandle, 50).replace(/^@/, "") || null;

    // Numeric
    if (input.age !== undefined) data.age = input.age ?? null;

    // Extracurriculars — stored as JSON array
    if (input.extracurriculars !== undefined)
      data.extracurriculars = input.extracurriculars ?? null;

    // String arrays — stored as Prisma String[]
    if (input.interests !== undefined) data.interests = input.interests;
    if (input.skills    !== undefined) data.skills    = input.skills;
    if (input.goals     !== undefined) data.goals     = input.goals;

    // URL fields — empty string → null, non-empty must pass sanitizeUrl
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

    // Username — alphanumeric + underscore/dash, lowercase, min 3, unique
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
        name: true, bio: true, headline: true, location: true, school: true, username: true,
        age: true, country: true, prefecture: true, extracurriculars: true,
        interests: true, skills: true, goals: true,
        twitterHandle: true, instagramHandle: true, linkedinUrl: true, websiteUrl: true,
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    return safeError(err);
  }
}
