import { useQuery } from '@tanstack/vue-query'
import { queryKeys } from '~/composables/queryKeys'

interface SearchResult {
  id: string
  title: string
  slug: string
  excerpt?: string
  category?: string
  tags?: string[]
}

interface Suggestion {
  label: string
  value: string
}

interface SearchFilters {
  category?: string
  tag?: string
}

export function useSearchResults(query: MaybeRef<string>, filters?: MaybeRef<SearchFilters>) {
  return useQuery({
    queryKey: computed(() =>
      queryKeys.search.results(toValue(query), toValue(filters) as Record<string, unknown>)
    ),
    queryFn: () =>
      $fetch<SearchResult[]>('/api/search', { query: { q: toValue(query), ...toValue(filters) } }),
    enabled: computed(() => toValue(query).length >= 2)
  })
}

export function useSearchSuggestions(query: MaybeRef<string>) {
  return useQuery({
    queryKey: computed(() => queryKeys.search.suggestions(toValue(query))),
    queryFn: () =>
      $fetch<Suggestion[]>('/api/search/suggestions', { query: { q: toValue(query) } }),
    enabled: computed(() => toValue(query).length >= 1),
    staleTime: 30000
  })
}

export const useSearch = () => {
  const query = ref('')
  const results = ref<SearchResult[]>([])
  const suggestions = ref<Suggestion[]>([])
  const loading = ref(false)

  const search = async (q: string, filters?: SearchFilters): Promise<void> => {
    try {
      loading.value = true
      results.value = await $fetch<SearchResult[]>('/api/search', { query: { q, ...filters } })
    } finally {
      loading.value = false
    }
  }

  const fetchSuggestions = useDebounceFn(async (q: string): Promise<void> => {
    suggestions.value = await $fetch<Suggestion[]>('/api/search/suggestions', { query: { q } })
  }, 300)

  return { query, results, suggestions, loading, search, fetchSuggestions }
}
