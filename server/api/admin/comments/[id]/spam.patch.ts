import { defineEventHandler, createError, getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    await requireRole(event, 'admin')

    const idParam = getRouterParam(event, 'id')
    const id = Number(idParam)
    if (!id) {
      throw createError({ statusCode: 400, statusMessage: 'ID invalide' })
    }

    const exists = await prisma.comment.findUnique({
      where: { id },
      select: { id: true }
    })

    if (!exists) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Commentaire introuvable'
      })
    }

    const updated = await prisma.comment.update({
      where: { id },
      data: { status: 'SPAM' }
    })

    return updated
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[API] PATCH /api/admin/comments/:id/spam', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
