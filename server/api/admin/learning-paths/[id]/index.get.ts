import { defineEventHandler, createError, getRouterParam } from 'h3'

export default defineEventHandler(async event => {
  try {
    await requireRole(event, 'admin')

    const rawId = getRouterParam(event, 'id')
    if (!rawId) throw createError({ statusCode: 400, statusMessage: 'Missing id' })
    const id = parseInt(rawId, 10)
    if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid id' })

    const path = await prisma.learningPath.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        difficulty: true,
        coverImageUrl: true,
        isPublished: true,
        createdAt: true,
        steps: {
          orderBy: { stepOrder: 'asc' },
          select: {
            id: true,
            stepOrder: true,
            stepTitle: true,
            article: {
              select: { id: true, title: true, slug: true }
            }
          }
        }
      }
    })

    if (!path) throw createError({ statusCode: 404, statusMessage: 'Parcours introuvable' })

    return { data: path }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[API] GET /api/admin/learning-paths/:id', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
