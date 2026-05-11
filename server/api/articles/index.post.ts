import { defineEventHandler, readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const session = await requireRole(event, 'author')
    checkBanned(session)

    const body = await readBody(event)
    const parsed = articleSchema.safeParse(body)
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
      categoryId,
      tags,
      coverImage,
      seriesId,
      seriesOrder
    } = parsed.data

    // Generate unique slug
    let slug = generateSlug(title)
    const existing = await prisma.article.findUnique({
      where: { slug },
      select: { id: true }
    })
    if (existing) {
      let suffix = 2
      while (true) {
        const candidate = `${slug}-${suffix}`
        const conflict = await prisma.article.findUnique({
          where: { slug: candidate },
          select: { id: true }
        })
        if (!conflict) {
          slug = candidate
          break
        }
        suffix++
      }
    }

    const article = await prisma.article.create({
      data: {
        title,
        slug,
        content,
        excerpt: description,
        coverImageUrl: coverImage,
        status: 'DRAFT',
        authorId: session.user.id,
        ...(seriesId && { seriesId: Number(seriesId) }),
        ...(seriesOrder !== undefined && { seriesOrder }),
        ...(categoryId && {
          categories: {
            create: [{ categoryId: Number(categoryId) }]
          }
        }),
        ...(tags
          && tags.length > 0 && {
          tags: {
            create: tags.map((name: string) => ({
              tag: {
                connectOrCreate: {
                  where: { name },
                  create: { name, slug: generateSlug(name) }
                }
              }
            }))
          }
        })
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

    return article
  } catch (error: any) {
    if (error.statusCode) throw error
    if (error.code === 'P2002') throw createError({ statusCode: 409 })
    console.error('[API] POST /api/articles', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
