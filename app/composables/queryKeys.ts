export const queryKeys = {
  articles: {
    all: ['articles'] as const,
    lists: () => [...queryKeys.articles.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...queryKeys.articles.lists(), filters] as const,
    details: () => [...queryKeys.articles.all, 'detail'] as const,
    detail: (slug: string) => [...queryKeys.articles.details(), slug] as const,
    related: (slug: string) => [...queryKeys.articles.all, 'related', slug] as const,
    seriesNav: (slug: string) => [...queryKeys.articles.all, 'series-nav', slug] as const,
    likes: (slug: string) => [...queryKeys.articles.all, 'likes', slug] as const,
    comments: (slug: string, page?: number) =>
      [...queryKeys.articles.all, 'comments', slug, page] as const
  },
  categories: {
    all: ['categories'] as const,
    detail: (slug: string) => ['categories', 'detail', slug] as const
  },
  tags: {
    all: ['tags'] as const
  },
  series: {
    all: ['series'] as const,
    detail: (slug: string) => ['series', 'detail', slug] as const
  },
  learningPaths: {
    all: ['learning-paths'] as const,
    detail: (slug: string) => ['learning-paths', 'detail', slug] as const,
    step: (pathSlug: string, stepSlug: string) =>
      ['learning-paths', 'step', pathSlug, stepSlug] as const
  },
  user: {
    me: ['user', 'me'] as const,
    favorites: ['user', 'favorites'] as const,
    history: ['user', 'history'] as const,
    progress: ['user', 'progress'] as const
  },
  newsletter: {
    subscribers: ['newsletter', 'subscribers'] as const,
    campaigns: ['newsletter', 'campaigns'] as const
  },
  admin: {
    articles: (filters?: Record<string, unknown>) => ['admin', 'articles', filters] as const,
    users: (filters?: Record<string, unknown>) => ['admin', 'users', filters] as const,
    comments: (filters?: Record<string, unknown>) => ['admin', 'comments', filters] as const,
    analytics: {
      overview: ['admin', 'analytics', 'overview'] as const,
      traffic: (days: number) => ['admin', 'analytics', 'traffic', days] as const,
      topArticles: (period: string) => ['admin', 'analytics', 'top', period] as const
    },
    settings: ['admin', 'settings'] as const
  },
  search: {
    results: (query: string, filters?: Record<string, unknown>) =>
      ['search', query, filters] as const,
    suggestions: (query: string) => ['search', 'suggestions', query] as const
  }
}
