import { defineEventHandler, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)

  try {
    // Fetch all learning paths the user has any progress on
    const progressRecords = await prisma.userPathProgress.findMany({
      where: { userId: session.user.id },
      select: {
        pathId: true,
        stepId: true,
        completedAt: true,
        path: {
          select: {
            id: true,
            title: true,
            slug: true,
            _count: {
              select: { steps: true }
            }
          }
        }
      }
    })

    // Group progress by path
    const pathMap = new Map<
      number,
      {
        id: number
        title: string
        slug: string
        totalSteps: number
        completedSteps: number
        lastActivityAt: Date | null
      }
    >()

    for (const record of progressRecords) {
      const existing = pathMap.get(record.pathId)
      if (existing) {
        existing.completedSteps += 1
        if (
          record.completedAt
          && (!existing.lastActivityAt
            || record.completedAt > existing.lastActivityAt)
        ) {
          existing.lastActivityAt = record.completedAt
        }
      } else {
        pathMap.set(record.pathId, {
          id: record.path.id,
          title: record.path.title,
          slug: record.path.slug,
          totalSteps: record.path._count.steps,
          completedSteps: 1,
          lastActivityAt: record.completedAt ?? null
        })
      }
    }

    const paths = Array.from(pathMap.values()).map(p => ({
      ...p,
      progressPercent:
        p.totalSteps > 0
          ? Math.round((p.completedSteps / p.totalSteps) * 100)
          : 0
    }))

    return { data: paths }
  } catch (error: any) {
    if (error.statusCode) throw error
    if (error.code === 'P2002')
      throw createError({
        statusCode: 409,
        statusMessage: 'Conflit de données'
      })
    console.error('[API] GET /api/users/me/progress', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
