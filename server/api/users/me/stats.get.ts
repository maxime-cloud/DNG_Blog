import { defineEventHandler, createError, getQuery } from 'h3'
import z from 'zod'

const querySchema = z.object({
  days: z.coerce.number().int().min(7).max(365).default(30)
})

export default defineEventHandler(async (event) => {
  // author + admin uniquement ; scope strictement limité à l'utilisateur courant
  const session = await requireRole(event, 'author')
  const authorId = session.user.id

  try {
    const { days } = querySchema.parse(getQuery(event))

    const now = Date.now()
    const periodStart = new Date(now - days * 86400000)
    const prevStart = new Date(now - 2 * days * 86400000)

    const publishedWhere = { authorId, status: 'PUBLISHED' as const }

    const [
      totalArticles,
      totalDrafts,
      totalViews,
      totalLikes,
      totalComments,
      viewsCur,
      viewsPrev,
      lastArticle,
      topArticles,
      recentViews
    ] = await prisma.$transaction([
      prisma.article.count({ where: publishedWhere }),
      prisma.article.count({ where: { authorId, status: 'DRAFT' } }),
      prisma.articleView.count({ where: { article: { authorId } } }),
      prisma.articleLike.count({ where: { article: { authorId } } }),
      prisma.comment.count({ where: { article: { authorId }, status: 'APPROVED' } }),

      prisma.articleView.count({
        where: { article: { authorId }, viewedAt: { gte: periodStart } }
      }),
      prisma.articleView.count({
        where: { article: { authorId }, viewedAt: { gte: prevStart, lt: periodStart } }
      }),

      prisma.article.findFirst({
        where: publishedWhere,
        orderBy: { publishedAt: 'desc' },
        select: { publishedAt: true }
      }),

      prisma.article.findMany({
        where: { authorId },
        take: 5,
        orderBy: { views: { _count: 'desc' } },
        select: {
          slug: true,
          title: true,
          status: true,
          publishedAt: true,
          _count: { select: { views: true, likes: true, comments: true } }
        }
      }),

      // Vues sur la période pour la série temporelle
      prisma.articleView.findMany({
        where: { article: { authorId }, viewedAt: { gte: periodStart } },
        select: { viewedAt: true }
      })
    ])

    const viewsSeries = bucketByDay(
      recentViews.map(v => v.viewedAt),
      days
    ).map(d => ({ label: d.date.slice(5), value: d.count }))

    return {
      totals: {
        articles: totalArticles,
        drafts: totalDrafts,
        views: totalViews,
        likes: totalLikes,
        comments: totalComments
      },
      trends: {
        views: percentChange(viewsCur, viewsPrev)
      },
      lastPublishedAt: lastArticle?.publishedAt ?? null,
      viewsSeries,
      topArticles: topArticles.map(a => ({
        slug: a.slug,
        title: a.title,
        status: a.status,
        publishedAt: a.publishedAt,
        viewsCount: a._count.views,
        likesCount: a._count.likes,
        commentsCount: a._count.comments
      })),
      days
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[API] GET /api/users/me/stats', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
