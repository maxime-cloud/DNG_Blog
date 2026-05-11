import { defineEventHandler, readBody, createError, getRouterParam } from "h3";

export default defineEventHandler(async (event) => {
  try {
    await requireRole(event, "admin");

    const rawId = getRouterParam(event, "id");
    const id = parseInt(rawId ?? "", 10);
    if (isNaN(id)) {
      throw createError({ statusCode: 400, statusMessage: "Invalid id" });
    }

    const body = await readBody(event);
    const { scheduledAt } = body;

    if (!scheduledAt || typeof scheduledAt !== "string") {
      throw createError({
        statusCode: 400,
        statusMessage: "scheduledAt is required",
      });
    }

    const scheduledDate = new Date(scheduledAt);
    if (isNaN(scheduledDate.getTime())) {
      throw createError({
        statusCode: 400,
        statusMessage: "scheduledAt must be a valid ISO date",
      });
    }
    if (scheduledDate <= new Date()) {
      throw createError({
        statusCode: 400,
        statusMessage: "scheduledAt must be in the future",
      });
    }

    const existing = await prisma.newsletterCampaign.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) {
      throw createError({
        statusCode: 404,
        statusMessage: "Campaign not found",
      });
    }

    const campaign = await prisma.newsletterCampaign.update({
      where: { id },
      data: { status: "SCHEDULED", scheduledAt: scheduledDate },
    });

    return campaign;
  } catch (error: any) {
    if (error.statusCode) throw error;
    console.error(
      "[API] POST /api/admin/newsletter/campaigns/[id]/schedule",
      error,
    );
    throw createError({ statusCode: 500, statusMessage: "Erreur serveur" });
  }
});
