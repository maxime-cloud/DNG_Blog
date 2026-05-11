import { defineEventHandler, createError, getRouterParam } from 'h3'
import { sendAdminReportEmail } from '~/lib/mailer'

export default defineEventHandler(async (event) => {
  try {
    const session = await requireAuth(event)
    rateLimit(event, { max: 5, windowMs: 60000 })

    const id = Number(getRouterParam(event, 'id'))
    if (isNaN(id))
      throw createError({ statusCode: 400, statusMessage: 'ID invalide' })

    const comment = await prisma.comment.findUnique({
      where: { id },
      select: { id: true, reportCount: true }
    })
    if (!comment)
      throw createError({
        statusCode: 404,
        statusMessage: 'Commentaire introuvable'
      })

    const updated = await prisma.comment.update({
      where: { id },
      data: { reportCount: { increment: 1 } },
      select: { reportCount: true }
    })

    if (updated.reportCount >= 3) {
      const adminEmail = process.env.ADMIN_EMAIL
      if (adminEmail) {
        const siteUrl = process.env.NUXT_PUBLIC_SITE_URL ?? ''
        const commentUrl = `${siteUrl}/admin/comments/${id}`
        void sendAdminReportEmail(adminEmail, commentUrl, updated.reportCount)
      }
    }

    return { success: true }
  } catch (error: any) {
    if (error.statusCode) throw error
    if (error.code === 'P2002') throw createError({ statusCode: 409 })
    console.error('[API] POST /api/comments/:id/report', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
