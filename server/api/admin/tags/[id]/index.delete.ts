import { defineEventHandler, createError, getRouterParam } from 'h3'

export default defineEventHandler(async event => {
  try {
    await requireRole(event, 'admin')

    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing id' })

    await prisma.tag.delete({ where: { id: parseInt(id, 10) } })

    return { success: true }
  } catch (error: any) {
    if (error.statusCode) throw error
    if (error.code === 'P2025')
      throw createError({ statusCode: 404, statusMessage: 'Tag not found' })
    console.error('[API] DELETE /api/admin/tags/[id]', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
