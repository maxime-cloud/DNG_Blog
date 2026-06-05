import { defineEventHandler, createError, getQuery } from 'h3'
import z from 'zod'

const querySchema = z.object({
  days: z.coerce.number().int().min(1).max(365).default(30)
})

export default defineEventHandler(async (event) => {
  await requireRole(event, 'admin')

  try {
    const { days } = querySchema.parse(getQuery(event))
    const since = new Date(Date.now() - days * 86400000)
    since.setHours(0, 0, 0, 0)

    const comments = await prisma.comment.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true }
    })

    const data = bucketByDay(
      comments.map(c => c.createdAt),
      days
    )

    return { data, days }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[API] GET /api/analytics/comments-trend', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
