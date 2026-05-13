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
  const addFavorite = async (articleId: string): Promise<void> =>
    await $fetch(`/api/users/me/favorites/${articleId}`, { method: 'POST' })

  const removeFavorite = async (articleId: string): Promise<void> =>
    await $fetch(`/api/users/me/favorites/${articleId}`, { method: 'DELETE' })

  const getFavorites = async (params?: FavoritesParams): Promise<FavoritesResponse> =>
    await $fetch<FavoritesResponse>('/api/users/me/favorites', { query: params })

  return { addFavorite, removeFavorite, getFavorites }
}
