import { defineEventHandler, createError, getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const session = await getAuthSession(event)
    if (session) checkBanned(session)

    const id = Number(getRouterParam(event, 'id'))
    if (isNaN(id))
      throw createError({ statusCode: 400, statusMessage: 'ID invalide' })

    const comment = await prisma.comment.findUnique({
      where: { id },
      select: { id: true, _count: { select: { likes: true } } }
    })
    if (!comment)
      throw createError({
        statusCode: 404,
        statusMessage: 'Commentaire introuvable'
      })

    if (session) {
      const existing = await prisma.commentLike.findFirst({
        where: { userId: session.user.id, commentId: id }
      })
      if (!existing) {
        await prisma.commentLike.create({
          data: { userId: session.user.id, commentId: id }
        })
      }
    } else {
      await prisma.commentLike.create({
        data: { commentId: id, userId: null }
      })
    }

    const updated = await prisma.comment.findUnique({
      where: { id },
      select: { _count: { select: { likes: true } } }
    })

    return { liked: true, count: updated!._count.likes }
  } catch (error: any) {
    if (error.statusCode) throw error
    if (error.code === 'P2002') throw createError({ statusCode: 409 })
    console.error('[API] POST /api/comments/:id/likes', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
