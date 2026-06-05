import { defineEventHandler, createError } from 'h3'

export default defineEventHandler(async () => {
  try {
    const articles = await prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, title: true }
    })

    return articles
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[API] GET /api/articles/slugs', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
