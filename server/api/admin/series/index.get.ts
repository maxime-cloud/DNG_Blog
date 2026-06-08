import { defineEventHandler, createError } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    await requireRole(event, 'admin')

    const seriesList = await prisma.series.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        coverImageUrl: true,
        isPublished: true,
        _count: {
          select: { articles: true }
        }
      }
    })

    const data = seriesList.map(s => ({
      id: s.id,
      title: s.title,
      description: s.description,
      coverImageUrl: s.coverImageUrl,
      isPublished: s.isPublished,
      articlesCount: s._count.articles
    }))

    return { data }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[API] GET /api/admin/series', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
