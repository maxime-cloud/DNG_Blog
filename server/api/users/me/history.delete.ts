import { defineEventHandler, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)

  try {
    await prisma.readingHistory.deleteMany({
      where: { userId: session.user.id }
    })

    return { success: true }
  } catch (error: any) {
    if (error.statusCode) throw error
    if (error.code === 'P2002')
      throw createError({
        statusCode: 409,
        statusMessage: 'Conflit de données'
      })
    console.error('[API] DELETE /api/users/me/history', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
