import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { queryKeys } from '~/composables/queryKeys'
import { toast } from 'vue-sonner'

interface CommentUser {
  id: string
  name: string
  image?: string | null
}

interface Comment {
  id: number
  content: string
  createdAt: string
  user?: CommentUser | null
  userId?: string
  likes: unknown[]
  status: string
  replies?: Comment[]
}

export function useArticleComments(slug: MaybeRef<string>, page?: MaybeRef<number>) {
  return useQuery({
    queryKey: computed(() => queryKeys.articles.comments(toValue(slug), toValue(page))),
    queryFn: () => $fetch<Comment[]>(`/api/articles/${toValue(slug)}/comments`),
    enabled: computed(() => !!toValue(slug))
  })
}

export function usePostComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      slug,
      content,
      parentId
    }: {
      slug: string
      content: string
      parentId?: string | null
    }) => $fetch(`/api/articles/${slug}/comments`, { method: 'POST', body: { content, parentId } }),
    onSuccess: (_data, { slug }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.articles.comments(slug) })
    },
    onError: () => toast.error("Erreur lors de l'envoi du commentaire")
  })
}

export function useDeleteComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => $fetch(`/api/comments/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.articles.all })
      toast.success('Commentaire supprimé')
    },
    onError: () => toast.error('Erreur lors de la suppression')
  })
}

export function useReportComment() {
  return useMutation({
    mutationFn: (id: string) => $fetch(`/api/comments/${id}/report`, { method: 'POST' }),
    onSuccess: () => toast.success('Commentaire signalé — merci'),
    onError: () => toast.error('Erreur lors du signalement')
  })
}

export const useComments = (slug: string) => {
  const comments = ref<Comment[]>([])
  const loading = ref(false)

  const fetchComments = async (): Promise<void> => {
    try {
      loading.value = true
      comments.value = await $fetch<Comment[]>(`/api/articles/${slug}/comments`)
    } finally {
      loading.value = false
    }
  }

  const postComment = async (content: string, parentId?: string): Promise<void> => {
    await $fetch(`/api/articles/${slug}/comments`, { method: 'POST', body: { content, parentId } })
    await fetchComments()
  }

  const deleteComment = async (id: string): Promise<void> => {
    await $fetch(`/api/comments/${id}`, { method: 'DELETE' })
    await fetchComments()
  }

  const reportComment = async (id: string): Promise<void> => {
    await $fetch(`/api/comments/${id}/report`, { method: 'POST' })
  }

  return { comments, loading, fetchComments, postComment, deleteComment, reportComment }
}
