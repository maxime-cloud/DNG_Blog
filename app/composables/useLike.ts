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
  const { isLoggedIn } = useAuth()
  
  const getAnonymousLikes = (type: 'articles' | 'comments'): string[] => {
    if (import.meta.server) return []
    const key = `anonymous_likes_${type}`
    return JSON.parse(localStorage.getItem(key) || '[]')
  }

  const toggleAnonymousLike = (type: 'articles' | 'comments', id: string, liked: boolean) => {
    if (import.meta.server) return
    const key = `anonymous_likes_${type}`
    const likes = getAnonymousLikes(type)
    if (liked) {
      if (!likes.includes(id)) likes.push(id)
    } else {
      const index = likes.indexOf(id)
      if (index > -1) likes.splice(index, 1)
    }
    localStorage.setItem(key, JSON.stringify(likes))
  }

  const likeArticle = async (slug: string): Promise<LikeResponse> => {
    const res = await $fetch<LikeResponse>(`/api/articles/${slug}/likes`, { method: 'POST' })
    if (!isLoggedIn.value) toggleAnonymousLike('articles', slug, true)
    return res
  }

  const unlikeArticle = async (slug: string): Promise<LikeResponse> => {
    const res = await $fetch<LikeResponse>(`/api/articles/${slug}/likes`, { method: 'DELETE' })
    if (!isLoggedIn.value) toggleAnonymousLike('articles', slug, false)
    return res
  }

  const getLikes = async (slug: string): Promise<LikeResponse> => {
    const res = await $fetch<LikeResponse>(`/api/articles/${slug}/likes`)
    if (!isLoggedIn.value) {
      const anonymous = getAnonymousLikes('articles')
      if (anonymous.includes(slug)) {
        res.liked = true
      }
    }
    return res
  }

  const likeComment = async (id: string): Promise<void> => {
    await $fetch(`/api/comments/${id}/likes`, { method: 'POST' })
    if (!isLoggedIn.value) toggleAnonymousLike('comments', id, true)
  }

  const unlikeComment = async (id: string): Promise<void> => {
    await $fetch(`/api/comments/${id}/likes`, { method: 'DELETE' })
    if (!isLoggedIn.value) toggleAnonymousLike('comments', id, false)
  }

  const isCommentLiked = (id: string, serverLikes?: any[]): boolean => {
    if (isLoggedIn.value) {
      // Logic for logged in users (e.g. check serverLikes if available)
      return false // Should be handled by data returned from API
    }
    return getAnonymousLikes('comments').includes(id)
  }

  return { likeArticle, unlikeArticle, getLikes, likeComment, unlikeComment, isCommentLiked, getAnonymousLikes }
}
