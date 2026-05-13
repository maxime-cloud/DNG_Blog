import { defineEventHandler, createError, getQuery } from 'h3'
import type { H3Event } from 'h3'
import z from 'zod'

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(9),
  category: z.string().optional(),
  tag: z.string().optional(),
  series: z.string().optional(),
  search: z.string().max(100).optional(),
  sort: z.enum(['date', 'latest', 'popular', 'oldest', 'trending']).default('date'),
  authorId: z.string().optional()
})

const articleSelect = {
  id: true,
  slug: true,
  title: true,
  excerpt: true,
  coverImageUrl: true,
  publishedAt: true,
  distrosTarget: true,
  author: {
    select: { name: true, image: true }
  },
  categories: {
    select: {
      category: {
        select: { name: true, slug: true, color: true, colorb: true, imageUrl: true }
      }
    }
  },
  tags: {
    select: { tag: { select: { name: true, slug: true } } }
  },
  _count: {
    select: { comments: true, likes: true }
  }
} as const

async function fetchTrending(where: object, skip: number, limit: number) {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const trendingViews = await prisma.articleView.groupBy({
    by: ['articleId'],
    where: { viewedAt: { gte: sevenDaysAgo } },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } }
  })

  const trendingIds = trendingViews.map(v => v.articleId)
  const trendingWhere = trendingIds.length ? { ...where, id: { in: trendingIds } } : where

  const [rows, total] = await Promise.all([
    prisma.article.findMany({
      where: trendingWhere,
      skip,
      take: limit,
      orderBy: [{ publishedAt: 'desc' }],
      select: articleSelect
    }),
    prisma.article.count({ where: trendingWhere })
  ])

  if (!trendingIds.length) return [rows, total] as const

  const sorted = [...rows].sort((a, b) => {
    const rankA = trendingIds.indexOf(a.id)
    const rankB = trendingIds.indexOf(b.id)
    if (rankA === -1) return 1
    if (rankB === -1) return -1
    return rankA - rankB
  })

  return [sorted, total] as const
}

async function fetchSorted(where: object, sort: string, skip: number, limit: number) {
  const popularOrder = [{ likes: { _count: 'desc' as const } }, { publishedAt: 'desc' as const }]
  const oldestOrder = [{ publishedAt: 'asc' as const }]
  const defaultOrder = [{ publishedAt: 'desc' as const }]
  const orderBy = sort === 'popular' ? popularOrder : sort === 'oldest' ? oldestOrder : defaultOrder

  return Promise.all([
    prisma.article.findMany({ where, skip, take: limit, orderBy, select: articleSelect }),
    prisma.article.count({ where })
  ])
}

async function handleRequest(event: H3Event) {
  const rawQuery = getQuery(event)
  const parsed = querySchema.safeParse(rawQuery)

  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Paramètres invalides' })
  }

  const { page, limit, category, tag, series, search, sort, authorId } = parsed.data
  const skip = (page - 1) * limit

  const where = {
    status: 'PUBLISHED' as const,
    ...(category && { categories: { some: { category: { slug: category } } } }),
    ...(tag && { tags: { some: { tag: { slug: tag } } } }),
    ...(series && { series: { slug: series } }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' as const } },
        { excerpt: { contains: search, mode: 'insensitive' as const } }
      ]
    }),
    ...(authorId && { authorId })
  }

  function getRows() {
    return sort === 'trending'
      ? fetchTrending(where, skip, limit)
      : fetchSorted(where, sort, skip, limit)
  }
  const [articles, total] = await getRows()

  const totalPages = Math.ceil(total / limit)

  return {
    data: articles.map(a => ({
      id: a.id,
      slug: a.slug,
      title: a.title,
      description: a.excerpt,
      coverImage: a.coverImageUrl,
      publishedAt: a.publishedAt,
      distrosTarget: a.distrosTarget,
      author: a.author,
      category: a.categories[0]?.category ?? null,
      tags: a.tags.map(t => t.tag),
      likesCount: a._count.likes,
      _count: { comments: a._count.comments }
    })),
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  }
}

export default defineEventHandler(async function handler(event) {
  try {
    return await handleRequest(event)
  } catch (error) {
    if ((error as { statusCode?: number }).statusCode) throw error
    console.error('[API] GET /api/articles', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
