import { defineEventHandler, createError, readBody } from 'h3'
import { randomUUID } from 'node:crypto'
import { sendNewsletterConfirmEmail } from '~/lib/mailer'

export default defineEventHandler(async (event) => {
  rateLimit(event, { max: 3, windowMs: 60000 })

  try {
    const body = await readBody(event)
    const parsed = newsletterSchema.safeParse(body)

    if (!parsed.success) {
      throw createError({
        statusCode: 422,
        statusMessage: 'Données invalides',
        data: parsed.error.flatten()
      })
    }

    const { email, name } = parsed.data

    const existing = await prisma.newsletterSubscription.findUnique({
      where: { email }
    })

    if (existing?.status === 'CONFIRMED') {
      throw createError({
        statusCode: 409,
        statusMessage: 'Email déjà inscrit'
      })
    }

    if (existing?.status === 'PENDING') {
      const token = existing.confirmToken ?? randomUUID()
      if (!existing.confirmToken) {
        await prisma.newsletterSubscription.update({
          where: { email },
          data: { confirmToken: token }
        })
      }
      const confirmUrl = `${process.env.NUXT_PUBLIC_SITE_URL}/api/newsletter/confirm?token=${token}`
      await sendNewsletterConfirmEmail(
        email,
        existing.name ?? email,
        confirmUrl
      )
      return { success: true, message: 'Vérifiez votre email' }
    }

    const token = randomUUID()
    await prisma.newsletterSubscription.upsert({
      where: { email },
      create: { email, name, status: 'PENDING', confirmToken: token },
      update: { name, status: 'PENDING', confirmToken: token }
    })

    const confirmUrl = `${process.env.NUXT_PUBLIC_SITE_URL}/api/newsletter/confirm?token=${token}`
    await sendNewsletterConfirmEmail(email, name ?? email, confirmUrl)

    return { success: true, message: 'Vérifiez votre email' }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[API] POST /api/newsletter/subscribe', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
