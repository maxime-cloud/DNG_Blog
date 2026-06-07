import { defineEventHandler, readBody, createError, getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    await requireRole(event, 'admin')

    const rawSeriesId = getRouterParam(event, 'id')
    if (!rawSeriesId) throw createError({ statusCode: 400, statusMessage: 'Missing id' })
    const seriesId = parseInt(rawSeriesId, 10)

    const body = await readBody(event)
    const { articles } = body

    if (!Array.isArray(articles) || articles.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'articles must be a non-empty array'
      })
    }

    const series = await prisma.series.findUnique({
      where: { id: seriesId },
      select: { id: true }
    })
    if (!series) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Série non trouvée'
      })
    }

    // Update each article's seriesOrder
    await prisma.$transaction(
      articles.map((article: { id: number, seriesOrder: number }) =>
        prisma.article.update({
          where: { id: article.id },
          data: { seriesOrder: article.seriesOrder }
        })
      )
    )

    return { success: true }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[API] PATCH /api/admin/series/[id]/reorder', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
