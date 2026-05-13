import { defineEventHandler, createError, readMultipartFormData, getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    await requireRole(event, 'admin')

    const rawId = getRouterParam(event, 'id')
    if (!rawId) throw createError({ statusCode: 400, statusMessage: 'Missing id' })
    const id = parseInt(rawId, 10)

    const parts = await readMultipartFormData(event)
    if (!parts || parts.length === 0) {
      throw createError({ statusCode: 400, statusMessage: 'No file uploaded' })
    }

    const filePart = parts.find(p => p.name === 'file')
    if (!filePart?.data) {
      throw createError({ statusCode: 400, statusMessage: 'Missing file field' })
    }

    const mimeType = filePart.type ?? 'application/octet-stream'
    if (!mimeType.startsWith('image/')) {
      throw createError({ statusCode: 400, statusMessage: 'Only image files are allowed' })
    }

    const category = await prisma.category.findUnique({
      where: { id },
      select: { slug: true }
    })
    if (!category) {
      throw createError({ statusCode: 404, statusMessage: 'Category not found' })
    }

    const { secure_url } = await uploadCategoryIcon(filePart.data, category.slug)

    const updated = await prisma.category.update({
      where: { id },
      data: { imageUrl: secure_url }
    })

    return { imageUrl: updated.imageUrl }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[API] POST /api/admin/categories/[id]/icon', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
