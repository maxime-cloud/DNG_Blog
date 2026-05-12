import { defineEventHandler, createError, getRouterParam, readBody } from 'h3'
import z from 'zod'

const bodySchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  bio: z.string().optional(),
  githubUrl: z.string().url().or(z.literal('')).optional(),
  websiteUrl: z.string().url().or(z.literal('')).optional()
})

export default defineEventHandler(async event => {
  try {
    await requireRole(event, 'admin')

    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, statusMessage: 'ID requis' })

    const body = bodySchema.parse(await readBody(event))

    const user = await prisma.user.findUnique({ where: { id }, select: { id: true } })
    if (!user) throw createError({ statusCode: 404, statusMessage: 'Utilisateur introuvable' })

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.email !== undefined && { email: body.email, emailVerified: false }),
        ...(body.bio !== undefined && { bio: body.bio }),
        ...(body.githubUrl !== undefined && { githubUrl: body.githubUrl || null }),
        ...(body.websiteUrl !== undefined && { websiteUrl: body.websiteUrl || null })
      },
      select: {
        id: true,
        email: true,
        name: true,
        bio: true,
        githubUrl: true,
        websiteUrl: true,
        emailVerified: true,
        updatedAt: true
      }
    })

    return { data: updated }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[API] PATCH /api/admin/users/:id/profile', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
