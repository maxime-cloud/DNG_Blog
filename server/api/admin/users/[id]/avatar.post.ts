import { defineEventHandler, createError, getRouterParam, readMultipartFormData } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    await requireRole(event, 'admin')

    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, statusMessage: 'ID requis' })

    const user = await prisma.user.findUnique({ where: { id }, select: { id: true } })
    if (!user) throw createError({ statusCode: 404, statusMessage: 'Utilisateur introuvable' })

    const parts = await readMultipartFormData(event)
    if (!parts || parts.length === 0) {
      throw createError({ statusCode: 400, statusMessage: 'Aucun fichier' })
    }

    const filePart = parts.find(p => p.name === 'file')
    if (!filePart?.data) {
      throw createError({ statusCode: 400, statusMessage: 'Champ file manquant' })
    }

    const mimeType = filePart.type ?? 'application/octet-stream'
    if (!mimeType.startsWith('image/')) {
      throw createError({ statusCode: 400, statusMessage: 'Seules les images sont acceptées' })
    }

    const { secure_url } = await uploadAvatar(filePart.data, id)

    await prisma.user.update({
      where: { id },
      data: { image: secure_url }
    })

    return { image: secure_url }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[API] POST /api/admin/users/:id/avatar', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
