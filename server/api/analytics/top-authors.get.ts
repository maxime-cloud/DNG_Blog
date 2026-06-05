import { defineEventHandler, createError, getQuery } from 'h3'
import z from 'zod'

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(5)
})

export default defineEventHandler(async (event) => {
  await requireRole(event, 'admin')

  try {
    const { limit } = querySchema.parse(getQuery(event))

    // Authors = users that have at least one published article
    const authors = await prisma.user.findMany({
      where: { articles: { some: { status: 'PUBLISHED' } } },
      select: {
        id: true,
        name: true,
        image: true,
        articles: {
          where: { status: 'PUBLISHED' },
          select: { _count: { select: { views: true } } }
        },
        _count: { select: { articles: { where: { status: 'PUBLISHED' } } } }
      }
    })

    const data = authors
      .map(a => ({
        id: a.id,
        name: a.name,
        image: a.image,
        articlesCount: a._count.articles,
        viewsCount: a.articles.reduce((sum, art) => sum + art._count.views, 0)
      }))
      .sort((x, y) => y.viewsCount - x.viewsCount)
      .slice(0, limit)

    return { data }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[API] GET /api/analytics/top-authors', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
