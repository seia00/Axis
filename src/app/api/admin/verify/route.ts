import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { OrgTier } from "@prisma/client";
import { requireAdmin, escapeHtml, safeError } from "@/lib/security";

const schema = z.object({
  applicationId: z.string().min(1).max(100),
  action:        z.enum(["approve", "reject"]),
});

export async function POST(req: NextRequest) {
  try {
    const { session, error } = await requireAdmin();
    if (error) return error;

    const body = await req.json().catch(() => ({}));
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    const { applicationId, action } = parsed.data;

    const application = await prisma.verificationApplication.findUnique({
      where: { id: applicationId },
      include: { org: true },
    });
    if (!application) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.verificationApplication.update({
      where: { id: applicationId },
      data: {
        status: action === "approve" ? "approved" : "rejected",
        reviewedAt: new Date(),
        reviewedBy: session.user.id,
      },
    });

    if (action === "approve") {
      await prisma.organization.update({
        where: { id: application.orgId },
        data: {
          tier: application.targetTier as OrgTier,
          verified: application.targetTier === "VERIFIED" || application.targetTier === "PARTNER",
        },
      });
    }

    if (process.env.RESEND_API_KEY) {
      try {
        const orgLeader = await prisma.user.findUnique({ where: { id: application.org.leaderId } });
        if (orgLeader?.email) {
          const { Resend } = await import("resend");
          const resend = new Resend(process.env.RESEND_API_KEY);
          // Escape org name and tier — they're user/admin-controlled.
          const safeOrgName = escapeHtml(application.org.name);
          const safeTier = escapeHtml(application.targetTier);

          await resend.emails.send({
            from: process.env.EMAIL_FROM ?? "noreply@axis.community",
            to: orgLeader.email,
            subject: action === "approve"
              ? `Congratulations! ${application.org.name} is now ${application.targetTier} on AXIS`
              : `Update on your AXIS verification application`,
            html: action === "approve"
              ? `<p>Your organization <strong>${safeOrgName}</strong> has been awarded <strong>AXIS ${safeTier}</strong> status. Congratulations!</p>`
              : `<p>Your verification application for <strong>${safeOrgName}</strong> was not approved at this time. You can reapply after addressing the feedback.</p>`,
          });
        }
      } catch {
        // Email failures don't roll back the status change
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return safeError(err);
  }
}
