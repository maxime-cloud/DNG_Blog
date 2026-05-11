import { defineEventHandler, readBody, createError } from "h3";

export default defineEventHandler(async (event) => {
  try {
    const session = await requireRole(event, "admin");

    const body = await readBody(event);
    const { subject, bodyHtml } = body;

    if (
      !subject ||
      typeof subject !== "string" ||
      subject.trim().length === 0
    ) {
      throw createError({
        statusCode: 400,
        statusMessage: "subject is required",
      });
    }
    if (
      !bodyHtml ||
      typeof bodyHtml !== "string" ||
      bodyHtml.trim().length === 0
    ) {
      throw createError({
        statusCode: 400,
        statusMessage: "bodyHtml is required",
      });
    }

    const campaign = await prisma.newsletterCampaign.create({
      data: {
        subject: subject.trim(),
        bodyHtml: bodyHtml.trim(),
        status: "DRAFT",
        authorId: session.user.id,
      },
    });

    return campaign;
  } catch (error: any) {
    if (error.statusCode) throw error;
    console.error("[API] POST /api/admin/newsletter/campaigns", error);
    throw createError({ statusCode: 500, statusMessage: "Erreur serveur" });
  }
});
