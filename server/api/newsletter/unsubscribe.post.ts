import { defineEventHandler, createError, readBody, getQuery } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const queryParams = getQuery(event)
    const token = body?.token ?? queryParams?.token

    if (!token || typeof token !== 'string') {
      throw createError({ statusCode: 400, statusMessage: 'Token manquant' })
    }

    const subscription = await prisma.newsletterSubscription.findFirst({
      where: { confirmToken: token }
    })

    if (!subscription) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Abonnement introuvable'
      })
    }

    await prisma.newsletterSubscription.update({
      where: { id: subscription.id },
      data: { status: 'UNSUBSCRIBED', unsubscribedAt: new Date() }
    })

    return { success: true }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[API] POST /api/newsletter/unsubscribe', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
