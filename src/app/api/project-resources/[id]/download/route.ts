import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, safeError } from "@/lib/security";

// This endpoint just bumps a download counter — the file itself is fetched
// directly from Supabase by the client. Keep counter increment honest by
// requiring auth and rate-limiting at the user level.
export async function PATCH(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { error } = await requireSession();
    if (error) return error;

    const resource = await prisma.projectResource.update({
      where: { id: params.id },
      data: { downloadCount: { increment: 1 } },
    }).catch(() => null);

    if (!resource) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(resource);
  } catch (err) {
    return safeError(err);
  }
}
