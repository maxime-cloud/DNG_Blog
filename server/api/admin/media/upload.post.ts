import { defineEventHandler, createError, readMultipartFormData } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    await requireRole(event, 'author')

    const parts = await readMultipartFormData(event)
    if (!parts || parts.length === 0) {
      throw createError({ statusCode: 400, statusMessage: 'No file uploaded' })
    }

    const filePart = parts.find(p => p.name === 'file')
    if (!filePart || !filePart.data) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing file field'
      })
    }

    const mimeType = filePart.type ?? 'application/octet-stream'
    if (!mimeType.startsWith('image/')) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Only image files are allowed'
      })
    }

    const filename = filePart.filename ?? `upload-${Date.now()}`
    const articleIdRaw = parts.find(p => p.name === 'articleId')?.data?.toString()
    const articleId = articleIdRaw ? parseInt(articleIdRaw, 10) : undefined

    const { secure_url } = await uploadMedia(filePart.data, filename)

    const media = await prisma.media.create({
      data: {
        url: secure_url,
        filename,
        type: 'IMAGE',
        mimeType,
        sizeBytes: filePart.data.length,
        ...(articleId && !isNaN(articleId) && { articleId })
      }
    })

    return media
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[API] POST /api/admin/media/upload', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
