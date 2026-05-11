interface ArticleMetadata {
  slug: string
  title: string
  description?: string
  categorySlug?: string
  tags?: string[]
  publishedAt?: string
  readingTime?: number
  authorId: string
}

export async function syncArticleMetadata(
  data: ArticleMetadata
): Promise<void> {
  const {
    slug,
    title,
    description,
    categorySlug,
    tags,
    publishedAt,
    readingTime,
    authorId
  } = data

  // Find category if provided
  let categoryId: number | undefined
  if (categorySlug) {
    const category = await prisma.category.findUnique({
      where: { slug: categorySlug }
    })
    categoryId = category?.id
  }

  // Upsert article
  const article = await prisma.article.upsert({
    where: { slug },
    create: {
      slug,
      title,
      excerpt: description,
      content: '',
      authorId,
      publishedAt: publishedAt ? new Date(publishedAt) : undefined,
      status: publishedAt ? 'PUBLISHED' : 'DRAFT'
    },
    update: {
      title,
      excerpt: description,
      publishedAt: publishedAt ? new Date(publishedAt) : undefined,
      status: publishedAt ? 'PUBLISHED' : 'DRAFT'
    }
  })

  // Sync category
  if (categoryId !== undefined) {
    await prisma.articleCategory.upsert({
      where: { articleId_categoryId: { articleId: article.id, categoryId } },
      create: { articleId: article.id, categoryId },
      update: {}
    })
  }

  // Sync tags
  if (tags && tags.length > 0) {
    // Remove existing tag connections before re-syncing
    await prisma.articleTag.deleteMany({ where: { articleId: article.id } })

    for (const tagName of tags) {
      const tagSlug = tagName.toLowerCase().replace(/\s+/g, '-')
      const tag = await prisma.tag.upsert({
        where: { slug: tagSlug },
        create: { name: tagName, slug: tagSlug },
        update: {}
      })
      await prisma.articleTag.create({
        data: { articleId: article.id, tagId: tag.id }
      })
    }
  }
}
