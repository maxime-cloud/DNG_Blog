import { defineEventHandler, createError, getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    await requireRole(event, 'admin')

    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, statusMessage: 'ID requis' })

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, emailVerified: true }
    })
    if (!user) throw createError({ statusCode: 404, statusMessage: 'Utilisateur introuvable' })

    const updated = await prisma.user.update({
      where: { id },
      data: { emailVerified: true },
      select: { id: true, emailVerified: true }
    })

    return { data: updated }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[API] PATCH /api/admin/users/:id/verify-email', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
