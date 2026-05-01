import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { requireAdmin, sanitizeUrl, safeError, safeString } from "@/lib/security";

const resourceSchema = z.object({
  title:       z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  category:    z.string().min(1).max(50),
  type:        z.string().min(1).max(50),
  fileUrl:     z.string().max(2048).optional(),
  externalUrl: z.string().max(2048).optional(),
  tags:        z.array(z.string().max(50)).max(20).optional(),
  region:      z.string().max(50).optional(),
});

function validateUrls(data: z.infer<typeof resourceSchema> | Partial<z.infer<typeof resourceSchema>>): NextResponse | null {
  if (data.fileUrl) {
    const safe = sanitizeUrl(data.fileUrl);
    if (!safe) return NextResponse.json({ error: "Invalid file URL" }, { status: 400 });
    data.fileUrl = safe;
  }
  if (data.externalUrl) {
    const safe = sanitizeUrl(data.externalUrl);
    if (!safe) return NextResponse.json({ error: "Invalid external URL" }, { status: 400 });
    data.externalUrl = safe;
  }
  return null;
}

export async function GET(_req: NextRequest) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const resources = await prisma.projectResource.findMany({
      orderBy: { createdAt: "desc" },
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
    const parsed = resourceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid resource data" }, { status: 400 });
    }
    const data = parsed.data;
    const urlError = validateUrls(data);
    if (urlError) return urlError;

    const resource = await prisma.projectResource.create({
      data: {
        title:       safeString(data.title, 200),
        description: data.description ? safeString(data.description, 2000) : undefined,
        category:    data.category,
        type:        data.type,
        fileUrl:     data.fileUrl,
        externalUrl: data.externalUrl,
        tags:        data.tags ?? [],
        region:      data.region,
      },
    });

    return NextResponse.json(resource, { status: 201 });
  } catch (err) {
    return safeError(err);
  }
}

const patchSchema = z.object({ id: z.string().min(1).max(100) }).and(resourceSchema.partial());

export async function PATCH(req: NextRequest) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const body = await req.json().catch(() => ({}));
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid update" }, { status: 400 });
    }
    const { id, ...data } = parsed.data;
    const urlError = validateUrls(data);
    if (urlError) return urlError;

    const resource = await prisma.projectResource.update({
      where: { id },
      data,
    });
    return NextResponse.json(resource);
  } catch (err) {
    return safeError(err);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id || id.length > 100) {
      return NextResponse.json({ error: "Missing or invalid id" }, { status: 400 });
    }

    await prisma.projectResource.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return safeError(err);
  }
}
