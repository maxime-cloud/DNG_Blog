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

    rateLimit(event, { max: 5, windowMs: 60000 })

    await trackArticleView(event, String(article.id))

    return { success: true }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[API] POST /api/articles/:slug/views', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
