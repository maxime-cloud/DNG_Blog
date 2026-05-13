import { defineEventHandler, readBody, createError, getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    await requireRole(event, 'author')

    const rawId = getRouterParam(event, 'id')
    if (!rawId) throw createError({ statusCode: 400, statusMessage: 'Missing id' })

    const id = parseInt(rawId, 10)
    if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid id' })

    const body = await readBody(event)
    const { articleId } = body

    const existing = await prisma.media.findUnique({
      where: { id },
      select: { id: true }
    })
    if (!existing) throw createError({ statusCode: 404, statusMessage: 'Media not found' })

    const media = await prisma.media.update({
      where: { id },
      data: {
        ...(articleId !== undefined && { articleId: articleId || null })
      }
    })

    return media
  } catch (error: any) {
    if (error.statusCode) throw error
    if (error.code === 'P2025')
      throw createError({ statusCode: 404, statusMessage: 'Media not found' })
    console.error('[API] PATCH /api/admin/media/[id]', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
