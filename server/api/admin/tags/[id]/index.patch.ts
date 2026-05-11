import { defineEventHandler, readBody, createError, getRouterParam } from 'h3'

export default defineEventHandler(async event => {
  try {
    await requireRole(event, 'admin')

    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing id' })

    const numId = parseInt(id, 10)

    const body = await readBody(event)
    const { name } = body

    const current = await prisma.tag.findUnique({
      where: { id: numId },
      select: { id: true, name: true }
    })
    if (!current) throw createError({ statusCode: 404, statusMessage: 'Tag not found' })

    let slug: string | undefined
    if (name !== undefined && name !== current.name) {
      slug = generateSlug(name.trim())
      const conflict = await prisma.tag.findFirst({
        where: { slug, NOT: { id: numId } },
        select: { id: true }
      })
      if (conflict) {
        let suffix = 2
        while (true) {
          const candidate = `${slug}-${suffix}`
          const c2 = await prisma.tag.findFirst({
            where: { slug: candidate, NOT: { id: numId } },
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

    const tag = await prisma.tag.update({
      where: { id: numId },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(slug !== undefined && { slug })
      }
    })

    return tag
  } catch (error: any) {
    if (error.statusCode) throw error
    if (error.code === 'P2025')
      throw createError({ statusCode: 404, statusMessage: 'Tag not found' })
    console.error('[API] PATCH /api/admin/tags/[id]', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
