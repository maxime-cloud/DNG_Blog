import { defineEventHandler, createError, getQuery } from 'h3'
import z from 'zod'

const querySchema = z.object({
  days: z.coerce.number().int().min(1).max(365).default(30)
})

export default defineEventHandler(async (event) => {
  await requireRole(event, 'admin')

  try {
    const { days } = querySchema.parse(getQuery(event))
    const since = new Date()
    since.setDate(since.getDate() - days)
    since.setHours(0, 0, 0, 0)

    const rows = await prisma.articleViewDaily.groupBy({
      by: ['viewDate'],
      where: { viewDate: { gte: since } },
      _sum: { viewCount: true },
      orderBy: { viewDate: 'asc' }
    })

    const data = rows.map(r => ({
      date: r.viewDate,
      views: r._sum.viewCount ?? 0
    }))

    return { data, days }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[API] GET /api/analytics/traffic', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
