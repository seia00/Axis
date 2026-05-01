import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { requireSession, escapeHtml, safeError } from "@/lib/security";

const schema = z.object({
  status: z.enum(["accepted", "rejected"]),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { session, error } = await requireSession();
    if (error) return error;

    const application = await prisma.application.findUnique({ where: { id: params.id } });
    if (!application) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Caller must be the project creator (owner of the project receiving apps)
    const project = await prisma.project.findUnique({ where: { id: application.projectId } });
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
    if (project.creatorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    const { status } = parsed.data;

    const updated = await prisma.application.update({
      where: { id: params.id },
      data: { status },
    });

    const applicant = await prisma.user.findUnique({ where: { id: application.userId } });

    if (status === "accepted") {
      await prisma.projectMember.upsert({
        where: { userId_projectId: { userId: application.userId, projectId: application.projectId } },
        update: {},
        create: { userId: application.userId, projectId: application.projectId, role: "Member" },
      });
      if (application.roleId) {
        await prisma.role2.update({ where: { id: application.roleId }, data: { isFilled: true } });
      }
    }

    // Send email — every user-controlled field gets escaped before
    // interpolation. NEXTAUTH_URL is server-controlled, but escape it too
    // for belt-and-suspenders against future misconfigurations.
    if (process.env.RESEND_API_KEY && applicant?.email) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);
        const safeName = escapeHtml(applicant.name ?? "there");
        const safeTitle = escapeHtml(project.title);
        const safeBaseUrl = escapeHtml(process.env.NEXTAUTH_URL ?? "https://axis.community");
        const safeProjectId = encodeURIComponent(project.id);

        await resend.emails.send({
          from: process.env.EMAIL_FROM ?? "noreply@axis.community",
          to: applicant.email,
          subject: status === "accepted"
            ? `You've been accepted to ${project.title}!`
            : `Application update for ${project.title}`,
          html: status === "accepted"
            ? `<p>Hi ${safeName},</p><p>Great news! Your application to join <strong>${safeTitle}</strong> on AXIS Launch Pad has been <strong>accepted</strong>!</p><p>Head over to <a href="${safeBaseUrl}/launchpad/${safeProjectId}">the project page</a> to get started with your team.</p><p>– The AXIS Team</p>`
            : `<p>Hi ${safeName},</p><p>Thank you for applying to join <strong>${safeTitle}</strong> on AXIS Launch Pad. Unfortunately, the team has decided not to move forward with your application at this time.</p><p>Keep building — there are many other projects on <a href="${safeBaseUrl}/launchpad">AXIS Launch Pad</a> looking for collaborators.</p><p>– The AXIS Team</p>`,
        });
      } catch {
        // Email failures shouldn't break the API call
      }
    }

    return NextResponse.json(updated);
  } catch (err) {
    return safeError(err);
  }
}
