import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { requireSession, sanitizeUrl, rateLimit, safeError, safeString } from "@/lib/security";

// Strict zod schema — every field length-capped, URL validated separately.
const schema = z.object({
  title:        z.string().min(3).max(200),
  organization: z.string().min(2).max(200),
  type:         z.enum(["competition", "fellowship", "scholarship", "program", "internship", "other"]),
  description:  z.string().min(20).max(5000),
  url:          z.string().max(2048).optional(),
  deadline:     z.string().datetime().optional(),
});

// Community opportunity submissions — stored as isVerified=false so they
// don't appear publicly until an admin reviews them.
export async function POST(req: NextRequest) {
  try {
    const { session, error } = await requireSession();
    if (error) return error;

    // Rate limit — prevent submission spam (per user, since auth required)
    const limited = rateLimit(req, "opp-submit", 10, 3600_000, session.user.id); // 10 per hour
    if (limited) return limited;

    const body = await req.json().catch(() => ({}));
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid submission" }, { status: 400 });
    }

    const data = parsed.data;
    // URL validation — reject javascript:, data:, malformed
    const safeUrlValue = data.url ? sanitizeUrl(data.url) : null;
    if (data.url && !safeUrlValue) {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    const opportunity = await prisma.opportunity.create({
      data: {
        title:        safeString(data.title, 200),
        organization: safeString(data.organization, 200),
        type:         data.type,
        description:  safeString(data.description, 5000),
        url:          safeUrlValue,
        deadline:     data.deadline ? new Date(data.deadline) : null,
        tags:         [],
        regions:      [],
        isVerified:   false,
      },
    });

    return NextResponse.json(opportunity, { status: 201 });
  } catch (err) {
    return safeError(err);
  }
}
