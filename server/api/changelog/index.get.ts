import { defineEventHandler, createError, getQuery } from 'h3'
import z from 'zod'

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
})

export default defineEventHandler(async (event) => {
  try {
    const { page, limit } = querySchema.parse(getQuery(event))
    const skip = (page - 1) * limit

    const [entries, total] = await prisma.$transaction([
      prisma.changelogEntry.findMany({
        skip,
        take: limit,
        orderBy: { publishedAt: 'desc' },
        select: {
          id: true,
          version: true,
          type: true,
          title: true,
          description: true,
          publishedAt: true,
          author: { select: { name: true, image: true } }
        }
      }),
      prisma.changelogEntry.count()
    ])

    return {
      data: entries,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[API] GET /api/changelog', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
