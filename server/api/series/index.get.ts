import { defineEventHandler, createError } from 'h3'

export default defineEventHandler(async (_event) => {
  try {
    const seriesList = await prisma.series.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        coverImageUrl: true,
        _count: {
          select: {
            articles: {
              where: { status: 'PUBLISHED' }
            }
          }
        },
        articles: {
          where: { status: 'PUBLISHED' },
          orderBy: { seriesOrder: 'asc' },
          take: 1,
          select: { slug: true }
        }
      }
    })

    const data = seriesList.map(s => ({
      id: s.id,
      slug: s.slug,
      title: s.title,
      description: s.description,
      coverImageUrl: s.coverImageUrl,
      articlesCount: s._count.articles,
      firstArticleSlug: s.articles[0]?.slug ?? null
    }))

    return { data }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[API] GET /api/series', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
