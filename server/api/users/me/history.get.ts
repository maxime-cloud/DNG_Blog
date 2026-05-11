import { defineEventHandler, getQuery, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)

  const query = getQuery(event)
  const result = paginationSchema.safeParse({
    page: query.page ? Number(query.page) : undefined,
    limit: query.limit ? Number(query.limit) : undefined
  })
  if (!result.success) {
    throw createError({ statusCode: 400, data: result.error.flatten() })
  }

  const { page, limit } = result.data
  const skip = (page - 1) * limit

  try {
    const [history, total] = await Promise.all([
      prisma.readingHistory.findMany({
        where: { userId: session.user.id },
        skip,
        take: limit,
        orderBy: { viewedAt: 'desc' },
        select: {
          viewedAt: true,
          article: {
            select: {
              id: true,
              title: true,
              slug: true,
              coverImageUrl: true
            }
          }
        }
      }),
      prisma.readingHistory.count({
        where: { userId: session.user.id }
      })
    ])

    return {
      data: history,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    if (error.code === 'P2002')
      throw createError({
        statusCode: 409,
        statusMessage: 'Conflit de données'
      })
    console.error('[API] GET /api/users/me/history', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
