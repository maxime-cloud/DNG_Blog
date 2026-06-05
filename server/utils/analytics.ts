import crypto from 'node:crypto'
import type { H3Event } from 'h3'

function sha256(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex')
}

/**
 * Buckets a list of dates into a continuous daily series (zero-filled) for the
 * last `days` days. Returns ascending `{ date: 'YYYY-MM-DD', count }` entries.
 */
export function bucketByDay(
  dates: Array<Date | string | null | undefined>,
  days: number
): Array<{ date: string, count: number }> {
  const buckets = new Map<string, number>()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Pre-fill every day with 0 so the chart has no gaps
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    buckets.set(d.toISOString().slice(0, 10), 0)
  }

  for (const raw of dates) {
    if (!raw) continue
    const key = new Date(raw).toISOString().slice(0, 10)
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1)
  }

  return Array.from(buckets.entries()).map(([date, count]) => ({ date, count }))
}

/** Percentage change between two values, rounded; 0 when previous is 0. */
export function percentChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100)
}

export async function trackArticleView(event: H3Event, articleId: string): Promise<void> {
  const userAgent = event.headers.get('user-agent') ?? ''

  const userAgentHash = sha256(userAgent)

  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000)

  const existing = await prisma.articleView.findFirst({
    where: {
      articleId: parseInt(articleId),
      userAgentHash,
      viewedAt: { gte: since24h }
    }
  })

  if (existing) {
    return
  }

  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)

  await prisma.$transaction([
    prisma.articleView.create({
      data: { articleId: parseInt(articleId), userAgentHash }
    }),
    prisma.articleViewDaily.upsert({
      where: { articleId_viewDate: { articleId: parseInt(articleId), viewDate: today } },
      update: { viewCount: { increment: 1 } },
      create: { articleId: parseInt(articleId), viewDate: today, viewCount: 1 }
    })
  ])
}
