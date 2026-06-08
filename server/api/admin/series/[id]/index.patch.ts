import { defineEventHandler, readBody, createError, getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    await requireRole(event, 'admin')

    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing id' })

    const numId = parseInt(id, 10)

    const body = await readBody(event)
    const { title, description, coverImageUrl, isPublished } = body

    const current = await prisma.series.findUnique({
      where: { id: numId },
      select: { id: true, title: true }
    })
    if (!current) throw createError({ statusCode: 404, statusMessage: 'Series not found' })

    let slug: string | undefined
    if (title !== undefined && title !== current.title) {
      slug = generateSlug(title.trim())
      const conflict = await prisma.series.findFirst({
        where: { slug, NOT: { id: numId } },
        select: { id: true }
      })
      if (conflict) {
        let suffix = 2
        while (true) {
          const candidate = `${slug}-${suffix}`
          const c2 = await prisma.series.findFirst({
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

    const series = await prisma.series.update({
      where: { id: numId },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(slug !== undefined && { slug }),
        ...(description !== undefined && { description }),
        ...(coverImageUrl !== undefined && { coverImageUrl }),
        ...(isPublished !== undefined && { isPublished })
      }
    })

    return series
  } catch (error: any) {
    if (error.statusCode) throw error
    if (error.code === 'P2025')
      throw createError({ statusCode: 404, statusMessage: 'Series not found' })
    console.error('[API] PATCH /api/admin/series/[id]', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
