import { defineEventHandler, createError, getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const slug = getRouterParam(event, 'slug')

    const current = await prisma.article.findUnique({
      where: { slug },
      select: {
        id: true,
        categories: { select: { categoryId: true } },
        tags: { select: { tagId: true } }
      }
    })

    if (!current) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Article introuvable'
      })
    }

    const categoryIds = current.categories.map(c => c.categoryId)
    const tagIds = current.tags.map(t => t.tagId)

    const related = await prisma.article.findMany({
      where: {
        status: 'PUBLISHED',
        id: { not: current.id },
        OR: [
          ...(categoryIds.length
            ? [{ categories: { some: { categoryId: { in: categoryIds } } } }]
            : []),
          ...(tagIds.length
            ? [{ tags: { some: { tagId: { in: tagIds } } } }]
            : [])
        ]
      },
      take: 3,
      orderBy: { publishedAt: 'desc' },
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

    return related.map(a => ({
      id: a.id,
      slug: a.slug,
      title: a.title,
      description: a.excerpt,
      coverImage: a.coverImageUrl,
      publishedAt: a.publishedAt,
      author: a.author,
      category: a.categories[0]?.category ?? null,
      tags: a.tags.map(t => t.tag),
      likesCount: a._count.likes,
      _count: { comments: a._count.comments }
    }))
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[API] GET /api/articles/:slug/related', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
