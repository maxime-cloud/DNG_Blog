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

    return user
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
