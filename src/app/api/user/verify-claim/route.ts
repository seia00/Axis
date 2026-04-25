import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { differenceInDays } from "date-fns";

export async function POST(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      bio: true,
      headline: true,
      interests: true,
      skills: true,
      goals: true,
      isVerified: true,
      createdAt: true,
    },
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (user.isVerified) {
    return NextResponse.json({ error: "Already verified" }, { status: 400 });
  }

  // Check eligibility criteria
  if (!user.name) {
    return NextResponse.json({ error: "Please add your name to your profile" }, { status: 400 });
  }
  if (!user.bio) {
    return NextResponse.json({ error: "Please add a bio to your profile" }, { status: 400 });
  }
  if (!user.headline) {
    return NextResponse.json({ error: "Please add a headline to your profile" }, { status: 400 });
  }
  if (!user.interests || user.interests.length === 0) {
    return NextResponse.json({ error: "Please add your interests to your profile" }, { status: 400 });
  }
  if (!user.skills || user.skills.length === 0) {
    return NextResponse.json({ error: "Please add your skills to your profile" }, { status: 400 });
  }
  if (!user.goals || user.goals.length === 0) {
    return NextResponse.json({ error: "Please add your goals to your profile" }, { status: 400 });
  }

  const activityCount = await prisma.activity.count({ where: { userId: session.user.id } });
  if (activityCount < 3) {
    return NextResponse.json({ error: `You need at least 3 activities (you have ${activityCount})` }, { status: 400 });
  }

  const accountAgeDays = differenceInDays(new Date(), user.createdAt);
  if (accountAgeDays < 30) {
    return NextResponse.json({ error: `Your account must be at least 30 days old (${accountAgeDays} days old)` }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: { isVerified: true, verifiedAt: new Date() },
  });

  return NextResponse.json({ success: true, isVerified: updated.isVerified });
}
