import { defineEventHandler, createError, getQuery } from 'h3'

export default defineEventHandler(async event => {
  try {
    await requireRole(event, 'author')

    const query = getQuery(event)
    const parsed = paginationSchema.safeParse({
      page: query.page ? Number(query.page) : undefined,
      limit: query.limit ? Number(query.limit) : undefined
    })
    if (!parsed.success) {
      throw createError({
        statusCode: 400,
        statusMessage: parsed.error.message
      })
    }

    const { page, limit } = parsed.data
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}
    if (query.type) where.type = query.type
    if (query.articleId) where.articleId = query.articleId

    const [items, total] = await Promise.all([
      prisma.media.findMany({
        where,
        skip,
        take: limit,
        orderBy: { uploadedAt: 'desc' }
      }),
      prisma.media.count({ where })
    ])

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[API] GET /api/admin/media', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
