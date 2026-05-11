import { defineEventHandler, createError, readBody } from 'h3'
import z from 'zod'

const bulkSchema = z.object({
  ids: z.array(z.number().int()).min(1),
  action: z.enum(['approve', 'reject', 'spam', 'delete'])
})

export default defineEventHandler(async (event) => {
  try {
    await requireRole(event, 'admin')

    const body = await readBody(event)
    const parsed = bulkSchema.safeParse(body)
    if (!parsed.success) {
      throw createError({
        statusCode: 400,
        statusMessage: parsed.error.message
      })
    }

    const { ids, action } = parsed.data

    if (action === 'delete') {
      const { count } = await prisma.comment.deleteMany({
        where: { id: { in: ids } }
      })
      return { affected: count }
    }

    const statusMap = {
      approve: 'APPROVED',
      reject: 'REJECTED',
      spam: 'SPAM'
    } as const

    const { count } = await prisma.comment.updateMany({
      where: { id: { in: ids } },
      data: { status: statusMap[action] }
    })

    return { affected: count }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[API] POST /api/admin/comments/bulk', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
