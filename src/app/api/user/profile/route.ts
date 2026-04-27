import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      bio: true,
      headline: true,
      location: true,
      school: true,
      username: true,
      twitterHandle: true,
      instagramHandle: true,
      linkedinUrl: true,
      websiteUrl: true,
    },
  });

  return NextResponse.json(user);
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  // Sanitize — only allow safe profile fields
  const allowedFields = [
    "bio", "headline", "location", "school",
    "twitterHandle", "instagramHandle", "linkedinUrl", "websiteUrl",
  ];

  const data: Record<string, string | null> = {};
  for (const key of allowedFields) {
    if (key in body) {
      const val = typeof body[key] === "string" ? body[key].trim() || null : null;
      data[key] = val;
    }
  }

  // Username needs uniqueness check
  if ("username" in body && typeof body.username === "string") {
    const proposed = body.username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
    if (proposed) {
      const conflict = await prisma.user.findFirst({
        where: { username: proposed, NOT: { id: session.user.id } },
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
}
