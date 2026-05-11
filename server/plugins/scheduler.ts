import cron from 'node-cron'

export default defineNitroPlugin(() => {
  // Every minute: auto-publish scheduled articles
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date()
      const result = await prisma.article.updateMany({
        where: {
          status: 'DRAFT',
          scheduledAt: { lte: now }
        },
        data: {
          status: 'PUBLISHED',
          publishedAt: now,
          scheduledAt: null
        }
      })
      if (result.count > 0) {
        console.log(`[Scheduler] Auto-published ${result.count} article(s)`)
      }
    } catch (err) {
      console.error('[Scheduler] Auto-publish error:', err)
    }
  })

  // Every day at midnight: clean expired verification tokens
  cron.schedule('0 0 * * *', async () => {
    try {
      const result = await prisma.verification.deleteMany({
        where: {
          expiresAt: { lte: new Date() }
        }
      })
      console.log(
        `[Scheduler] Deleted ${result.count} expired verification token(s)`
      )
    } catch (err) {
      console.error('[Scheduler] Verification cleanup error:', err)
    }
  })

  // Every day at 2am: safety net check for daily view aggregation
  cron.schedule('0 2 * * *', () => {
    console.log(
      '[Scheduler] Daily views check — main tracking handled by analytics.ts'
    )
  })
})
