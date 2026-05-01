import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, safeError } from "@/lib/security";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    await prisma.calendarEvent.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return safeError(err);
  }
}
