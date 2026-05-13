import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { queryKeys } from '~/composables/queryKeys'
import { toast } from 'vue-sonner'

interface LikeResponse {
  liked: boolean
  count: number
}

export function useArticleLikes(slug: MaybeRef<string>) {
  return useQuery({
    queryKey: computed(() => queryKeys.articles.likes(toValue(slug))),
    queryFn: () => $fetch<LikeResponse>(`/api/articles/${toValue(slug)}/likes`),
    enabled: computed(() => !!toValue(slug))
  })
}

export function useLikeArticle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (slug: string) =>
      $fetch<LikeResponse>(`/api/articles/${slug}/likes`, { method: 'POST' }),
    onMutate: async (slug) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.articles.likes(slug) })
      const previous = queryClient.getQueryData<LikeResponse>(queryKeys.articles.likes(slug))
      queryClient.setQueryData<LikeResponse>(queryKeys.articles.likes(slug), old =>
        old ? { ...old, count: old.count + 1, liked: true } : { count: 1, liked: true }
      )
      return { previous, slug }
    },
    onError: (_err, _slug, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(queryKeys.articles.likes(context.slug), context.previous)
      }
    },
    onSuccess: (_data, slug) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.articles.likes(slug) })
    }
  })
}

export function useUnlikeArticle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (slug: string) =>
      $fetch<LikeResponse>(`/api/articles/${slug}/likes`, { method: 'DELETE' }),
    onMutate: async (slug) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.articles.likes(slug) })
      const previous = queryClient.getQueryData<LikeResponse>(queryKeys.articles.likes(slug))
      queryClient.setQueryData<LikeResponse>(queryKeys.articles.likes(slug), old =>
        old
          ? { ...old, count: Math.max(0, old.count - 1), liked: false }
          : { count: 0, liked: false }
      )
      return { previous, slug }
    },
    onError: (_err, _slug, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(queryKeys.articles.likes(context.slug), context.previous)
      }
    },
    onSuccess: (_data, slug) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.articles.likes(slug) })
    }
  })
}

export function useLikeComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => $fetch(`/api/comments/${id}/likes`, { method: 'POST' }),
    onError: () => toast.error('Erreur lors du like'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.articles.all })
    }
  })
}

export function useUnlikeComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => $fetch(`/api/comments/${id}/likes`, { method: 'DELETE' }),
    onError: () => toast.error('Erreur lors du unlike'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.articles.all })
    }
  })
}

export const useLike = () => {
  const likeArticle = async (slug: string): Promise<LikeResponse> =>
    await $fetch<LikeResponse>(`/api/articles/${slug}/likes`, { method: 'POST' })

  const unlikeArticle = async (slug: string): Promise<LikeResponse> =>
    await $fetch<LikeResponse>(`/api/articles/${slug}/likes`, { method: 'DELETE' })

  const getLikes = async (slug: string): Promise<LikeResponse> =>
    await $fetch<LikeResponse>(`/api/articles/${slug}/likes`)

  const likeComment = async (id: string): Promise<void> =>
    await $fetch(`/api/comments/${id}/likes`, { method: 'POST' })

  const unlikeComment = async (id: string): Promise<void> =>
    await $fetch(`/api/comments/${id}/likes`, { method: 'DELETE' })

  return { likeArticle, unlikeArticle, getLikes, likeComment, unlikeComment }
}
