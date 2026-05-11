import { defineEventHandler, createError, getQuery } from 'h3'
import z from 'zod'

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'SPAM']).optional(),
  articleId: z.coerce.number().int().optional(),
  search: z.string().optional()
})

export default defineEventHandler(async (event) => {
  try {
    await requireRole(event, 'admin')

    const rawQuery = getQuery(event)
    const { page, limit, status, articleId, search }
      = querySchema.parse(rawQuery)
    const skip = (page - 1) * limit

    const where = {
      ...(status && { status }),
      ...(articleId && { articleId }),
      ...(search && {
        content: { contains: search, mode: 'insensitive' as const }
      })
    }

    const [comments, total] = await prisma.$transaction([
      prisma.comment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          content: true,
          status: true,
          reportCount: true,
          createdAt: true,
          parentId: true,
          user: {
            select: { id: true, name: true, email: true, image: true }
          },
          article: {
            select: { id: true, title: true, slug: true }
          }
        }
      }),
      prisma.comment.count({ where })
    ])

    return {
      data: comments,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[API] GET /api/admin/comments', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
