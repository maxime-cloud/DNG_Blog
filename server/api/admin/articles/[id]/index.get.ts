import { defineEventHandler, createError, getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const session = await requireRole(event, 'author')

    const id = Number(getRouterParam(event, 'id'))
    if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'ID invalide' })

    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        categories: { select: { category: { select: { id: true, name: true, slug: true } } } },
        tags: { select: { tag: { select: { id: true, name: true, slug: true } } } },
        series: { select: { id: true, title: true, slug: true } }
      }
    })

    if (!article) throw createError({ statusCode: 404, statusMessage: 'Article introuvable' })

    const isOwner = article.authorId === session.user.id
    const isAdmin = session.user.role === 'admin'
    if (!isOwner && !isAdmin) throw createError({ statusCode: 403 })

    return {
      ...article,
      category: article.categories[0]?.category ?? null,
      tags: article.tags.map(t => t.tag.name)
    }
  } catch (error) {
    if ((error as { statusCode?: number }).statusCode) throw error
    console.error('[API] GET /api/admin/articles/:id', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
