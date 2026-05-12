import { defineEventHandler, createError, getRouterParam, readBody } from 'h3'
import z from 'zod'

const bodySchema = z.object({
  reason: z.string().optional()
})

export default defineEventHandler(async event => {
  try {
    const session = await requireRole(event, 'admin')

    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, statusMessage: 'ID requis' })

    if (id === session.user.id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Impossible de se bannir soi-même'
      })
    }

    const body = bodySchema.parse((await readBody(event)) ?? {})

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

    const [updated] = await prisma.$transaction([
      prisma.user.update({
        where: { id },
        data: {
          banned: true,
          banReason: body.reason ?? null
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
      }),
      prisma.session.deleteMany({ where: { userId: id } })
    ])

    return { data: updated }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[API] PATCH /api/admin/users/:id/ban', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
