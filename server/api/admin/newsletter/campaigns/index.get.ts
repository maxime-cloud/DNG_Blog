import { defineEventHandler, createError } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    await requireRole(event, 'admin')

    const campaigns = await prisma.newsletterCampaign.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        subject: true,
        status: true,
        scheduledAt: true,
        sentAt: true,
        recipientCount: true,
        createdAt: true,
        updatedAt: true,
        author: { select: { id: true, name: true } }
      }
    })

    return { data: campaigns }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[API] GET /api/admin/newsletter/campaigns', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
