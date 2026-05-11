import { defineEventHandler, createError, getRouterParam, getQuery } from 'h3'
import z from 'zod'

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
})

export default defineEventHandler(async (event) => {
  try {
    const slug = getRouterParam(event, 'slug')
    const rawQuery = getQuery(event)
    const { page, limit } = querySchema.parse(rawQuery)
    const skip = (page - 1) * limit

    const tag = await prisma.tag.findUnique({
      where: { slug },
      select: { id: true, slug: true, name: true }
    })

    if (!tag) {
      throw createError({ statusCode: 404, statusMessage: 'Tag introuvable' })
    }

    const where = {
      tagId: tag.id,
      article: { status: 'PUBLISHED' as const }
    }

    const [articleLinks, total] = await prisma.$transaction([
      prisma.articleTag.findMany({
        where,
        skip,
        take: limit,
        orderBy: { article: { publishedAt: 'desc' } },
        select: {
          article: {
            select: {
              id: true,
              slug: true,
              title: true,
              excerpt: true,
              coverImageUrl: true,
              publishedAt: true,
              author: { select: { name: true, image: true } },
              _count: { select: { comments: true, likes: true } }
            }
          }
        }
      }),
      prisma.articleTag.count({ where })
    ])

    return {
      data: {
        ...tag,
        articles: {
          data: articleLinks.map(l => l.article),
          meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      }
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[API] GET /api/tags/:slug', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
