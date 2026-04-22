import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.redirect(new URL("/auth/signin", req.url));

  const resource = await prisma.resource.findUnique({ where: { id: params.id } });
  if (!resource) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.resource.update({
    where: { id: params.id },
    data: { downloadCount: { increment: 1 } },
  });

  await prisma.impactStat.upsert({
    where: { key: "total_downloads" },
    update: { value: { increment: 1 } },
    create: { key: "total_downloads", value: 1 },
  });

  return NextResponse.redirect(resource.fileUrl);
}
