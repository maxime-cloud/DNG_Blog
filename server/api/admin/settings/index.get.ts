import { defineEventHandler, createError } from 'h3'

// TODO: migrate to a Settings model in the Prisma schema for persistence
const DEFAULT_SETTINGS = {
  siteName: 'DNGBlog',
  articlesPerPage: 12,
  notificationEmail: ''
}

export default defineEventHandler(async (event) => {
  try {
    await requireRole(event, 'admin')

    return DEFAULT_SETTINGS
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[API] GET /api/admin/settings', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
