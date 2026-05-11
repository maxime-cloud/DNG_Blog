import { defineEventHandler, createError, getRouterParam } from 'h3'

export default defineEventHandler(async event => {
  try {
    await requireRole(event, 'admin')

    const rawPathId = getRouterParam(event, 'id')
    const rawStepId = getRouterParam(event, 'stepId')
    if (!rawPathId) throw createError({ statusCode: 400, statusMessage: 'Missing id' })
    if (!rawStepId) throw createError({ statusCode: 400, statusMessage: 'Missing stepId' })
    const pathId = parseInt(rawPathId, 10)
    const stepId = parseInt(rawStepId, 10)

    const step = await prisma.learningPathStep.findFirst({
      where: { id: stepId, pathId },
      select: { id: true }
    })
    if (!step) throw createError({ statusCode: 404, statusMessage: 'Step not found' })

    await prisma.learningPathStep.delete({ where: { id: stepId } })

    return { success: true }
  } catch (error: any) {
    if (error.statusCode) throw error
    if (error.code === 'P2025')
      throw createError({ statusCode: 404, statusMessage: 'Step not found' })
    console.error('[API] DELETE /api/admin/learning-paths/[id]/steps/[stepId]', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
