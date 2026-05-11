export interface ArticleParams {
  page?: number
  limit?: number
  category?: string
  tag?: string
  series?: string
  search?: string
  sort?: string
}

export interface Article {
  slug: string
  title: string
  description?: string
  category?: string
  tags?: string[]
  series?: string
  publishedAt?: string
  [key: string]: unknown
}

export interface ArticlesResponse {
  data: Article[]
  total: number
  page: number
  limit: number
}

export function useArticles() {
  async function fetchArticles(
    params: ArticleParams = {}
  ): Promise<ArticlesResponse> {
    try {
      return await $fetch<ArticlesResponse>('/api/articles', { query: params })
    } catch (error) {
      console.error('[useArticles] fetchArticles error:', error)
      throw error
    }
  }

  async function fetchArticle(slug: string): Promise<Article> {
    try {
      return await $fetch<Article>(`/api/articles/${slug}`)
    } catch (error) {
      console.error(
        `[useArticles] fetchArticle error for slug "${slug}":`,
        error
      )
      throw error
    }
  }

  async function fetchRelated(slug: string): Promise<Article[]> {
    try {
      return await $fetch<Article[]>(`/api/articles/${slug}/related`)
    } catch (error) {
      console.error(
        `[useArticles] fetchRelated error for slug "${slug}":`,
        error
      )
      throw error
    }
  }

  async function fetchFeatured(): Promise<Article> {
    try {
      return await $fetch<Article>('/api/articles/featured')
    } catch (error) {
      console.error('[useArticles] fetchFeatured error:', error)
      throw error
    }
  }

  return {
    fetchArticles,
    fetchArticle,
    fetchRelated,
    fetchFeatured
  }
}
