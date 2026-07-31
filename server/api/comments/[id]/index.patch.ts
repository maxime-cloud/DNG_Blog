export default defineEventHandler(async (event) => {
  try {
    const session = await requireAuth(event)

    const id = Number(getRouterParam(event, 'id'))
    if (isNaN(id))
      throw createError({ statusCode: 400, statusMessage: 'ID invalide' })

    const comment = await prisma.comment.findUnique({ where: { id } })
    if (!comment)
      throw createError({
        statusCode: 404,
        statusMessage: 'Commentaire introuvable'
      })

    if (comment.userId !== session.user.id)
      throw createError({ statusCode: 403 })

    const ageMs = Date.now() - comment.createdAt.getTime()
    if (ageMs > 15 * 60 * 1000) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Le délai de modification est dépassé (15 min)'
      })
    }

    const body = await readBody(event)
    const parsed = commentSchema.pick({ content: true }).safeParse(body)
    if (!parsed.success) {
      throw createError({
        statusCode: 400,
        statusMessage: parsed.error.message
      })
    }

    // Regex-based sanitization allowing only: <b>, <i>, <em>, <strong>, <code>
    const sanitizedContent = parsed.data.content
      .replace(/<(?!\/?(b|i|em|strong|code)\b)[^>]+>/gi, '')

    const updated = await prisma.comment.update({
      where: { id },
      data: { content: sanitizedContent },
      select: {
        id: true,
        content: true,
        status: true,
        parentId: true,
        articleId: true,
        createdAt: true,
        updatedAt: true,
        user: { select: { id: true, name: true, image: true } }
      }
    })

    return updated
  } catch (error: any) {
    if (error.statusCode) throw error
    if (error.code === 'P2002') throw createError({ statusCode: 409 })
    console.error('[API] PATCH /api/comments/:id', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
