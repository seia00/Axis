import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const region = searchParams.get("region");
    const tags = searchParams.get("tags")?.split(",").filter(Boolean) ?? [];
    const verifiedOnly = searchParams.get("verifiedOnly") === "true";
    const deadlineFrom = searchParams.get("deadlineFrom");
    const deadlineTo = searchParams.get("deadlineTo");
    const search = searchParams.get("search");
    const ids = searchParams.get("ids")?.split(",").filter(Boolean) ?? [];

    const opportunities = await prisma.opportunity.findMany({
      where: {
        ...(ids.length > 0 ? { id: { in: ids } } : {}),
        ...(type ? { type } : {}),
        ...(region ? { regions: { has: region } } : {}),
        ...(tags.length > 0 ? { tags: { hasSome: tags } } : {}),
        ...(verifiedOnly ? { isVerified: true } : {}),
        ...(deadlineFrom || deadlineTo ? {
          deadline: {
            ...(deadlineFrom ? { gte: new Date(deadlineFrom) } : {}),
            ...(deadlineTo ? { lte: new Date(deadlineTo) } : {}),
          },
        } : {}),
        ...(search ? {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { organization: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        } : {}),
      },
      orderBy: [{ isVerified: "desc" }, { deadline: "asc" }],
    });

    return NextResponse.json(opportunities);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { title, type, organization, description, eligibility, location, isRemote, url, deadline, startDate, endDate, tags, regions } = body;

    if (!title || !type || !organization || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const opportunity = await prisma.opportunity.create({
      data: {
        title,
        type,
        organization,
        description,
        eligibility,
        location,
        isRemote: isRemote ?? false,
        url,
        deadline: deadline ? new Date(deadline) : null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        tags: tags ?? [],
        regions: regions ?? [],
      },
    });

    return NextResponse.json(opportunity, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
