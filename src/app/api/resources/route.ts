import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ResourceCategory } from "@prisma/client";
import { z } from "zod";
import { requireSession, requireAdmin, sanitizeUrl, safeError, safeString } from "@/lib/security";

const createSchema = z.object({
  title:       z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  category:    z.nativeEnum(ResourceCategory),
  fileType:    z.string().max(50).optional(),
  fileUrl:     z.string().max(2048),
});

export async function GET(req: NextRequest) {
  try {
    const { error } = await requireSession();
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") as ResourceCategory | null;

    const resources = await prisma.resource.findMany({
      where: category ? { category } : undefined,
      orderBy: { uploadedAt: "desc" },
      take: 500,
    });

    return NextResponse.json(resources);
  } catch (err) {
    return safeError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { session, error } = await requireAdmin();
    if (error) return error;

    const body = await req.json().catch(() => ({}));
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid resource" }, { status: 400 });
    }
    const data = parsed.data;

    const safeFileUrl = sanitizeUrl(data.fileUrl);
    if (!safeFileUrl) return NextResponse.json({ error: "Invalid file URL" }, { status: 400 });

    const resource = await prisma.resource.create({
      data: {
        title:       safeString(data.title, 200),
        description: data.description ? safeString(data.description, 2000) : null,
        category:    data.category,
        fileType:    data.fileType,
        fileUrl:     safeFileUrl,
        uploadedBy:  session.user.id,
      },
    });

    return NextResponse.json(resource);
  } catch (err) {
    return safeError(err);
  }
}
