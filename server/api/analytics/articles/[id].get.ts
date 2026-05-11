import { defineEventHandler, createError, getRouterParam, getQuery } from 'h3'
import z from 'zod'

const querySchema = z.object({
  days: z.coerce.number().int().min(1).max(365).default(30)
})

export default defineEventHandler(async (event) => {
  const session = await requireRole(event, 'author')

  try {
    const idParam = getRouterParam(event, 'id')
    const articleId = Number(idParam)

    if (!articleId || isNaN(articleId)) {
      throw createError({ statusCode: 400, statusMessage: 'ID invalide' })
    }

    const article = await prisma.article.findUnique({
      where: { id: articleId },
      select: {
        authorId: true,
        title: true,
        slug: true,
        _count: {
          select: { views: true, likes: true, comments: true, favorites: true }
        }
      }
    })

    if (!article) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Article introuvable'
      })
    }

    const isAdmin = session.user.role === 'admin'
    const isOwner = article.authorId === session.user.id

    if (!isAdmin && !isOwner) {
      throw createError({ statusCode: 403 })
    }

    const { days } = querySchema.parse(getQuery(event))
    const since = new Date()
    since.setDate(since.getDate() - days)
    since.setHours(0, 0, 0, 0)

    const dailyViews = await prisma.articleViewDaily.findMany({
      where: { articleId, viewDate: { gte: since } },
      orderBy: { viewDate: 'asc' },
      select: { viewDate: true, viewCount: true }
    })

    return {
      title: article.title,
      slug: article.slug,
      totalViews: article._count.views,
      likesCount: article._count.likes,
      favoritesCount: article._count.favorites,
      commentCount: article._count.comments,
      dailyViews: dailyViews.map(r => ({
        date: r.viewDate,
        views: r.viewCount
      }))
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[API] GET /api/analytics/articles/:id', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
