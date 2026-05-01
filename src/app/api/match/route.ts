import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, safeError } from "@/lib/security";

async function callClaude(prompt: string): Promise<string> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message ?? "Claude API error");
  return data.content[0]?.text ?? "[]";
}

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const matches = await prisma.match.findMany({
    where: { fromUserId: session.user.id },
    orderBy: [{ score: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(matches);
}

export async function POST(req: NextRequest) {
  try {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // CRITICAL: Claude API costs real money. Cap to 5 match-generations per
  // user per hour. Without this, anyone signed in could rack up an
  // unlimited bill via auto-clicking the regenerate button.
  const limited = rateLimit(req, "match-generate", 5, 3600_000, session.user.id);
  if (limited) return limited;

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (!user.interests?.length && !user.skills?.length && !user.goals?.length) {
    return NextResponse.json({ error: "Please complete your profile with interests, skills, and goals first." }, { status: 400 });
  }

  // Delete old matches for this user
  await prisma.match.deleteMany({ where: { fromUserId: session.user.id } });

  const newMatches: { fromUserId: string; toUserId: string; type: string; reason: string; score: number }[] = [];

  // 1. Opportunity Match
  try {
    const opportunities = await prisma.opportunity.findMany({
      where: {
        OR: [
          ...(user.interests?.length ? [{ tags: { hasSome: user.interests } }] : []),
          ...(user.skills?.length ? [{ tags: { hasSome: user.skills } }] : []),
        ],
      },
      take: 20,
    });

    if (opportunities.length > 0) {
      const prompt = `Given this student profile:
- Interests: ${user.interests?.join(", ") || "none"}
- Skills: ${user.skills?.join(", ") || "none"}
- Goals: ${user.goals?.join(", ") || "none"}

Rank these opportunities by relevance. For each, explain in 1-2 sentences WHY it's a good fit.
Return ONLY a valid JSON array (no markdown, no code blocks): [{ "opportunityId": "...", "score": 0.0-1.0, "reason": "..." }]

Opportunities: ${JSON.stringify(opportunities.map(o => ({ id: o.id, title: o.title, type: o.type, tags: o.tags, description: o.description.substring(0, 200) })))}`;

      const raw = await callClaude(prompt);
      const parsed = JSON.parse(raw.trim().replace(/^```json\s*/i, "").replace(/```$/i, ""));
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          if (item.opportunityId && item.score != null && item.reason) {
            newMatches.push({
              fromUserId: session.user.id,
              toUserId: item.opportunityId,
              type: "opportunity",
              reason: item.reason,
              score: Math.min(1, Math.max(0, parseFloat(item.score))),
            });
          }
        }
      }
    }
  } catch (e) {
    console.error("Opportunity match error:", e);
  }

  // 2. Co-founder Match
  try {
    const otherUsers = await prisma.user.findMany({
      where: {
        id: { not: session.user.id },
        skills: { isEmpty: false },
      },
      take: 10,
      select: { id: true, name: true, skills: true, interests: true, goals: true, experienceLevel: true },
    });

    for (const otherUser of otherUsers.slice(0, 5)) {
      const prompt = `Student A:
- Name: ${user.name ?? "Student A"}
- Skills: ${user.skills?.join(", ") || "none"}
- Interests: ${user.interests?.join(", ") || "none"}
- Goals: ${user.goals?.join(", ") || "none"}

Student B:
- Name: ${otherUser.name ?? "Student B"}
- Skills: ${otherUser.skills?.join(", ") || "none"}
- Interests: ${otherUser.interests?.join(", ") || "none"}
- Goals: ${otherUser.goals?.join(", ") || "none"}

Rate co-founder compatibility (0-1). Explain why they'd work well together.
Return ONLY valid JSON (no markdown): { "score": 0.0-1.0, "reason": "...", "suggestedCollaboration": "..." }`;

      try {
        const raw = await callClaude(prompt);
        const parsed = JSON.parse(raw.trim().replace(/^```json\s*/i, "").replace(/```$/i, ""));
        if (parsed.score != null && parsed.reason) {
          newMatches.push({
            fromUserId: session.user.id,
            toUserId: otherUser.id,
            type: "cofounder",
            reason: `${parsed.reason} Suggested: ${parsed.suggestedCollaboration ?? ""}`,
            score: Math.min(1, Math.max(0, parseFloat(parsed.score))),
          });
        }
      } catch { /* skip individual failures */ }
    }
  } catch (e) {
    console.error("Co-founder match error:", e);
  }

  // 3. Program Match
  try {
    const programs = await prisma.opportunity.findMany({
      where: { type: { in: ["program", "fellowship"] } },
      take: 15,
    });

    if (programs.length > 0) {
      const prompt = `Given this student:
- Goals: ${user.goals?.join(", ") || "none"}
- Experience Level: ${user.experienceLevel ?? "beginner"}
- Skills: ${user.skills?.join(", ") || "none"}

Which of these programs are the best fit and why?
Return ONLY valid JSON array (no markdown): [{ "opportunityId": "...", "score": 0.0-1.0, "reason": "..." }]

Programs: ${JSON.stringify(programs.map(p => ({ id: p.id, title: p.title, description: p.description.substring(0, 200), tags: p.tags })))}`;

      const raw = await callClaude(prompt);
      const parsed = JSON.parse(raw.trim().replace(/^```json\s*/i, "").replace(/```$/i, ""));
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          if (item.opportunityId && item.score != null && item.reason) {
            newMatches.push({
              fromUserId: session.user.id,
              toUserId: item.opportunityId,
              type: "program",
              reason: item.reason,
              score: Math.min(1, Math.max(0, parseFloat(item.score))),
            });
          }
        }
      }
    }
  } catch (e) {
    console.error("Program match error:", e);
  }

  // Store all matches
  if (newMatches.length > 0) {
    await prisma.match.createMany({ data: newMatches });
  }

  const matches = await prisma.match.findMany({
    where: { fromUserId: session.user.id },
    orderBy: [{ score: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(matches);
  } catch (err) {
    return safeError(err);
  }
}
