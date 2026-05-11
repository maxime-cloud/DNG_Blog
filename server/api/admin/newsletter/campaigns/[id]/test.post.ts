import { defineEventHandler, createError, getRouterParam } from "h3";
import { sendNewsletterCampaign } from "~/lib/mailer";

export default defineEventHandler(async (event) => {
  try {
    const session = await requireRole(event, "admin");

    const rawId = getRouterParam(event, "id");
    const id = parseInt(rawId ?? "", 10);
    if (isNaN(id)) {
      throw createError({ statusCode: 400, statusMessage: "Invalid id" });
    }

    const campaign = await prisma.newsletterCampaign.findUnique({
      where: { id },
    });
    if (!campaign) {
      throw createError({
        statusCode: 404,
        statusMessage: "Campaign not found",
      });
    }

    await sendNewsletterCampaign(
      session.user.email,
      campaign.subject,
      campaign.bodyHtml,
      "",
    );

    return { success: true };
  } catch (error: any) {
    if (error.statusCode) throw error;
    console.error(
      "[API] POST /api/admin/newsletter/campaigns/[id]/test",
      error,
    );
    throw createError({ statusCode: 500, statusMessage: "Erreur serveur" });
  }
});
