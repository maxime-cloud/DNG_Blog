import { defineEventHandler, createError, getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    await requireRole(event, 'admin')

    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, statusMessage: 'ID requis' })

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        banned: true,
        banReason: true,
        banExpires: true,
        emailVerified: true,
        bio: true,
        githubUrl: true,
        websiteUrl: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            articles: true,
            comments: true
          }
        },
        articles: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            slug: true,
            status: true,
            publishedAt: true,
            createdAt: true
          }
        },
        comments: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            content: true,
            status: true,
            createdAt: true,
            article: {
              select: { id: true, title: true, slug: true }
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

    return { data: user }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[API] GET /api/admin/users/:id', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
