import { defineEventHandler, createError, getQuery } from 'h3'
import z from 'zod'

const querySchema = z.object({
  days: z.coerce.number().int().min(1).max(365).default(30)
})

export default defineEventHandler(async (event) => {
  await requireRole(event, 'admin')

  try {
    const { days } = querySchema.parse(getQuery(event))

    const now = Date.now()
    const periodStart = new Date(now - days * 86400000)
    const prevStart = new Date(now - 2 * days * 86400000)

    const [
      totalArticles,
      totalViews,
      totalUsers,
      totalSubscribers,
      totalComments,
      totalLikes,
      totalFavorites,
      // Current period
      viewsCur,
      commentsCur,
      subsCur,
      usersCur,
      // Previous period
      viewsPrev,
      commentsPrev,
      subsPrev,
      usersPrev
    ] = await prisma.$transaction([
      prisma.article.count({ where: { status: 'PUBLISHED' } }),
      prisma.articleView.count(),
      prisma.user.count(),
      prisma.newsletterSubscription.count({ where: { status: 'CONFIRMED' } }),
      prisma.comment.count({ where: { status: 'APPROVED' } }),
      prisma.articleLike.count(),
      prisma.favorite.count(),

      prisma.articleView.count({ where: { viewedAt: { gte: periodStart } } }),
      prisma.comment.count({ where: { createdAt: { gte: periodStart } } }),
      prisma.newsletterSubscription.count({ where: { subscribedAt: { gte: periodStart } } }),
      prisma.user.count({ where: { createdAt: { gte: periodStart } } }),

      prisma.articleView.count({ where: { viewedAt: { gte: prevStart, lt: periodStart } } }),
      prisma.comment.count({ where: { createdAt: { gte: prevStart, lt: periodStart } } }),
      prisma.newsletterSubscription.count({
        where: { subscribedAt: { gte: prevStart, lt: periodStart } }
      }),
      prisma.user.count({ where: { createdAt: { gte: prevStart, lt: periodStart } } })
    ])

    return {
      totalArticles,
      totalViews,
      totalUsers,
      totalSubscribers,
      totalComments,
      totalLikes,
      totalFavorites,
      trends: {
        views: percentChange(viewsCur, viewsPrev),
        comments: percentChange(commentsCur, commentsPrev),
        subscribers: percentChange(subsCur, subsPrev),
        users: percentChange(usersCur, usersPrev)
      },
      days
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[API] GET /api/analytics/overview', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
