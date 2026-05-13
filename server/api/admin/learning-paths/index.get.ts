import { defineEventHandler, createError } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    await requireRole(event, 'admin')

    const paths = await prisma.learningPath.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        difficulty: true,
        coverImageUrl: true,
        isPublished: true,
        createdAt: true,
        _count: {
          select: { steps: true, userProgress: true }
        }
      }
    })

    return { data: paths }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[API] GET /api/admin/learning-paths', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
