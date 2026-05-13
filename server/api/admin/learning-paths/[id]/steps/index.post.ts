import { defineEventHandler, readBody, createError, getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    await requireRole(event, 'admin')

    const rawPathId = getRouterParam(event, 'id')
    if (!rawPathId) throw createError({ statusCode: 400, statusMessage: 'Missing id' })
    const pathId = parseInt(rawPathId, 10)

    const body = await readBody(event)
    const { articleId, stepOrder } = body

    if (articleId === undefined || typeof articleId !== 'number') {
      throw createError({
        statusCode: 400,
        statusMessage: 'articleId is required and must be a number'
      })
    }
    if (stepOrder === undefined || typeof stepOrder !== 'number') {
      throw createError({
        statusCode: 400,
        statusMessage: 'stepOrder is required and must be a number'
      })
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

    const step = await prisma.learningPathStep.create({
      data: {
        pathId,
        articleId,
        stepOrder
      }
    })

    return step
  } catch (error: any) {
    if (error.statusCode) throw error
    if (error.code === 'P2003')
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid articleId'
      })
    console.error('[API] POST /api/admin/learning-paths/[id]/steps', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
