import { defineEventHandler, readBody, createError, getRouterParam } from 'h3'
import sanitizeHtml from 'sanitize-html'

export default defineEventHandler(async (event) => {
  try {
    const session = await requireAuth(event)
    checkBanned(session)
    rateLimit(event, { max: 10, windowMs: 60000 })

    const slug = getRouterParam(event, 'slug')
    if (!slug)
      throw createError({ statusCode: 400, statusMessage: 'Slug manquant' })

    const body = await readBody(event)
    const parsed = commentSchema.safeParse(body)
    if (!parsed.success) {
      throw createError({
        statusCode: 400,
        statusMessage: parsed.error.message
      })
    }

    const article = await prisma.article.findUnique({
      where: { slug },
      select: { id: true }
    })
    if (!article)
      throw createError({
        statusCode: 404,
        statusMessage: 'Article introuvable'
      })

    const sanitizedContent = sanitizeHtml(parsed.data.content, {
      allowedTags: ['b', 'i', 'em', 'strong', 'code'],
      allowedAttributes: {}
    })

    const comment = await prisma.comment.create({
      data: {
        content: sanitizedContent,
        status: 'PENDING',
        articleId: article.id,
        userId: session.user.id,
        ...(parsed.data.parentId && { parentId: Number(parsed.data.parentId) })
      },
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

    return comment
  } catch (error: any) {
    if (error.statusCode) throw error
    if (error.code === 'P2002') throw createError({ statusCode: 409 })
    console.error('[API] POST /api/articles/:slug/comments', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
