import { defineEventHandler, createError } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const article = await prisma.article.findFirst({
      where: { status: 'PUBLISHED' },
      orderBy: [{ views: { _count: 'desc' } }, { publishedAt: 'desc' }],
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        coverImageUrl: true,
        publishedAt: true,
        author: {
          select: { name: true, image: true }
        },
        categories: {
          select: {
            category: {
              select: { name: true, slug: true, color: true }
            }
          }
        },
        tags: {
          select: {
            tag: {
              select: { name: true, slug: true }
            }
          }
        },
        _count: {
          select: { likes: true, comments: true }
        }
      }
    })

    if (!article) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Aucun article trouvé'
      })
    }

    return {
      id: article.id,
      slug: article.slug,
      title: article.title,
      description: article.excerpt,
      coverImage: article.coverImageUrl,
      publishedAt: article.publishedAt,
      author: article.author,
      category: article.categories[0]?.category ?? null,
      tags: article.tags.map(t => t.tag),
      likesCount: article._count.likes,
      _count: { comments: article._count.comments }
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[API] GET /api/articles/featured', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
