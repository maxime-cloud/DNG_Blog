import { defineEventHandler, createError, getRouterParam } from 'h3'

export default defineEventHandler(async event => {
  try {
    const slug = getRouterParam(event, 'slug')

    const article = await prisma.article.findUnique({
      where: { slug },
      include: {
        author: {
          select: { id: true, name: true, image: true }
        },
        categories: {
          select: {
            category: {
              select: { id: true, name: true, slug: true, color: true }
            }
          }
        },
        tags: {
          select: {
            tag: {
              select: { id: true, name: true, slug: true }
            }
          }
        },
        series: {
          select: {
            id: true,
            title: true,
            slug: true,
            articles: {
              where: { status: 'PUBLISHED' },
              select: { id: true, slug: true, title: true, seriesOrder: true },
              orderBy: { seriesOrder: 'asc' }
            }
          }
        },
        comments: {
          where: { parentId: null, status: 'APPROVED' },
          include: {
            user: {
              select: { id: true, name: true, image: true }
            },
            replies: {
              where: { status: 'APPROVED' },
              include: {
                user: {
                  select: { id: true, name: true, image: true }
                },
                likes: { select: { userId: true } }
              },
              orderBy: { createdAt: 'asc' }
            },
            likes: { select: { userId: true } }
          },
          orderBy: { createdAt: 'asc' }
        },
        _count: {
          select: { likes: true }
        }
      }
    })

    if (!article || article.status !== 'PUBLISHED') {
      throw createError({
        statusCode: 404,
        statusMessage: 'Article introuvable'
      })
    }

    return {
      id: article.id,
      slug: article.slug,
      title: article.title,
      description: article.excerpt,
      content: article.content,
      coverImage: article.coverImageUrl,
      publishedAt: article.publishedAt,
      author: article.author,
      category: article.categories[0]?.category ?? null,
      tags: article.tags.map(t => t.tag),
      series: article.series,
      seriesOrder: article.seriesOrder,
      likesCount: article._count.likes,
      comments: article.comments.map(c => ({
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
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[API] GET /api/articles/:slug', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
