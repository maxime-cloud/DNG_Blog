import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { queryKeys } from '~/composables/queryKeys'
import { toast } from 'vue-sonner'

interface FavoritesResponse {
  data: unknown[]
  total: number
}

interface FavoritesParams {
  page?: number
  limit?: number
  [key: string]: unknown
}

export function useUserFavorites(params?: MaybeRef<FavoritesParams>) {
  return useQuery({
    queryKey: queryKeys.user.favorites,
    queryFn: () => $fetch<FavoritesResponse>('/api/users/me/favorites', { query: toValue(params) })
  })
}

export function useAddFavorite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (articleId: string) =>
      $fetch(`/api/users/me/favorites/${articleId}`, { method: 'POST' }),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.user.favorites })
      const previous = queryClient.getQueryData(queryKeys.user.favorites)
      return { previous }
    },
    onError: (_err, _articleId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.user.favorites, context.previous)
      }
      toast.error('Erreur lors de l\'ajout aux favoris')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.favorites })
      toast.success('Ajouté aux favoris !')
    }
  })
}

export function useRemoveFavorite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (articleId: string) =>
      $fetch(`/api/users/me/favorites/${articleId}`, { method: 'DELETE' }),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.user.favorites })
      const previous = queryClient.getQueryData(queryKeys.user.favorites)
      return { previous }
    },
    onError: (_err, _articleId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.user.favorites, context.previous)
      }
      toast.error('Erreur lors de la suppression des favoris')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.favorites })
      toast.success('Retiré des favoris')
    }
  })
}

export const useFavorite = () => {
  const { isLoggedIn } = useAuth()

  const getAnonymousFavorites = (): string[] => {
    if (import.meta.server) return []
    const key = 'anonymous_favorites'
    return JSON.parse(localStorage.getItem(key) || '[]')
  }

  const toggleAnonymousFavorite = (articleId: string, favorited: boolean) => {
    if (import.meta.server) return
    const key = 'anonymous_favorites'
    const favorites = getAnonymousFavorites()
    if (favorited) {
      if (!favorites.includes(articleId)) favorites.push(articleId)
    } else {
      const index = favorites.indexOf(articleId)
      if (index > -1) favorites.splice(index, 1)
    }
    localStorage.setItem(key, JSON.stringify(favorites))
  }

  const addFavorite = async (articleId: string): Promise<void> => {
    await $fetch(`/api/users/me/favorites/${articleId}`, { method: 'POST' })
    if (!isLoggedIn.value) toggleAnonymousFavorite(articleId, true)
  }

  const removeFavorite = async (articleId: string): Promise<void> => {
    await $fetch(`/api/users/me/favorites/${articleId}`, { method: 'DELETE' })
    if (!isLoggedIn.value) toggleAnonymousFavorite(articleId, false)
  }

  const getFavorites = async (params?: FavoritesParams): Promise<FavoritesResponse> => {
    const res = await $fetch<FavoritesResponse>('/api/users/me/favorites', { query: params })
    // For anonymous users, the API might return empty list or we merge with local
    return res
  }

  const isFavorited = (articleId: string): boolean => {
    if (isLoggedIn.value) return false // Should be handled by data from API
    return getAnonymousFavorites().includes(articleId)
  }

  return { addFavorite, removeFavorite, getFavorites, isFavorited, getAnonymousFavorites }
}
