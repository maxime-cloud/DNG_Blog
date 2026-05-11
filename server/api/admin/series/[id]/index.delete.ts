import { defineEventHandler, createError, getRouterParam } from 'h3'

export default defineEventHandler(async event => {
  try {
    await requireRole(event, 'admin')

    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing id' })

    // Articles with this series will have seriesId set to null (onDelete: SetNull)
    await prisma.series.delete({ where: { id: parseInt(id, 10) } })

    return { success: true }
  } catch (error: any) {
    if (error.statusCode) throw error
    if (error.code === 'P2025')
      throw createError({ statusCode: 404, statusMessage: 'Series not found' })
    console.error('[API] DELETE /api/admin/series/[id]', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
