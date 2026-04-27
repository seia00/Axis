import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const guard = async () => {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return null;
  return session;
};

const resourceSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  category: z.string().min(1),
  type: z.string().min(1),
  fileUrl: z.string().optional(),
  externalUrl: z.string().optional(),
  tags: z.array(z.string()).optional(),
  region: z.string().optional(),
});

export async function GET(_req: NextRequest) {
  const session = await guard();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const resources = await prisma.projectResource.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(resources);
}

export async function POST(req: NextRequest) {
  const session = await guard();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = resourceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const resource = await prisma.projectResource.create({
    data: {
      ...parsed.data,
      tags: parsed.data.tags ?? [],
    },
  });

  return NextResponse.json(resource, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await guard();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { id, ...rest } = body;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const parsed = resourceSchema.partial().safeParse(rest);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const resource = await prisma.projectResource.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json(resource);
}

export async function DELETE(req: NextRequest) {
  const session = await guard();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await prisma.projectResource.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
