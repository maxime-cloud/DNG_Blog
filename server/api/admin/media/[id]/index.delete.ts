import { defineEventHandler, createError, getRouterParam } from 'h3'

export default defineEventHandler(async event => {
  try {
    await requireRole(event, 'author')

    const rawId = getRouterParam(event, 'id')
    if (!rawId) throw createError({ statusCode: 400, statusMessage: 'Missing id' })

    const id = parseInt(rawId, 10)
    if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid id' })

    const media = await prisma.media.findUnique({ where: { id } })
    if (!media) throw createError({ statusCode: 404, statusMessage: 'Media not found' })

    // NOTE: publicId is not in the Media schema — Cloudinary cleanup skipped.
    // If needed, store publicId in Media schema and call deleteImage(media.publicId) here.
    await prisma.media.delete({ where: { id } })

    return { success: true }
  } catch (error: any) {
    if (error.statusCode) throw error
    if (error.code === 'P2025')
      throw createError({ statusCode: 404, statusMessage: 'Media not found' })
    console.error('[API] DELETE /api/admin/media/[id]', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
