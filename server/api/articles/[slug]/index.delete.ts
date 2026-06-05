import { defineEventHandler, createError, getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const session = await requireAuth(event)

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

    await prisma.article.delete({ where: { id } })

    return { success: true }
  } catch (error: any) {
    if (error.statusCode) throw error
    if (error.code === 'P2002') throw createError({ statusCode: 409 })
    console.error('[API] DELETE /api/articles/:id', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
