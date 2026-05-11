import { defineEventHandler, createError, getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    await requireRole(event, 'admin')

    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, statusMessage: 'ID requis' })

    const target = await prisma.user.findUnique({
      where: { id },
      select: { id: true }
    })

    if (!target) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Utilisateur introuvable'
      })
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        banned: false,
        banReason: null
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        banned: true,
        banReason: true,
        updatedAt: true
      }
    })

    return { data: updated }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[API] PATCH /api/admin/users/:id/unban', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
