import { defineEventHandler, createError, getRouterParam } from 'h3'

export default defineEventHandler(async event => {
  try {
    await requireRole(event, 'admin')

    const rawId = getRouterParam(event, 'id')
    if (!rawId) throw createError({ statusCode: 400, statusMessage: 'Missing id' })
    const id = parseInt(rawId, 10)

    const existing = await prisma.learningPath.findUnique({
      where: { id },
      select: { id: true }
    })
    if (!existing)
      throw createError({
        statusCode: 404,
        statusMessage: 'Learning path not found'
      })

    await prisma.$transaction([
      prisma.learningPathStep.deleteMany({ where: { pathId: id } }),
      prisma.learningPath.delete({ where: { id } })
    ])

    return { success: true }
  } catch (error: any) {
    if (error.statusCode) throw error
    if (error.code === 'P2025')
      throw createError({
        statusCode: 404,
        statusMessage: 'Learning path not found'
      })
    console.error('[API] DELETE /api/admin/learning-paths/[id]', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
