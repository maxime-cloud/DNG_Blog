import { defineEventHandler, readBody, createError, getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    await requireRole(event, 'admin')

    const rawId = getRouterParam(event, 'id')
    if (!rawId) throw createError({ statusCode: 400, statusMessage: 'Missing id' })
    const id = parseInt(rawId, 10)

    const body = await readBody(event)
    const { name, description, colorb, imageUrl } = body

    const current = await prisma.category.findUnique({
      where: { id },
      select: { id: true, name: true }
    })
    if (!current)
      throw createError({
        statusCode: 404,
        statusMessage: 'Category not found'
      })

    let slug: string | undefined
    if (name !== undefined && name !== current.name) {
      slug = generateSlug(name.trim())
      const existing = await prisma.category.findFirst({
        where: { slug, NOT: { id } },
        select: { id: true }
      })
      if (existing) {
        let suffix = 2
        while (true) {
          const candidate = `${slug}-${suffix}`
          const conflict = await prisma.category.findFirst({
            where: { slug: candidate, NOT: { id } },
            select: { id: true }
          })
          if (!conflict) {
            slug = candidate
            break
          }
          suffix++
        }
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(slug !== undefined && { slug }),
        ...(description !== undefined && { description }),
        ...(colorb !== undefined && { colorb }),
        ...(imageUrl !== undefined && { imageUrl })
      }
    })

    return category
  } catch (error: any) {
    if (error.statusCode) throw error
    if (error.code === 'P2025')
      throw createError({
        statusCode: 404,
        statusMessage: 'Category not found'
      })
    console.error('[API] PATCH /api/admin/categories/[id]', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
