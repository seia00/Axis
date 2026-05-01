import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { requireAdmin, safeError } from "@/lib/security";

const schema = z.object({ reject: z.boolean().optional() });

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const body = await req.json().catch(() => ({}));
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    if (parsed.data.reject === true) {
      // Hard delete — admin only, fine
      await prisma.opportunity.delete({ where: { id: params.id } });
      return NextResponse.json({ deleted: true });
    }

    const updated = await prisma.opportunity.update({
      where: { id: params.id },
      data: { isVerified: true, verifiedAt: new Date() },
    });

    return NextResponse.json(updated);
  } catch (err) {
    return safeError(err);
  }
}
