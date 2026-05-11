import { defineEventHandler, createError, getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const session = await requireAuth(event)

    const id = Number(getRouterParam(event, 'id'))
    if (isNaN(id))
      throw createError({ statusCode: 400, statusMessage: 'ID invalide' })

    const comment = await prisma.comment.findUnique({
      where: { id },
      select: { id: true }
    })
    if (!comment)
      throw createError({
        statusCode: 404,
        statusMessage: 'Commentaire introuvable'
      })

    await prisma.commentLike.deleteMany({
      where: { userId: session.user.id, commentId: id }
    })

    const updated = await prisma.comment.findUnique({
      where: { id },
      select: { _count: { select: { likes: true } } }
    })

    return { liked: false, count: updated!._count.likes }
  } catch (error: any) {
    if (error.statusCode) throw error
    if (error.code === 'P2002') throw createError({ statusCode: 409 })
    console.error('[API] DELETE /api/comments/:id/likes', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
