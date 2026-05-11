import { defineEventHandler, createError } from 'h3'

export default defineEventHandler(async (_event) => {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: {
        articles: { _count: 'desc' }
      },
      select: {
        id: true,
        slug: true,
        name: true,
        _count: {
          select: { articles: true }
        }
      }
    })

    return { data: tags }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[API] GET /api/tags', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
