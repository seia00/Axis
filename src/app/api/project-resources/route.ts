import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { requireSession, requireAdmin, sanitizeUrl, safeError, safeString } from "@/lib/security";

const querySchema = z.object({
  category: z.string().max(50).optional(),
  type:     z.string().max(50).optional(),
  search:   z.string().max(200).optional(),
});

const createSchema = z.object({
  title:       z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  category:    z.string().min(1).max(50),
  type:        z.string().min(1).max(50),
  fileUrl:     z.string().max(2048).optional(),
  externalUrl: z.string().max(2048).optional(),
  tags:        z.array(z.string().max(50)).max(20).optional(),
  region:      z.string().max(50).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { error } = await requireSession();
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const parsed = querySchema.safeParse(Object.fromEntries(searchParams.entries()));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid filters" }, { status: 400 });
    }
    const q = parsed.data;

    const resources = await prisma.projectResource.findMany({
      where: {
        ...(q.category ? { category: q.category } : {}),
        ...(q.type ? { type: q.type } : {}),
        ...(q.search ? {
          OR: [
            { title: { contains: q.search, mode: "insensitive" } },
            { description: { contains: q.search, mode: "insensitive" } },
          ],
        } : {}),
      },
      orderBy: { downloadCount: "desc" },
      take: 500,
    });

    return NextResponse.json(resources);
  } catch (err) {
    return safeError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const body = await req.json().catch(() => ({}));
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid resource" }, { status: 400 });
    }
    const data = parsed.data;

    let safeFileUrl: string | undefined;
    let safeExtUrl: string | undefined;
    if (data.fileUrl) {
      const s = sanitizeUrl(data.fileUrl);
      if (!s) return NextResponse.json({ error: "Invalid file URL" }, { status: 400 });
      safeFileUrl = s;
    }
    if (data.externalUrl) {
      const s = sanitizeUrl(data.externalUrl);
      if (!s) return NextResponse.json({ error: "Invalid external URL" }, { status: 400 });
      safeExtUrl = s;
    }

    const resource = await prisma.projectResource.create({
      data: {
        title:       safeString(data.title, 200),
        description: data.description ? safeString(data.description, 2000) : undefined,
        category:    data.category,
        type:        data.type,
        fileUrl:     safeFileUrl,
        externalUrl: safeExtUrl,
        tags:        data.tags ?? [],
        region:      data.region,
      },
    });
    return NextResponse.json(resource, { status: 201 });
  } catch (err) {
    return safeError(err);
  }
}
