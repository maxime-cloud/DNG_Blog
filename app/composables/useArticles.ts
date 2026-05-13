import { useQuery } from '@tanstack/vue-query'
import { queryKeys } from '~/composables/queryKeys'

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

export function useArticlesList(filters: MaybeRef<ArticleParams> = {}) {
  return useQuery({
    queryKey: computed(() => queryKeys.articles.list(toValue(filters) as Record<string, unknown>)),
    queryFn: () => $fetch<ArticlesResponse>('/api/articles', { query: toValue(filters) })
  })
}

export function useArticle(slug: MaybeRef<string>) {
  return useQuery({
    queryKey: computed(() => queryKeys.articles.detail(toValue(slug))),
    queryFn: () => $fetch<Article>(`/api/articles/${toValue(slug)}`),
    enabled: computed(() => !!toValue(slug))
  })
}

export function useRelatedArticles(slug: MaybeRef<string>) {
  return useQuery({
    queryKey: computed(() => queryKeys.articles.related(toValue(slug))),
    queryFn: () => $fetch<Article[]>(`/api/articles/${toValue(slug)}/related`),
    enabled: computed(() => !!toValue(slug))
  })
}

export function useFeaturedArticle() {
  return useQuery({
    queryKey: [...queryKeys.articles.all, 'featured'],
    queryFn: () => $fetch<Article>('/api/articles/featured')
  })
}

export function useArticles() {
  async function fetchArticles(params: ArticleParams = {}): Promise<ArticlesResponse> {
    return await $fetch<ArticlesResponse>('/api/articles', { query: params })
  }

  async function fetchArticle(slug: string): Promise<Article> {
    return await $fetch<Article>(`/api/articles/${slug}`)
  }

  async function fetchRelated(slug: string): Promise<Article[]> {
    return await $fetch<Article[]>(`/api/articles/${slug}/related`)
  }

  async function fetchFeatured(): Promise<Article> {
    return await $fetch<Article>('/api/articles/featured')
  }

  return { fetchArticles, fetchArticle, fetchRelated, fetchFeatured }
}
