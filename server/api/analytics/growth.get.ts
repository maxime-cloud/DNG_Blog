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

    const [subs, users] = await prisma.$transaction([
      prisma.newsletterSubscription.findMany({
        where: { subscribedAt: { gte: since } },
        select: { subscribedAt: true }
      }),
      prisma.user.findMany({
        where: { createdAt: { gte: since } },
        select: { createdAt: true }
      })
    ])

    return {
      subscribers: bucketByDay(
        subs.map(s => s.subscribedAt),
        days
      ),
      users: bucketByDay(
        users.map(u => u.createdAt),
        days
      ),
      days
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[API] GET /api/analytics/growth', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
