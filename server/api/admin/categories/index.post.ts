import { defineEventHandler, readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    await requireRole(event, 'admin')

    const body = await readBody(event)
    const { name, description, colorb, imageUrl } = body

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw createError({ statusCode: 400, statusMessage: 'name is required' })
    }

    let slug = generateSlug(name.trim())

    const existing = await prisma.category.findUnique({
      where: { slug },
      select: { id: true }
    })
    if (existing) {
      let suffix = 2
      while (true) {
        const candidate = `${slug}-${suffix}`
        const conflict = await prisma.category.findUnique({
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

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        slug,
        ...(description !== undefined && { description }),
        ...(colorb !== undefined && { colorb }),
        ...(imageUrl !== undefined && { imageUrl })
      }
    })

    return category
  } catch (error: any) {
    if (error.statusCode) throw error
    if (error.code === 'P2002')
      throw createError({
        statusCode: 409,
        statusMessage: 'Slug already exists'
      })
    console.error('[API] POST /api/admin/categories', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
