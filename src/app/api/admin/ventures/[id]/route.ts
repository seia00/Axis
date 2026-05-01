import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { requireAdmin, escapeHtml, safeError, safeString } from "@/lib/security";

const schema = z.object({
  ventureStage:   z.enum(["accepted", "rejected", "mentoring", "launched"]),
  mentorAssigned: z.string().max(200).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const body = await req.json().catch(() => ({}));
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid update" }, { status: 400 });
    }
    const { ventureStage, mentorAssigned } = parsed.data;

    const updated = await prisma.project.update({
      where: { id: params.id },
      data: {
        ventureStage,
        ...(mentorAssigned !== undefined ? { mentorAssigned: safeString(mentorAssigned, 200) } : {}),
      },
    });

    if (process.env.RESEND_API_KEY) {
      try {
        const project = await prisma.project.findUnique({
          where: { id: params.id },
          include: { creator: { select: { email: true, name: true } } },
        });
        if (project?.creator?.email) {
          const { Resend } = await import("resend");
          const resend = new Resend(process.env.RESEND_API_KEY);
          const isAccepted = ventureStage === "accepted";

          // Every interpolated value goes through escapeHtml — defends
          // against XSS in email clients that render HTML.
          const safeName = escapeHtml(project.creator.name ?? "there");
          const safeTitle = escapeHtml(project.title);
          const safeMentor = mentorAssigned ? escapeHtml(mentorAssigned) : null;

          await resend.emails.send({
            from: process.env.EMAIL_FROM ?? "noreply@axis.community",
            to: project.creator.email,
            subject: isAccepted
              ? `Congratulations! Your project "${project.title}" has been accepted to AXIS Ventures`
              : `Update on your AXIS Ventures application for "${project.title}"`,
            html: isAccepted
              ? `<p>Hi ${safeName},</p><p>Your project <strong>${safeTitle}</strong> has been accepted into AXIS Ventures! ${safeMentor ? `Your assigned mentor is <strong>${safeMentor}</strong>.` : "A mentor will be assigned to you soon."}</p><p>Log in to your <a href="https://axis.community/ventures/dashboard">Ventures Dashboard</a> to get started.</p>`
              : `<p>Hi ${safeName},</p><p>Thank you for applying to AXIS Ventures with your project <strong>${safeTitle}</strong>. Unfortunately, we are unable to move forward at this time. We encourage you to continue building and reapply in the future.</p>`,
          });
        }
      } catch {
        // Email failures shouldn't block the status change
      }
    }

    return NextResponse.json(updated);
  } catch (err) {
    return safeError(err);
  }
}
