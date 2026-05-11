import { defineEventHandler, createError, getRouterParam, readBody } from 'h3'
import z from 'zod'

const bodySchema = z.object({
  role: z.enum(['reader', 'author', 'admin'])
})

export default defineEventHandler(async (event) => {
  try {
    const session = await requireRole(event, 'admin')

    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, statusMessage: 'ID requis' })

    const body = bodySchema.parse(await readBody(event))

    const target = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true }
    })

    if (!target) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Utilisateur introuvable'
      })
    }

    // Safety check: ensure at least one admin remains when demoting an admin
    if (target.role === 'admin' && body.role !== 'admin') {
      const adminCount = await prisma.user.count({ where: { role: 'admin' } })
      if (adminCount <= 1) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Impossible de rétrograder le dernier administrateur'
        })
      }
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role: body.role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        updatedAt: true
      }
    })

    return { data: updated }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[API] PATCH /api/admin/users/:id/role', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
