import { defineEventHandler, createError, getQuery } from 'h3'
import z from 'zod'

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  category: z.string().optional(),
  tag: z.string().optional(),
  series: z.string().optional(),
  search: z.string().optional(),
  sort: z.enum(['latest', 'popular', 'oldest']).default('latest'),
  authorId: z.string().optional()
})

export default defineEventHandler(async (event) => {
  try {
    const rawQuery = getQuery(event)
    const query = querySchema.parse(rawQuery)

    const { page, limit, category, tag, series, search, sort, authorId } = query
    const skip = (page - 1) * limit

    const orderBy
      = sort === 'popular'
        ? [{ likes: { _count: 'desc' as const } }, { publishedAt: 'desc' as const }]
        : sort === 'oldest'
          ? [{ publishedAt: 'asc' as const }]
          : [{ publishedAt: 'desc' as const }]

    const where = {
      status: 'PUBLISHED' as const,
      ...(category && {
        categories: {
          some: { category: { slug: category } }
        }
      }),
      ...(tag && {
        tags: {
          some: { tag: { slug: tag } }
        }
      }),
      ...(series && {
        series: { slug: series }
      }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' as const } },
          { excerpt: { contains: search, mode: 'insensitive' as const } }
        ]
      }),
      ...(authorId && { authorId })
    }

    const [articles, total] = await prisma.$transaction([
      prisma.article.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          slug: true,
          title: true,
          excerpt: true,
          coverImageUrl: true,
          publishedAt: true,
          author: {
            select: { name: true, image: true }
          },
          categories: {
            select: {
              category: {
                select: { name: true, slug: true, color: true }
              }
            }
          },
          tags: {
            select: {
              tag: {
                select: { name: true, slug: true }
              }
            }
          },
          _count: {
            select: { comments: true, likes: true }
          }
        }
      }),
      prisma.article.count({ where })
    ])

    const items = articles.map(a => ({
      id: a.id,
      slug: a.slug,
      title: a.title,
      description: a.excerpt,
      coverImage: a.coverImageUrl,
      publishedAt: a.publishedAt,
      author: a.author,
      category: a.categories[0]?.category ?? null,
      tags: a.tags.map(t => t.tag),
      likesCount: a._count.likes,
      _count: { comments: a._count.comments }
    }))

    return {
      data: items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  } catch (error) {
    if ((error as { statusCode?: number }).statusCode) throw error
    console.error('[API] GET /api/articles', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
