import { defineEventHandler, readBody, createError, getRouterParam } from 'h3'
import z from 'zod'

const scheduleSchema = z.object({
  scheduledAt: z.string().datetime()
})

export default defineEventHandler(async (event) => {
  try {
    const session = await requireRole(event, 'author')

    const id = Number(getRouterParam(event, 'id'))
    if (isNaN(id))
      throw createError({ statusCode: 400, statusMessage: 'ID invalide' })

    const article = await prisma.article.findUnique({ where: { id } })
    if (!article)
      throw createError({
        statusCode: 404,
        statusMessage: 'Article introuvable'
      })

    const isOwner = article.authorId === session.user.id
    const isAdmin = session.user.role === 'admin'
    if (!isOwner && !isAdmin) throw createError({ statusCode: 403 })

    const body = await readBody(event)
    const parsed = scheduleSchema.safeParse(body)
    if (!parsed.success) {
      throw createError({
        statusCode: 400,
        statusMessage: parsed.error.message
      })
    }

    const scheduledAt = new Date(parsed.data.scheduledAt)
    if (scheduledAt.getTime() <= Date.now()) {
      throw createError({
        statusCode: 400,
        statusMessage: 'La date de planification doit être dans le futur'
      })
    }

    const updated = await prisma.article.update({
      where: { id },
      data: {
        scheduledAt,
        status: 'DRAFT'
      }
    })

    return updated
  } catch (error: any) {
    if (error.statusCode) throw error
    if (error.code === 'P2002') throw createError({ statusCode: 409 })
    console.error('[API] PATCH /api/articles/:id/schedule', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
