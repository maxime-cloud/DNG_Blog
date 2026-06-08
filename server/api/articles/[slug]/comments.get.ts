import { defineEventHandler, createError, getRouterParam } from 'h3'

export default defineEventHandler(async event => {
  try {
    const slug = getRouterParam(event, 'slug')

    const article = await prisma.article.findUnique({
      where: { slug },
      select: { id: true, status: true }
    })

    if (!article || article.status !== 'PUBLISHED') {
      throw createError({
        statusCode: 404,
        statusMessage: 'Article introuvable'
      })
    }

    const comments = await prisma.comment.findMany({
      where: {
        articleId: article.id,
        status: 'APPROVED',
        parentId: null
      },
      orderBy: { createdAt: 'asc' },
      include: {
        user: {
          select: { id: true, name: true, image: true }
        },
        likes: { select: { userId: true } },
        replies: {
          where: { status: 'APPROVED' },
          orderBy: { createdAt: 'asc' },
          include: {
            user: {
              select: { id: true, name: true, image: true }
            },
            likes: { select: { userId: true } }
          }
        }
      }
    })

    return comments.map(c => ({
      id: c.id,
      content: c.content,
      createdAt: c.createdAt,
      user: c.user,
      userId: c.user?.id,
      likes: c.likes.map(l => l.userId),
      status: c.status,
      replies: c.replies.map(r => ({
        id: r.id,
        content: r.content,
        createdAt: r.createdAt,
        user: r.user,
        userId: r.user?.id,
        likes: r.likes.map(l => l.userId),
        status: r.status
      }))
    }))
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[API] GET /api/articles/:slug/comments', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
