import { defineEventHandler, createError, getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const session = await getAuthSession(event)
    if (session) checkBanned(session)

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

    if (session) {
      const existing = await prisma.articleLike.findFirst({
        where: { userId: session.user.id, articleId: article.id }
      })
      if (!existing) {
        await prisma.articleLike.create({
          data: { userId: session.user.id, articleId: article.id }
        })
      }
    } else {
      await prisma.articleLike.create({
        data: { articleId: article.id, userId: null }
      })
    }

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
