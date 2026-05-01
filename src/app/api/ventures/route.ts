import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { requireSession, rateLimit, safeError, safeString } from "@/lib/security";

const schema = z.object({
  name:      z.string().min(2).max(100),
  focusArea: z.string().min(1).max(100),
  applicationData: z.object({
    foundingTeam:     z.string().min(10).max(2000),
    targetStudents:   z.string().min(10).max(2000),
    problemStatement: z.string().min(20).max(5000),
    proposedSolution: z.string().min(20).max(5000),
    currentTraction:  z.string().max(5000),
    supportNeeded:    z.string().min(10).max(5000),
  }),
});

export async function POST(req: NextRequest) {
  try {
    const { session, error } = await requireSession();
    if (error) return error;

    // Cap submissions — prevents application spam
    const limited = rateLimit(req, "venture-create", 3, 3600_000, session.user.id);
    if (limited) return limited;

    const body = await req.json().catch(() => ({}));
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid application" }, { status: 400 });
    }

    // Sanitize text fields in the JSONB application data
    const app = parsed.data.applicationData;
    const sanitizedAppData = {
      foundingTeam:     safeString(app.foundingTeam, 2000),
      targetStudents:   safeString(app.targetStudents, 2000),
      problemStatement: safeString(app.problemStatement, 5000),
      proposedSolution: safeString(app.proposedSolution, 5000),
      currentTraction:  safeString(app.currentTraction, 5000),
      supportNeeded:    safeString(app.supportNeeded, 5000),
    };

    const venture = await prisma.venture.create({
      data: {
        name:            safeString(parsed.data.name, 100),
        focusArea:       parsed.data.focusArea,
        leaderId:        session.user.id,
        applicationData: sanitizedAppData,
      },
    });

    return NextResponse.json(venture);
  } catch (err) {
    return safeError(err);
  }
}

export async function GET(_req: NextRequest) {
  try {
    const { session, error } = await requireSession();
    if (error) return error;

    const ventures = await prisma.venture.findMany({
      where: { leaderId: session.user.id },
      include: { milestones: true, _count: { select: { forumPosts: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(ventures);
  } catch (err) {
    return safeError(err);
  }
}
