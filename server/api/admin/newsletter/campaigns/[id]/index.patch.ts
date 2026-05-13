import { defineEventHandler, readBody, createError, getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    await requireRole(event, 'admin')

    const rawId = getRouterParam(event, 'id')
    const id = parseInt(rawId ?? '', 10)
    if (isNaN(id)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid id' })
    }

    const existing = await prisma.newsletterCampaign.findUnique({
      where: { id },
      select: { id: true, status: true }
    })
    if (!existing) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Campaign not found'
      })
    }
    if (existing.status !== 'DRAFT' && existing.status !== 'SCHEDULED') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Only DRAFT or SCHEDULED campaigns can be updated'
      })
    }

    const body = await readBody(event)
    const { subject, bodyHtml } = body

    const campaign = await prisma.newsletterCampaign.update({
      where: { id },
      data: {
        ...(subject !== undefined && { subject: subject.trim() }),
        ...(bodyHtml !== undefined && { bodyHtml: bodyHtml.trim() })
      }
    })

    return campaign
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[API] PATCH /api/admin/newsletter/campaigns/[id]', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
