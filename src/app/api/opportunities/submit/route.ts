import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Community opportunity submissions — stored pending admin review (isVerified=false)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, organization, type, description, url, deadline } = body;

  if (!title || !organization || !type || !description) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const opportunity = await prisma.opportunity.create({
    data: {
      title,
      organization,
      type,
      description,
      url,
      deadline: deadline ? new Date(deadline) : null,
      tags: [],
      regions: [],
      isVerified: false,
    },
  });

  return NextResponse.json(opportunity, { status: 201 });
}
