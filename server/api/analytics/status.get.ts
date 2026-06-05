import { defineEventHandler, createError } from 'h3'

const STATUSES = ['DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED'] as const

export default defineEventHandler(async (event) => {
  await requireRole(event, 'admin')

  try {
    const rows = await prisma.article.groupBy({
      by: ['status'],
      _count: { status: true }
    })

    const counts = new Map(rows.map(r => [r.status, r._count.status]))

    const data = STATUSES.map(status => ({
      status,
      count: counts.get(status) ?? 0
    }))

    return { data }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[API] GET /api/analytics/status', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
