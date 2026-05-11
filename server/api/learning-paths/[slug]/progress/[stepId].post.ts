import { defineEventHandler, createError, getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const session = await requireAuth(event)
    const userId = session.user.id

    const slug = getRouterParam(event, 'slug')
    const stepIdParam = getRouterParam(event, 'stepId')
    const stepId = parseInt(stepIdParam ?? '', 10)

    if (isNaN(stepId)) {
      throw createError({ statusCode: 400, statusMessage: 'stepId invalide' })
    }

    const path = await prisma.learningPath.findFirst({
      where: { slug, isPublished: true },
      select: { id: true }
    })

    if (!path) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Parcours introuvable'
      })
    }

    const step = await prisma.learningPathStep.findFirst({
      where: { id: stepId, pathId: path.id },
      select: { id: true }
    })

    if (!step) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Étape introuvable'
      })
    }

    await prisma.userPathProgress.upsert({
      where: {
        userId_pathId_stepId: {
          userId,
          pathId: path.id,
          stepId: step.id
        }
      },
      create: {
        userId,
        pathId: path.id,
        stepId: step.id,
        completedAt: new Date()
      },
      update: {
        completedAt: new Date()
      }
    })

    return { success: true }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error(
      '[API] POST /api/learning-paths/:slug/progress/:stepId',
      error
    )
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
