import { defineEventHandler, readBody, createError, getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const session = await requireAuth(event)

    const id = Number(getRouterParam(event, 'slug'))
    if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'ID invalide' })

    const article = await prisma.article.findUnique({ where: { id } })
    if (!article) throw createError({ statusCode: 404, statusMessage: 'Article introuvable' })

    const isOwner = article.authorId === session.user.id
    const isAdmin = session.user.role === 'admin'
    if (!isOwner && !isAdmin) throw createError({ statusCode: 403 })

    const body = await readBody(event)
    const parsed = articleSchema.partial().safeParse(body)
    if (!parsed.success) {
      throw createError({
        statusCode: 400,
        statusMessage: parsed.error.issues.map(i => i.message).join(', ')
      })
    }

    const {
      title,
      content,
      description,
      coverImage,
      categoryId,
      tags,
      seriesId,
      seriesOrder,
      status,
      scheduledAt,
      metaTitle,
      metaDescription
    } = parsed.data

    await prisma.$transaction(async (tx) => {
      // Update main article fields
      await tx.article.update({
        where: { id },
        data: {
          ...(title !== undefined && { title }),
          ...(content !== undefined && { content }),
          ...(description !== undefined && { excerpt: description }),
          ...(coverImage !== undefined && { coverImageUrl: coverImage || null }),
          ...(seriesId !== undefined && { seriesId: seriesId ?? null }),
          ...(seriesOrder !== undefined && { seriesOrder: seriesOrder ?? null }),
          ...(status !== undefined && { status }),
          ...(scheduledAt !== undefined && {
            scheduledAt: scheduledAt ? new Date(scheduledAt) : null
          }),
          ...(metaTitle !== undefined && { metaTitle: metaTitle || null }),
          ...(metaDescription !== undefined && { metaDescription: metaDescription || null })
        }
      })

      // Update category
      if (categoryId !== undefined) {
        await tx.articleCategory.deleteMany({ where: { articleId: id } })
        if (categoryId) {
          await tx.articleCategory.create({ data: { articleId: id, categoryId } })
        }
      }

      // Update tags
      if (tags !== undefined) {
        await tx.articleTag.deleteMany({ where: { articleId: id } })
        for (const name of tags) {
          const tag = await tx.tag.upsert({
            where: { name },
            update: {},
            create: { name, slug: generateSlug(name) }
          })
          await tx.articleTag.create({ data: { articleId: id, tagId: tag.id } })
        }
      }
    })

    const updated = await prisma.article.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, image: true } },
        categories: {
          select: { category: { select: { id: true, name: true, slug: true } } }
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
