import { defineEventHandler, createError, readMultipartFormData } from 'h3'

export default defineEventHandler(async event => {
  try {
    await requireRole(event, 'author')

    const parts = await readMultipartFormData(event)
    if (!parts?.length) throw createError({ statusCode: 400, statusMessage: 'No file uploaded' })

    const filePart = parts.find(p => p.name === 'file')
    if (!filePart?.data) throw createError({ statusCode: 400, statusMessage: 'Missing file field' })

    const mimeType = filePart.type ?? 'application/octet-stream'
    if (!mimeType.startsWith('image/'))
      throw createError({ statusCode: 400, statusMessage: 'Only image files are allowed' })

    const slug = parts.find(p => p.name === 'slug')?.data?.toString() ?? `cover-${Date.now()}`
    const { secure_url } = await uploadArticleCover(filePart.data, slug)

    return { url: secure_url }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[API] POST /api/admin/articles/cover', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
