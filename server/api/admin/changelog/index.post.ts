import { defineEventHandler, readBody, createError } from 'h3'

const CHANGELOG_TYPES = ['FEATURE', 'FIX', 'CONTENT', 'DESIGN', 'PERF', 'SECURITY'] as const

export default defineEventHandler(async event => {
  try {
    await requireRole(event, 'admin')

    const body = await readBody(event)
    const { title, description, type, publishedAt } = body

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'title is required'
      })
    }
    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'description is required'
      })
    }
    if (!type || !CHANGELOG_TYPES.includes(type)) {
      throw createError({
        statusCode: 400,
        statusMessage: `type must be one of: ${CHANGELOG_TYPES.join(', ')}`
      })
    }

    const entry = await prisma.changelogEntry.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        type,
        publishedAt: publishedAt ? new Date(publishedAt) : new Date()
      }
    })

    return entry
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[API] POST /api/admin/changelog', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
