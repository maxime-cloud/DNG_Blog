import { defineEventHandler, readBody, createError, getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const session = await requireAuth(event)

    const id = Number(getRouterParam(event, 'id'))
    if (isNaN(id))
      throw createError({ statusCode: 400, statusMessage: 'ID invalide' })

    const article = await prisma.article.findUnique({ where: { id } })
    if (!article)
      throw createError({
        statusCode: 404,
        statusMessage: 'Article introuvable'
      })

    const isOwner = article.authorId === session.user.id
    const isAdmin = session.user.role === 'admin'
    if (!isOwner && !isAdmin) throw createError({ statusCode: 403 })

    const body = await readBody(event)
    const parsed = articleSchema.partial().safeParse(body)
    if (!parsed.success) {
      throw createError({
        statusCode: 400,
        statusMessage: parsed.error.message
      })
    }

    const {
      title,
      content,
      description,
      coverImage,
      seriesId,
      seriesOrder,
      status,
      scheduledAt
    } = parsed.data

    const updated = await prisma.article.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(description !== undefined && { excerpt: description }),
        ...(coverImage !== undefined && { coverImageUrl: coverImage }),
        ...(seriesId !== undefined && { seriesId: Number(seriesId) }),
        ...(seriesOrder !== undefined && { seriesOrder }),
        ...(status !== undefined && { status }),
        ...(scheduledAt !== undefined && { scheduledAt })
      },
      include: {
        author: { select: { id: true, name: true, image: true } },
        categories: {
          select: {
            category: { select: { id: true, name: true, slug: true } }
          }
        },
        tags: {
          select: { tag: { select: { id: true, name: true, slug: true } } }
        }
      }
    })

    return updated
  } catch (error: any) {
    if (error.statusCode) throw error
    if (error.code === 'P2002') throw createError({ statusCode: 409 })
    console.error('[API] PATCH /api/articles/:id', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
