import { defineEventHandler, createError, getQuery } from 'h3'
import z from 'zod'

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED']).optional(),
  search: z.string().optional(),
  authorId: z.string().optional()
})

export default defineEventHandler(async (event) => {
  try {
    const session = await requireRole(event, 'author')

    const rawQuery = getQuery(event)
    const { page, limit, status, search, authorId }
      = querySchema.parse(rawQuery)
    const skip = (page - 1) * limit

    const isAdmin = session.user.role === 'admin'

    const where = {
      // Non-admins can only see their own articles
      ...(!isAdmin && { authorId: session.user.id }),
      // Admins can filter by authorId
      ...(isAdmin && authorId && { authorId }),
      ...(status && { status }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' as const } },
          { excerpt: { contains: search, mode: 'insensitive' as const } }
        ]
      })
    }

    const [articles, total] = await prisma.$transaction([
      prisma.article.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          slug: true,
          title: true,
          status: true,
          publishedAt: true,
          createdAt: true,
          updatedAt: true,
          author: {
            select: { id: true, name: true, email: true }
          },
          categories: {
            select: {
              category: { select: { id: true, name: true, slug: true } }
            }
          },
          _count: {
            select: { comments: true, likes: true, views: true }
          }
        }
      }),
      prisma.article.count({ where })
    ])

    const items = articles.map(a => ({
      ...a,
      category: a.categories[0]?.category ?? null,
      categories: undefined
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
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[API] GET /api/admin/articles', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
