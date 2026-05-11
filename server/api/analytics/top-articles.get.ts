import { defineEventHandler, createError, getQuery } from 'h3'
import z from 'zod'

const querySchema = z.object({
  period: z.enum(['7d', '30d', '90d', 'all']).default('30d'),
  limit: z.coerce.number().int().min(1).max(50).default(10)
})

const PERIOD_DAYS: Record<string, number> = {
  '7d': 7,
  '30d': 30,
  '90d': 90
}

export default defineEventHandler(async (event) => {
  await requireRole(event, 'admin')

  try {
    const { period, limit } = querySchema.parse(getQuery(event))

    const dateFilter
      = period !== 'all'
        ? {
            views: {
              some: {
                viewedAt: {
                  gte: new Date(Date.now() - PERIOD_DAYS[period]! * 86400000)
                }
              }
            }
          }
        : {}

    const articles = await prisma.article.findMany({
      where: {
        status: 'PUBLISHED',
        ...dateFilter
      },
      take: limit,
      orderBy: { views: { _count: 'desc' } },
      select: {
        title: true,
        slug: true,
        _count: { select: { views: true, likes: true } }
      }
    })

    const data = articles.map(a => ({
      title: a.title,
      slug: a.slug,
      viewsCount: a._count.views,
      likesCount: a._count.likes
    }))

    return { data, period, limit }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[API] GET /api/analytics/top-articles', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
