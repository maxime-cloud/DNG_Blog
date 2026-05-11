import { defineEventHandler, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Anonymize user's comments
      await tx.comment.updateMany({
        where: { userId: session.user.id },
        data: {
          content: '[Commentaire supprimé]',
          userId: null
        }
      })

      // 2. Delete favorites
      await tx.favorite.deleteMany({
        where: { userId: session.user.id }
      })

      // 3. Delete reading history
      await tx.readingHistory.deleteMany({
        where: { userId: session.user.id }
      })

      // 4. Delete article likes
      await tx.articleLike.deleteMany({
        where: { userId: session.user.id }
      })

      // 5. Delete comment likes
      await tx.commentLike.deleteMany({
        where: { userId: session.user.id }
      })

      // 6. Delete the user account
      await tx.user.delete({
        where: { id: session.user.id }
      })
    })

    return { success: true }
  } catch (error: any) {
    if (error.statusCode) throw error
    if (error.code === 'P2002')
      throw createError({
        statusCode: 409,
        statusMessage: 'Conflit de données'
      })
    console.error('[API] DELETE /api/users/me', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
