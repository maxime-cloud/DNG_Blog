import { defineEventHandler, createError, getQuery } from 'h3'
import z from 'zod'

const querySchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  tag: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
})

export default defineEventHandler(async (event) => {
  try {
    const rawQuery = getQuery(event)
    const { q, category, tag, page, limit } = querySchema.parse(rawQuery)
    const skip = (page - 1) * limit

    const where = {
      status: 'PUBLISHED' as const,
      ...(q && {
        OR: [
          { title: { contains: q, mode: 'insensitive' as const } },
          { excerpt: { contains: q, mode: 'insensitive' as const } }
        ]
      }),
      ...(category && {
        categories: { some: { category: { slug: category } } }
      }),
      ...(tag && {
        tags: { some: { tag: { slug: tag } } }
      })
    }

    const [articles, total] = await prisma.$transaction([
      prisma.article.findMany({
        where,
        skip,
        take: limit,
        orderBy: { publishedAt: 'desc' },
        select: {
          slug: true,
          title: true,
          excerpt: true,
          coverImageUrl: true,
          publishedAt: true,
          categories: {
            take: 1,
            select: {
              category: { select: { name: true, slug: true, color: true } }
            }
          },
          author: { select: { name: true, image: true } }
        }
      }),
      prisma.article.count({ where })
    ])

    const data = articles.map(a => ({
      type: 'article' as const,
      slug: a.slug,
      title: a.title,
      description: a.excerpt,
      coverImage: a.coverImageUrl,
      publishedAt: a.publishedAt,
      category: a.categories[0]?.category ?? null,
      author: a.author
    }))

    return { data, total, page, limit }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[API] GET /api/search', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
