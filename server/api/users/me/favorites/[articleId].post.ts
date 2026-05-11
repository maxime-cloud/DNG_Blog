import { defineEventHandler, getRouterParam, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  checkBanned(session)

  const articleIdParam = getRouterParam(event, 'articleId')
  const articleId = Number(articleIdParam)

  if (!articleIdParam || isNaN(articleId)) {
    throw createError({ statusCode: 400, statusMessage: 'articleId invalide' })
  }

  try {
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      select: { id: true }
    })

    if (!article) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Article introuvable'
      })
    }

    await prisma.favorite.upsert({
      where: {
        userId_articleId: {
          userId: session.user.id,
          articleId
        }
      },
      create: {
        userId: session.user.id,
        articleId
      },
      update: {}
    })

    return { success: true }
  } catch (error: any) {
    if (error.statusCode) throw error
    if (error.code === 'P2002')
      throw createError({
        statusCode: 409,
        statusMessage: 'Conflit de données'
      })
    console.error('[API] POST /api/users/me/favorites/:articleId', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
