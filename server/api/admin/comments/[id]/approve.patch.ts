import { defineEventHandler, createError, getRouterParam } from 'h3'
import { sendCommentNotificationEmail } from '~/lib/mailer'

export default defineEventHandler(async (event) => {
  try {
    await requireRole(event, 'admin')

    const idParam = getRouterParam(event, 'id')
    const id = Number(idParam)
    if (!id) {
      throw createError({ statusCode: 400, statusMessage: 'ID invalide' })
    }

    const comment = await prisma.comment.findUnique({
      where: { id },
      select: {
        id: true,
        article: {
          select: {
            id: true,
            title: true,
            slug: true,
            authorId: true,
            author: { select: { email: true } }
          }
        }
      }
    })

    if (!comment) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Commentaire introuvable'
      })
    }

    const updated = await prisma.comment.update({
      where: { id },
      data: { status: 'APPROVED' }
    })

    const { article } = comment
    if (article.authorId && article.author.email) {
      const siteUrl = process.env.NUXT_PUBLIC_SITE_URL ?? ''
      const articleUrl = `${siteUrl}/articles/${article.slug}`
      void sendCommentNotificationEmail(
        article.author.email,
        article.title,
        articleUrl
      )
    }

    return updated
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[API] PATCH /api/admin/comments/:id/approve', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
