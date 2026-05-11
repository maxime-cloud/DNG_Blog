import { defineEventHandler, createError, getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
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
      author: c.user,
      likeCount: c.likes.length,
      replies: c.replies.map(r => ({
        id: r.id,
        content: r.content,
        createdAt: r.createdAt,
        author: r.user,
        likeCount: r.likes.length
      }))
    }))
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[API] GET /api/articles/:slug/comments', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
