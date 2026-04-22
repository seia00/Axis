import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ResourceCategory } from "@prisma/client";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") as ResourceCategory | null;

  const resources = await prisma.resource.findMany({
    where: category ? { category } : undefined,
    orderBy: { uploadedAt: "desc" },
  });

  return NextResponse.json(resources);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const resource = await prisma.resource.create({
    data: { ...body, uploadedBy: session.user.id },
  });

  return NextResponse.json(resource);
}
