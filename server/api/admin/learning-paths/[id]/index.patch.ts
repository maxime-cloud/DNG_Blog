import { defineEventHandler, readBody, createError, getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    await requireRole(event, 'admin')

    const rawId = getRouterParam(event, 'id')
    if (!rawId) throw createError({ statusCode: 400, statusMessage: 'Missing id' })
    const id = parseInt(rawId, 10)

    const body = await readBody(event)
    const { title, description, difficulty, isPublished } = body

    if (
      difficulty !== undefined
      && !['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].includes(difficulty)
    ) {
      throw createError({
        statusCode: 400,
        statusMessage: 'difficulty must be BEGINNER, INTERMEDIATE, or ADVANCED'
      })
    }

    const current = await prisma.learningPath.findUnique({
      where: { id },
      select: { id: true, title: true }
    })
    if (!current)
      throw createError({
        statusCode: 404,
        statusMessage: 'Learning path not found'
      })

    let slug: string | undefined
    if (title !== undefined && title !== current.title) {
      slug = generateSlug(title.trim())
      const conflict = await prisma.learningPath.findFirst({
        where: { slug, NOT: { id } },
        select: { id: true }
      })
      if (conflict) {
        let suffix = 2
        while (true) {
          const candidate = `${slug}-${suffix}`
          const c2 = await prisma.learningPath.findFirst({
            where: { slug: candidate, NOT: { id } },
            select: { id: true }
          })
          if (!c2) {
            slug = candidate
            break
          }
          suffix++
        }
      }
    }

    const path = await prisma.learningPath.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(slug !== undefined && { slug }),
        ...(description !== undefined && { description }),
        ...(difficulty !== undefined && { difficulty }),
        ...(isPublished !== undefined && { isPublished })
      }
    })

    return path
  } catch (error: any) {
    if (error.statusCode) throw error
    if (error.code === 'P2025')
      throw createError({
        statusCode: 404,
        statusMessage: 'Learning path not found'
      })
    console.error('[API] PATCH /api/admin/learning-paths/[id]', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
