import { defineEventHandler, createError, getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const slug = getRouterParam(event, 'slug')

    const series = await prisma.series.findFirst({
      where: { slug, isPublished: true },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        coverImageUrl: true,
        createdAt: true,
        articles: {
          where: { status: 'PUBLISHED' },
          orderBy: { seriesOrder: 'asc' },
          select: {
            id: true,
            slug: true,
            title: true,
            publishedAt: true
          }
        }
      }
    })

    if (!series) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Série introuvable'
      })
    }

    return { data: series }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[API] GET /api/series/:slug', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
