import { defineEventHandler, getRouterParam, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const username = getRouterParam(event, 'username')

  if (!username) {
    throw createError({ statusCode: 400, statusMessage: 'Paramètre manquant' })
  }

  try {
    const user = await prisma.user.findFirst({
      where: { name: username },
      select: {
        id: true,
        name: true,
        image: true,
        bio: true,
        githubUrl: true,
        websiteUrl: true,
        createdAt: true,
        role: true,
        _count: {
          select: {
            articles: {
              where: { status: 'PUBLISHED' }
            }
          }
        }
      }
    })

    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Utilisateur introuvable'
      })
    }

    // Stats publiques uniquement pour les créateurs de contenu (author/admin)
    const isCreator = user.role === 'author' || user.role === 'admin'

    if (!isCreator) {
      return { ...user, stats: null }
    }

    const publishedWhere = { authorId: user.id, status: 'PUBLISHED' as const }

    const [aggregates, lastArticle, popular] = await prisma.$transaction([
      // Totaux vues / likes sur l'ensemble des articles publiés
      prisma.article.aggregate({
        where: publishedWhere,
        _count: { _all: true }
      }),
      // Dernière publication
      prisma.article.findFirst({
        where: publishedWhere,
        orderBy: { publishedAt: 'desc' },
        select: { publishedAt: true }
      }),
      // Articles populaires (par vues)
      prisma.article.findMany({
        where: publishedWhere,
        take: 5,
        orderBy: { views: { _count: 'desc' } },
        select: {
          slug: true,
          title: true,
          coverImageUrl: true,
          publishedAt: true,
          _count: { select: { views: true, likes: true } }
        }
      })
    ])

    const [viewsTotal, likesTotal] = await prisma.$transaction([
      prisma.articleView.count({ where: { article: publishedWhere } }),
      prisma.articleLike.count({ where: { article: publishedWhere } })
    ])

    return {
      ...user,
      stats: {
        totalArticles: aggregates._count._all,
        totalViews: viewsTotal,
        totalLikes: likesTotal,
        lastPublishedAt: lastArticle?.publishedAt ?? null,
        popularArticles: popular.map(a => ({
          slug: a.slug,
          title: a.title,
          coverImage: a.coverImageUrl,
          publishedAt: a.publishedAt,
          viewsCount: a._count.views,
          likesCount: a._count.likes
        }))
      }
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    if (error.code === 'P2002')
      throw createError({
        statusCode: 409,
        statusMessage: 'Conflit de données'
      })
    console.error('[API] GET /api/users/:username', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
