import { defineEventHandler, createError, getQuery } from 'h3'
import z from 'zod'

const querySchema = z.object({
  q: z.string().min(1)
})

export default defineEventHandler(async (event) => {
  try {
    const rawQuery = getQuery(event)
    const parsed = querySchema.safeParse(rawQuery)

    if (!parsed.success) {
      return []
    }

    const { q } = parsed.data

    const articles = await prisma.article.findMany({
      where: {
        status: 'PUBLISHED',
        title: { contains: q, mode: 'insensitive' }
      },
      take: 5,
      orderBy: { publishedAt: 'desc' },
      select: { slug: true, title: true }
    })

    return articles
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[API] GET /api/search/suggestions', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
