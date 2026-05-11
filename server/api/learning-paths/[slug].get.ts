import { defineEventHandler, createError, getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const slug = getRouterParam(event, 'slug')
    const session = await getAuthSession(event)
    const userId = session?.user.id ?? null

    const path = await prisma.learningPath.findFirst({
      where: { slug, isPublished: true },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        difficulty: true,
        coverImageUrl: true,
        createdAt: true,
        steps: {
          orderBy: { stepOrder: 'asc' },
          select: {
            id: true,
            stepOrder: true,
            stepTitle: true,
            article: {
              select: { slug: true, title: true }
            }
          }
        },
        ...(userId && {
          userProgress: {
            where: { userId },
            select: { stepId: true, completedAt: true }
          }
        })
      }
    })

    if (!path) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Parcours introuvable'
      })
    }

    const { userProgress, steps, ...rest } = path as any
    const completedStepIds: Set<number> = new Set(
      userId ? (userProgress ?? []).map((p: any) => p.stepId) : []
    )

    const stepsWithProgress = steps.map((step: any) => ({
      ...step,
      completed: userId ? completedStepIds.has(step.id) : null
    }))

    return {
      data: {
        ...rest,
        steps: stepsWithProgress,
        userProgress: userId
          ? { completedSteps: completedStepIds.size, totalSteps: steps.length }
          : null
      }
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[API] GET /api/learning-paths/:slug', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
