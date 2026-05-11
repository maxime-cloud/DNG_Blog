import { defineEventHandler, createError } from 'h3'

export default defineEventHandler(async (event) => {
  await requireRole(event, 'admin')

  try {
    // ArticleView has a referrer field — group by domain
    const rows = await prisma.articleView.groupBy({
      by: ['referrer'],
      _count: { referrer: true },
      orderBy: { _count: { referrer: 'desc' } },
      take: 20
    })

    const data = rows.map((r) => {
      let domain = 'Direct'
      if (r.referrer) {
        try {
          domain = new URL(r.referrer).hostname || 'Direct'
        } catch {
          domain = r.referrer
        }
      }
      return { referrer: domain, count: r._count.referrer }
    })

    // Merge entries with the same domain
    const merged = new Map<string, number>()
    for (const entry of data) {
      merged.set(
        entry.referrer,
        (merged.get(entry.referrer) ?? 0) + entry.count
      )
    }

    const result = Array.from(merged.entries())
      .map(([referrer, count]) => ({ referrer, count }))
      .sort((a, b) => b.count - a.count)

    return { data: result }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[API] GET /api/analytics/referrers', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
