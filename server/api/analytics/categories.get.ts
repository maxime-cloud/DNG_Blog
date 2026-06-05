import { defineEventHandler, createError } from 'h3'

export default defineEventHandler(async (event) => {
  await requireRole(event, 'admin')

  try {
    const categories = await prisma.category.findMany({
      select: {
        name: true,
        slug: true,
        color: true,
        _count: {
          select: {
            articles: { where: { article: { status: 'PUBLISHED' } } }
          }
        }
      }
    })

    const data = categories
      .map(c => ({
        name: c.name,
        slug: c.slug,
        color: c.color,
        count: c._count.articles
      }))
      .filter(c => c.count > 0)
      .sort((a, b) => b.count - a.count)

    return { data }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[API] GET /api/analytics/categories', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
