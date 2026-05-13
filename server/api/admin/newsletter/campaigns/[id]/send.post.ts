import { defineEventHandler, createError, getRouterParam } from 'h3'
import { sendNewsletterCampaign } from '~/lib/mailer'

export default defineEventHandler(async (event) => {
  try {
    await requireRole(event, 'admin')

    const rawId = getRouterParam(event, 'id')
    const id = parseInt(rawId ?? '', 10)
    if (isNaN(id)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid id' })
    }

    const campaign = await prisma.newsletterCampaign.findUnique({
      where: { id }
    })
    if (!campaign) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Campaign not found'
      })
    }
    if (campaign.status !== 'DRAFT' && campaign.status !== 'SCHEDULED') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Only DRAFT or SCHEDULED campaigns can be sent'
      })
    }

    const subscribers = await prisma.newsletterSubscription.findMany({
      where: { status: 'CONFIRMED' }
    })

    await prisma.newsletterCampaign.update({
      where: { id },
      data: { status: 'SENT', sentAt: new Date() }
    })

    for (const sub of subscribers) {
      const unsubscribeUrl = `${process.env.NUXT_PUBLIC_SITE_URL}/api/newsletter/unsubscribe?token=${sub.confirmToken}`
      void sendNewsletterCampaign(
        sub.email,
        campaign.subject,
        campaign.bodyHtml,
        unsubscribeUrl
      )
    }

    return { success: true, recipientCount: subscribers.length }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error(
      '[API] POST /api/admin/newsletter/campaigns/[id]/send',
      error
    )
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
