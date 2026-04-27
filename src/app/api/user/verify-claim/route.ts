import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      bio: true,
      headline: true,
      isVerified: true,
      createdAt: true,
    },
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (user.isVerified) {
    return NextResponse.json({ error: "Already verified" }, { status: 400 });
  }

  // Collect unmet criteria
  const missing: string[] = [];

  if (!user.name) missing.push("Add your full name to your account");
  if (!user.bio) missing.push("Add a bio in Settings → Public Profile");
  if (!user.headline) missing.push("Add a headline in Settings → Public Profile");

  const activityCount = await prisma.activity.count({ where: { userId: session.user.id } });
  if (activityCount < 3) {
    missing.push(`Add at least 3 activities in your portfolio (you have ${activityCount})`);
  }

  const accountAgeDays = Math.floor(
    (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (accountAgeDays < 30) {
    missing.push(`Your account must be at least 30 days old (${accountAgeDays} days so far)`);
  }

  if (missing.length > 0) {
    return NextResponse.json(
      { error: "You don't meet the verification criteria yet.", missing },
      { status: 400 }
    );
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: { isVerified: true, verifiedAt: new Date() },
  });

  return NextResponse.json({ success: true, isVerified: updated.isVerified });
}
