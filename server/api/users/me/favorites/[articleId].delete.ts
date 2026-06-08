import { defineEventHandler, getRouterParam, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const session = await getAuthSession(event)

  const articleIdParam = getRouterParam(event, 'articleId')
  const articleId = Number(articleIdParam)

  if (!articleIdParam || isNaN(articleId)) {
    throw createError({ statusCode: 400, statusMessage: 'articleId invalide' })
  }

  try {
    if (session) {
      await prisma.favorite.deleteMany({
        where: {
          userId: session.user.id,
          articleId
        }
      })
    } else {
      const anonymousFavorite = await prisma.favorite.findFirst({
        where: { articleId, userId: null }
      })
      if (anonymousFavorite) {
        await prisma.favorite.delete({
          where: { id: anonymousFavorite.id }
        })
      }
    }

    return { success: true }
  } catch (error: any) {
    if (error.statusCode) throw error
    if (error.code === 'P2025')
      throw createError({
        statusCode: 404,
        statusMessage: 'Favori introuvable'
      })
    if (error.code === 'P2002')
      throw createError({
        statusCode: 409,
        statusMessage: 'Conflit de données'
      })
    console.error('[API] DELETE /api/users/me/favorites/:articleId', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
