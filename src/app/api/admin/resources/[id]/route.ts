import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { requireAdmin, sanitizeUrl, safeError, safeString } from "@/lib/security";

const patchSchema = z.object({
  title:       z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  category:    z.string().min(1).max(50).optional(),
  type:        z.string().min(1).max(50).optional(),
  fileUrl:     z.string().max(2048).optional(),
  externalUrl: z.string().max(2048).optional(),
  tags:        z.array(z.string().max(50)).max(20).optional(),
  region:      z.string().max(50).optional(),
});

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    await prisma.projectResource.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return safeError(err);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const body = await req.json().catch(() => ({}));
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid update" }, { status: 400 });
    }
    const data = parsed.data;

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
    if (data.title)       data.title = safeString(data.title, 200);
    if (data.description) data.description = safeString(data.description, 2000);

    const updated = await prisma.projectResource.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json(updated);
  } catch (err) {
    return safeError(err);
  }
}
