import { defineEventHandler, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        githubUrl: true,
        websiteUrl: true,
        role: true,
        banned: true,
        banReason: true,
        createdAt: true,
        updatedAt: true
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
    console.error('[API] GET /api/users/me', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
