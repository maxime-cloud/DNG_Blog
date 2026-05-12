import { defineEventHandler, createError, readBody } from 'h3'
import z from 'zod'
import { auth } from '~/lib/auth'

const bodySchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8).optional(),
  role: z.enum(['reader', 'author', 'admin']).default('reader')
})

export default defineEventHandler(async event => {
  try {
    await requireRole(event, 'admin')

    const body = bodySchema.parse(await readBody(event))

    const result = await auth.api.createUser({
      headers: event.headers,
      body: { name: body.name, email: body.email, password: body.password }
    })

    if (body.role !== 'reader') {
      await prisma.user.update({
        where: { id: result.user.id },
        data: { role: body.role }
      })
    }

    const user = await prisma.user.findUnique({
      where: { id: result.user.id },
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    })

    return { data: user }
  } catch (error: any) {
    if (error.statusCode) throw error
    if (error.body?.code === 'USER_ALREADY_EXISTS') {
      throw createError({ statusCode: 409, statusMessage: 'Cet email est déjà utilisé' })
    }
    console.error('[API] POST /api/admin/users', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
