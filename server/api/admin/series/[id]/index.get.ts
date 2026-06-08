import { defineEventHandler, createError, getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    await requireRole(event, 'admin')

    const rawId = getRouterParam(event, 'id')
    if (!rawId) throw createError({ statusCode: 400, statusMessage: 'Missing id' })
    const id = parseInt(rawId, 10)

    const series = await prisma.series.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        coverImageUrl: true,
        isPublished: true,
        articles: {
          orderBy: { seriesOrder: 'asc' },
          select: {
            id: true,
            title: true,
            slug: true,
            status: true,
            seriesOrder: true
          }
        }
      }
    })

    if (!series) {
      throw createError({ statusCode: 404, statusMessage: 'Série non trouvée' })
    }

    return { data: series }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[API] GET /api/admin/series/:id', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
