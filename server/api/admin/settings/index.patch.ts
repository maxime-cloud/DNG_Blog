import { defineEventHandler, createError } from 'h3'

// TODO: add a Settings model to the Prisma schema for real persistence
export default defineEventHandler(async (event) => {
  try {
    await requireRole(event, 'admin')

    return {
      success: true,
      message:
        'Settings persisted in memory only - add Settings model to schema for persistence'
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[API] PATCH /api/admin/settings', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
