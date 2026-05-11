import { defineEventHandler, readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    await requireRole(event, 'admin')

    const body = await readBody(event)
    const { sourceTagId, targetTagId } = body

    if (!sourceTagId || !targetTagId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'sourceTagId and targetTagId are required'
      })
    }
    if (sourceTagId === targetTagId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'sourceTagId and targetTagId must be different'
      })
    }

    const [source, target] = await Promise.all([
      prisma.tag.findUnique({
        where: { id: sourceTagId },
        select: { id: true }
      }),
      prisma.tag.findUnique({
        where: { id: targetTagId },
        select: { id: true }
      })
    ])
    if (!source)
      throw createError({
        statusCode: 404,
        statusMessage: 'Source tag not found'
      })
    if (!target)
      throw createError({
        statusCode: 404,
        statusMessage: 'Target tag not found'
      })

    // Articles that already have targetTag to avoid duplicate join-table entries
    const articlesAlreadyTagged = await prisma.articleTag.findMany({
      where: { tagId: targetTagId },
      select: { articleId: true }
    })
    const alreadyTaggedIds = new Set(
      articlesAlreadyTagged.map(r => r.articleId)
    )

    await prisma.$transaction(async (tx) => {
      // Get all article-tag relations for the source tag
      const sourceRelations = await tx.articleTag.findMany({
        where: { tagId: sourceTagId },
        select: { articleId: true }
      })

      // Reassign only articles not already tagged with target
      const toReassign = sourceRelations
        .filter(r => !alreadyTaggedIds.has(r.articleId))
        .map(r => r.articleId)

      if (toReassign.length > 0) {
        await tx.articleTag.updateMany({
          where: { tagId: sourceTagId, articleId: { in: toReassign } },
          data: { tagId: targetTagId }
        })
      }

      // Delete remaining source relations (duplicates)
      await tx.articleTag.deleteMany({ where: { tagId: sourceTagId } })

      // Delete source tag
      await tx.tag.delete({ where: { id: sourceTagId } })
    })

    return { success: true, mergedInto: targetTagId }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[API] POST /api/admin/tags/merge', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
