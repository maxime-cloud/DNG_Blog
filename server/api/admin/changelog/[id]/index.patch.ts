import { defineEventHandler, readBody, createError, getRouterParam } from 'h3'

const CHANGELOG_TYPES = ['FEATURE', 'FIX', 'CONTENT', 'DESIGN', 'PERF', 'SECURITY'] as const

export default defineEventHandler(async (event) => {
  try {
    await requireRole(event, 'admin')

    const rawId = getRouterParam(event, 'id')
    if (!rawId) throw createError({ statusCode: 400, statusMessage: 'Missing id' })
    const id = parseInt(rawId, 10)

    const body = await readBody(event)
    const { title, description, type, publishedAt } = body

    if (type !== undefined && !CHANGELOG_TYPES.includes(type)) {
      throw createError({
        statusCode: 400,
        statusMessage: `type must be one of: ${CHANGELOG_TYPES.join(', ')}`
      })
    }

    const existing = await prisma.changelogEntry.findUnique({
      where: { id },
      select: { id: true }
    })
    if (!existing)
      throw createError({
        statusCode: 404,
        statusMessage: 'Changelog entry not found'
      })

    const entry = await prisma.changelogEntry.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description: description.trim() }),
        ...(type !== undefined && { type }),
        ...(publishedAt !== undefined && {
          publishedAt: new Date(publishedAt)
        })
      }
    })

    return entry
  } catch (error: any) {
    if (error.statusCode) throw error
    if (error.code === 'P2025')
      throw createError({
        statusCode: 404,
        statusMessage: 'Changelog entry not found'
      })
    console.error('[API] PATCH /api/admin/changelog/[id]', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
