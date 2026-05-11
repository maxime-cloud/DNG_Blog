import { defineEventHandler, createError, getQuery } from 'h3'
import z from 'zod'

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  role: z.enum(['reader', 'author', 'admin']).optional(),
  banned: z.coerce.boolean().optional(),
  search: z.string().optional()
})

export default defineEventHandler(async (event) => {
  try {
    await requireRole(event, 'admin')

    const rawQuery = getQuery(event)
    const { page, limit, role, banned, search } = querySchema.parse(rawQuery)
    const skip = (page - 1) * limit

    const where = {
      ...(role && { role }),
      ...(banned !== undefined && { banned }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } }
        ]
      })
    }

    const [users, total] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          role: true,
          banned: true,
          banReason: true,
          createdAt: true,
          _count: {
            select: {
              articles: true,
              comments: true
            }
          }
        }
      }),
      prisma.user.count({ where })
    ])

    return {
      data: users,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[API] GET /api/admin/users', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
