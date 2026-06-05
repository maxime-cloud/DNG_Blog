import { defineEventHandler, createError, getQuery } from 'h3'
import z from 'zod'

const querySchema = z.object({
  days: z.coerce.number().int().min(30).max(366).default(365)
})

export default defineEventHandler(async (event) => {
  await requireRole(event, 'admin')

  try {
    const { days } = querySchema.parse(getQuery(event))
    const since = new Date(Date.now() - days * 86400000)
    since.setHours(0, 0, 0, 0)

    const articles = await prisma.article.findMany({
      where: { status: 'PUBLISHED', publishedAt: { gte: since } },
      select: { publishedAt: true }
    })

    const data = bucketByDay(
      articles.map(a => a.publishedAt),
      days
    )

    return { data, days }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[API] GET /api/analytics/publications', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
