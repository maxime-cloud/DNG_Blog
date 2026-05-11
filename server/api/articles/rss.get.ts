import { defineEventHandler, createError, setResponseHeader } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const articles = await prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
      take: 20,
      select: {
        slug: true,
        title: true,
        excerpt: true,
        publishedAt: true,
        author: {
          select: { name: true }
        },
        categories: {
          select: {
            category: {
              select: { name: true }
            }
          }
        }
      }
    })

    const baseUrl = process.env.BETTER_AUTH_URL ?? 'https://localhost:3000'

    const items = articles
      .map((a) => {
        const pubDate = a.publishedAt
          ? new Date(a.publishedAt).toUTCString()
          : ''
        const category = a.categories[0]?.category?.name ?? ''
        const description = a.excerpt ?? ''

        return `
    <item>
      <title><![CDATA[${a.title}]]></title>
      <link>${baseUrl}/articles/${a.slug}</link>
      <guid isPermaLink="true">${baseUrl}/articles/${a.slug}</guid>
      <description><![CDATA[${description}]]></description>
      <pubDate>${pubDate}</pubDate>
      <author>${a.author.name}</author>
      ${category ? `<category><![CDATA[${category}]]></category>` : ''}
    </item>`
      })
      .join('')

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>DNGBlog</title>
    <link>${baseUrl}</link>
    <description>Les derniers articles techniques de DNGBlog</description>
    <language>fr-FR</language>
    <atom:link href="${baseUrl}/api/articles/rss" rel="self" type="application/rss+xml"/>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${items}
  </channel>
</rss>`

    setResponseHeader(event, 'Content-Type', 'application/xml')
    return xml
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[API] GET /api/articles/rss', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
