import { defineEventHandler, getRouterParam, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const session = await getAuthSession(event)
  if (!session) {
    return { favorited: false }
  }

  checkBanned(session)

  const articleIdParam = getRouterParam(event, 'articleId')
  const articleId = Number(articleIdParam)

  if (!articleIdParam || isNaN(articleId)) {
    throw createError({ statusCode: 400, statusMessage: 'articleId invalide' })
  }

  try {
    const favorite = await prisma.favorite.findFirst({
      where: {
        userId: session.user.id,
        articleId
      }
    })

    return { favorited: !!favorite }
  } catch (error: any) {
    console.error('[API] GET /api/users/me/favorites/:articleId', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
