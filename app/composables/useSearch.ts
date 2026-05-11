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

export const useSearch = () => {
  const query = ref('')
  const results = ref<SearchResult[]>([])
  const suggestions = ref<Suggestion[]>([])
  const loading = ref(false)

  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  const search = async (q: string, filters?: SearchFilters): Promise<void> => {
    try {
      loading.value = true
      results.value = await $fetch<SearchResult[]>('/api/search', {
        query: { q, ...filters }
      })
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  const fetchSuggestions = (q: string): Promise<void> => {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    return new Promise((resolve, reject) => {
      debounceTimer = setTimeout(async () => {
        try {
          suggestions.value = await $fetch<Suggestion[]>(
            '/api/search/suggestions',
            {
              query: { q }
            }
          )
          resolve()
        } catch (error) {
          reject(error)
        }
      }, 300)
    })
  }

  return {
    query,
    results,
    suggestions,
    loading,
    search,
    fetchSuggestions
  }
}
