import { defineEventHandler, readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  checkBanned(session)

  const body = await readBody(event)
  const result = userUpdateSchema.safeParse(body)
  if (!result.success) {
    throw createError({ statusCode: 400, data: result.error.flatten() })
  }

  const { name, bio, image, githubUrl, websiteUrl } = result.data

  try {
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(name !== undefined && { name }),
        ...(bio !== undefined && { bio }),
        ...(image !== undefined && { image }),
        ...(githubUrl !== undefined && { githubUrl }),
        ...(websiteUrl !== undefined && { websiteUrl })
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        githubUrl: true,
        websiteUrl: true,
        role: true,
        updatedAt: true
      }
    })

    return user
  } catch (error: any) {
    if (error.statusCode) throw error
    if (error.code === 'P2002')
      throw createError({
        statusCode: 409,
        statusMessage: 'Conflit de données'
      })
    console.error('[API] PATCH /api/users/me', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
