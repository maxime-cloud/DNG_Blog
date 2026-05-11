import { defineEventHandler, createError } from 'h3'

export default defineEventHandler(async (_event) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        color: true,
        imageUrl: true,
        _count: {
          select: {
            articles: {
              where: { article: { status: 'PUBLISHED' } }
            }
          }
        }
      }
    })

    return { data: categories }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[API] GET /api/categories', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
