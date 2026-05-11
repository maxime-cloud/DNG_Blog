import { defineEventHandler, readBody, createError, getRouterParam } from 'h3'

export default defineEventHandler(async event => {
  try {
    await requireRole(event, 'admin')

    const rawPathId = getRouterParam(event, 'id')
    if (!rawPathId) throw createError({ statusCode: 400, statusMessage: 'Missing id' })
    const pathId = parseInt(rawPathId, 10)

    const body = await readBody(event)
    const { steps } = body

    if (!Array.isArray(steps) || steps.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'steps must be a non-empty array'
      })
    }
    for (const step of steps) {
      if (!step.id || typeof step.stepOrder !== 'number') {
        throw createError({
          statusCode: 400,
          statusMessage: 'Each step must have id and stepOrder'
        })
      }
    }

    const path = await prisma.learningPath.findUnique({
      where: { id: pathId },
      select: { id: true }
    })
    if (!path)
      throw createError({
        statusCode: 404,
        statusMessage: 'Learning path not found'
      })

    await Promise.all(
      steps.map((step: { id: number; stepOrder: number }) =>
        prisma.learningPathStep.update({
          where: { id: step.id },
          data: { stepOrder: step.stepOrder }
        })
      )
    )

    return { success: true }
  } catch (error: any) {
    if (error.statusCode) throw error
    if (error.code === 'P2025')
      throw createError({ statusCode: 404, statusMessage: 'Step not found' })
    console.error('[API] PATCH /api/admin/learning-paths/[id]/steps/reorder', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
