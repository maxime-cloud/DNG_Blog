import { defineEventHandler, createError, getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const slug = getRouterParam(event, 'slug')

    const article = await prisma.article.findUnique({
      where: { slug },
      select: { id: true, status: true }
    })

    if (!article || article.status !== 'PUBLISHED') {
      throw createError({
        statusCode: 404,
        statusMessage: 'Article introuvable'
      })
    }

    const session = await getAuthSession(event)

    const count = await prisma.articleLike.count({
      where: { articleId: article.id }
    })

    let liked = false
    if (session) {
      const userLike = await prisma.articleLike.findUnique({
        where: {
          userId_articleId: { userId: session.user.id, articleId: article.id }
        },
        select: { userId: true }
      })
      liked = !!userLike
    }

    return { count, liked }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[API] GET /api/articles/:slug/likes', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
