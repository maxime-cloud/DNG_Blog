import { defineEventHandler, createError } from 'h3'

export default defineEventHandler(async (event) => {
  await requireRole(event, 'admin')

  try {
    const [
      totalArticles,
      totalViews,
      totalUsers,
      totalSubscribers,
      totalComments
    ] = await prisma.$transaction([
      prisma.article.count({ where: { status: 'PUBLISHED' } }),
      prisma.articleView.count(),
      prisma.user.count(),
      prisma.newsletterSubscription.count({ where: { status: 'CONFIRMED' } }),
      prisma.comment.count({ where: { status: 'APPROVED' } })
    ])

    return {
      totalArticles,
      totalViews,
      totalUsers,
      totalSubscribers,
      totalComments
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[API] GET /api/analytics/overview', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
