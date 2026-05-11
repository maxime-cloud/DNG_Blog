import { defineEventHandler, createError, getRouterParam } from 'h3'

export default defineEventHandler(async event => {
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
      throw createError({ statusCode: 404, statusMessage: 'Parcours introuvable' })
    }

    await prisma.userPathProgress.deleteMany({
      where: { userId, pathId: path.id, stepId }
    })

    return { success: true }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[API] DELETE /api/learning-paths/:slug/progress/:stepId', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
