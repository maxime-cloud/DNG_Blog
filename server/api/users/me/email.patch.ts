import { defineEventHandler, readBody, createError } from 'h3'
import { z } from 'zod'

const emailUpdateSchema = z.object({
  newEmail: z.string().email()
})

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  checkBanned(session)

  const body = await readBody(event)
  const result = emailUpdateSchema.safeParse(body)
  if (!result.success) {
    throw createError({ statusCode: 400, data: result.error.flatten() })
  }

  const { newEmail } = result.data

  try {
    const existing = await prisma.user.findUnique({
      where: { email: newEmail },
      select: { id: true }
    })

    if (existing) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Cet email est déjà utilisé'
      })
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        email: newEmail,
        emailVerified: false
      },
      select: {
        id: true,
        email: true,
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
    console.error('[API] PATCH /api/users/me/email', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
