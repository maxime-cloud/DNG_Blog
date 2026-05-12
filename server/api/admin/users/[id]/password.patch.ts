import { defineEventHandler, createError, getRouterParam, readBody } from 'h3'
import z from 'zod'
import { auth } from '~/lib/auth'

const bodySchema = z.object({
  newPassword: z.string().min(8)
})

export default defineEventHandler(async event => {
  try {
    await requireRole(event, 'admin')

    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, statusMessage: 'ID requis' })

    const { newPassword } = bodySchema.parse(await readBody(event))

    const user = await prisma.user.findUnique({ where: { id }, select: { id: true } })
    if (!user) throw createError({ statusCode: 404, statusMessage: 'Utilisateur introuvable' })

    await auth.api.setUserPassword({
      headers: event.headers,
      body: { newPassword, userId: id }
    })

    await prisma.session.deleteMany({ where: { userId: id } })

    return { success: true }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[API] PATCH /api/admin/users/:id/password', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
