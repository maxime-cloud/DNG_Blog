import { defineEventHandler, readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    await requireRole(event, 'admin')

    const body = await readBody(event)
    const { name } = body

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw createError({ statusCode: 400, statusMessage: 'name is required' })
    }

    let slug = generateSlug(name.trim())

    const existing = await prisma.tag.findUnique({
      where: { slug },
      select: { id: true }
    })
    if (existing) {
      let suffix = 2
      while (true) {
        const candidate = `${slug}-${suffix}`
        const conflict = await prisma.tag.findUnique({
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

    const tag = await prisma.tag.create({
      data: { name: name.trim(), slug }
    })

    return tag
  } catch (error: any) {
    if (error.statusCode) throw error
    if (error.code === 'P2002')
      throw createError({
        statusCode: 409,
        statusMessage: 'Tag already exists'
      })
    console.error('[API] POST /api/admin/tags', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
