import { defineEventHandler, createError, getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const session = await requireAuth(event)
    checkBanned(session)

    const slug = getRouterParam(event, 'slug')
    if (!slug)
      throw createError({ statusCode: 400, statusMessage: 'Slug manquant' })

    const article = await prisma.article.findUnique({
      where: { slug },
      select: { id: true, _count: { select: { likes: true } } }
    })
    if (!article)
      throw createError({
        statusCode: 404,
        statusMessage: 'Article introuvable'
      })

    await prisma.articleLike.upsert({
      where: {
        userId_articleId: { userId: session.user.id, articleId: article.id }
      },
      create: { userId: session.user.id, articleId: article.id },
      update: {}
    })

    const updated = await prisma.article.findUnique({
      where: { id: article.id },
      select: { _count: { select: { likes: true } } }
    })

    return { liked: true, count: updated!._count.likes }
  } catch (error: any) {
    if (error.statusCode) throw error
    if (error.code === 'P2002') throw createError({ statusCode: 409 })
    console.error('[API] POST /api/articles/:slug/likes', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
