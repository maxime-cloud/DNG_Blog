import { defineEventHandler, createError, getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const session = await requireRole(event, 'author')

    const idParam = getRouterParam(event, 'id')
    if (!idParam)
      throw createError({ statusCode: 400, statusMessage: 'ID requis' })
    const articleId = parseInt(idParam, 10)
    if (isNaN(articleId))
      throw createError({ statusCode: 400, statusMessage: 'ID invalide' })

    const article = await prisma.article.findUnique({
      where: { id: articleId },
      select: { id: true, authorId: true }
    })

    if (!article) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Article introuvable'
      })
    }

    const isAdmin = session.user.role === 'admin'
    if (!isAdmin && article.authorId !== session.user.id) {
      throw createError({ statusCode: 403 })
    }

    // ArticleRevision model does not exist in the current schema
    return { data: [], message: 'Revision history not available' }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[API] GET /api/admin/articles/:id/revisions', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
