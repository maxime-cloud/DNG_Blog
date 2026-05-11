import { defineEventHandler, createError, getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const session = await requireAuth(event)

    const slug = getRouterParam(event, 'slug')
    if (!slug)
      throw createError({ statusCode: 400, statusMessage: 'Slug manquant' })

    const article = await prisma.article.findUnique({
      where: { slug },
      select: { id: true }
    })
    if (!article)
      throw createError({
        statusCode: 404,
        statusMessage: 'Article introuvable'
      })

    await prisma.articleLike.deleteMany({
      where: { userId: session.user.id, articleId: article.id }
    })

    const updated = await prisma.article.findUnique({
      where: { id: article.id },
      select: { _count: { select: { likes: true } } }
    })

    return { liked: false, count: updated!._count.likes }
  } catch (error: any) {
    if (error.statusCode) throw error
    if (error.code === 'P2002') throw createError({ statusCode: 409 })
    console.error('[API] DELETE /api/articles/:slug/likes', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
