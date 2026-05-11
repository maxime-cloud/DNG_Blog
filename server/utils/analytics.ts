import crypto from 'node:crypto'
import type { H3Event } from 'h3'

function sha256(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex')
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
