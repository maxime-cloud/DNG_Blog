import { defineEventHandler, createError, getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const session = await getAuthSession(event)
    if (!session) throw createError({ statusCode: 401, statusMessage: 'Connectez-vous pour liker' })
    checkBanned(session)

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

    const existing = await prisma.commentLike.findUnique({
        where: { userId_commentId: { userId: session.user.id, commentId: id } }
      })
      if (!existing) {
        await prisma.commentLike.create({
          data: { 
            user: { connect: { id: session.user.id } },
            comment: { connect: { id } }
          }
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
