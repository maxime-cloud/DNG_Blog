import { defineEventHandler, createError, getRouterParam } from 'h3'

// Parse the article's stored Markdown (Article.content) server-side and return
// the MDC AST + toc. Parsing stays on the server so the heavy Markdown processor
// is never bundled into the client.
export default defineEventHandler(async (event) => {
  try {
    const slug = getRouterParam(event, 'slug')

    const article = await prisma.article.findUnique({
      where: { slug },
      select: { content: true, status: true }
    })

    if (!article || article.status !== 'PUBLISHED') {
      throw createError({ statusCode: 404, statusMessage: 'Article introuvable' })
    }

    return await parseMarkdown(article.content)
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[API] GET /api/articles/:slug/content', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})
