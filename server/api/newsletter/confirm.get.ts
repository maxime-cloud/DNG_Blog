import { defineEventHandler, createError, getQuery, sendRedirect } from 'h3'
import { sendNewsletterWelcomeEmail } from '~/lib/mailer'

export default defineEventHandler(async (event) => {
  try {
    const { token } = getQuery(event)

    if (!token || typeof token !== 'string') {
      throw createError({ statusCode: 400, statusMessage: 'Token manquant' })
    }

    const subscription = await prisma.newsletterSubscription.findFirst({
      where: { confirmToken: token, status: 'PENDING' }
    })

    if (!subscription) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Token invalide ou expiré'
      })
    }

    await prisma.newsletterSubscription.update({
      where: { id: subscription.id },
      data: {
        status: 'CONFIRMED',
        confirmedAt: new Date(),
        confirmToken: null
      }
    })

    await sendNewsletterWelcomeEmail(
      subscription.email,
      subscription.name ?? subscription.email
    )

    const siteUrl = process.env.NUXT_PUBLIC_SITE_URL ?? ''
    return sendRedirect(event, `${siteUrl}?newsletter=confirmed`, 302)
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[API] GET /api/newsletter/confirm', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
