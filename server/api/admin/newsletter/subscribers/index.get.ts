import { defineEventHandler, createError, getQuery, setHeader } from 'h3'
import z from 'zod'

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['PENDING', 'CONFIRMED', 'UNSUBSCRIBED']).optional(),
  export: z.coerce.boolean().default(false)
})

export default defineEventHandler(async (event) => {
  try {
    await requireRole(event, 'admin')

    const rawQuery = getQuery(event)
    const {
      page,
      limit,
      status,
      export: doExport
    } = querySchema.parse(rawQuery)

    if (doExport) {
      const subscribers = await prisma.newsletterSubscription.findMany({
        where: { status: 'CONFIRMED' },
        orderBy: { confirmedAt: 'desc' },
        select: { id: true, email: true, name: true, confirmedAt: true }
      })

      const rows = [
        'id,email,name,confirmedAt',
        ...subscribers.map(s =>
          [
            s.id,
            s.email,
            s.name ?? '',
            s.confirmedAt?.toISOString() ?? ''
          ].join(',')
        )
      ].join('\n')

      setHeader(event, 'Content-Type', 'text/csv')
      setHeader(
        event,
        'Content-Disposition',
        'attachment; filename="subscribers.csv"'
      )
      return rows
    }

    const where = { ...(status && { status }) }
    const skip = (page - 1) * limit

    const [subscribers, total] = await prisma.$transaction([
      prisma.newsletterSubscription.findMany({
        where,
        skip,
        take: limit,
        orderBy: { subscribedAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          status: true,
          subscribedAt: true,
          confirmedAt: true
        }
      }),
      prisma.newsletterSubscription.count({ where })
    ])

    return {
      data: subscribers,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[API] GET /api/admin/newsletter/subscribers', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
