import { defineEventHandler, readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    await requireRole(event, 'admin')

    const body = await readBody(event)
    const { title, description, difficulty } = body

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'title is required'
      })
    }
    if (
      !difficulty
      || !['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].includes(difficulty)
    ) {
      throw createError({
        statusCode: 400,
        statusMessage: 'difficulty must be BEGINNER, INTERMEDIATE, or ADVANCED'
      })
    }

    let slug = generateSlug(title.trim())
    const existing = await prisma.learningPath.findUnique({
      where: { slug },
      select: { id: true }
    })
    if (existing) {
      let suffix = 2
      while (true) {
        const candidate = `${slug}-${suffix}`
        const conflict = await prisma.learningPath.findUnique({
          where: { slug: candidate },
          select: { id: true }
        })
        if (!conflict) {
          slug = candidate
          break
        }
        suffix++
      }
    }

    const path = await prisma.learningPath.create({
      data: {
        title: title.trim(),
        slug,
        difficulty,
        isPublished: false,
        ...(description !== undefined && { description })
      }
    })

    return path
  } catch (error: any) {
    if (error.statusCode) throw error
    if (error.code === 'P2002')
      throw createError({
        statusCode: 409,
        statusMessage: 'Slug already exists'
      })
    console.error('[API] POST /api/admin/learning-paths', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
