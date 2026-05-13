import { defineEventHandler, createError, getRouterParam } from 'h3'
import { auth } from '~/lib/auth'

export default defineEventHandler(async (event) => {
  try {
    const session = await requireRole(event, 'admin')

    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, statusMessage: 'ID requis' })

    if (id === session.user.id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Impossible de supprimer son propre compte'
      })
    }

    const target = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true }
    })
    if (!target) throw createError({ statusCode: 404, statusMessage: 'Utilisateur introuvable' })

    if (target.role === 'admin') {
      const adminCount = await prisma.user.count({ where: { role: 'admin' } })
      if (adminCount <= 1) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Impossible de supprimer le dernier administrateur'
        })
      }
    }

    await auth.api.removeUser({
      headers: event.headers,
      body: { userId: id }
    })

    return { success: true }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[API] DELETE /api/admin/users/:id', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
