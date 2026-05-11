interface Comment {
  id: string
  content: string
  parentId?: string | null
  createdAt: string
  updatedAt: string
  author: {
    id: string
    name: string
    image?: string | null
  }
  children?: Comment[]
}

export const useComments = (slug: string) => {
  const comments = ref<Comment[]>([])
  const loading = ref(false)

  const fetchComments = async (): Promise<void> => {
    try {
      loading.value = true
      comments.value = await $fetch<Comment[]>(
        `/api/articles/${slug}/comments`
      )
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  const postComment = async (
    content: string,
    parentId?: string
  ): Promise<void> => {
    try {
      await $fetch(`/api/articles/${slug}/comments`, {
        method: 'POST',
        body: { content, parentId }
      })
      await fetchComments()
    } catch (error) {
      throw error
    }
  }

  const deleteComment = async (id: string): Promise<void> => {
    try {
      await $fetch(`/api/comments/${id}`, { method: 'DELETE' })
      await fetchComments()
    } catch (error) {
      throw error
    }
  }

  const reportComment = async (id: string): Promise<void> => {
    try {
      await $fetch(`/api/comments/${id}/report`, { method: 'POST' })
    } catch (error) {
      throw error
    }
  }

  return {
    comments,
    loading,
    fetchComments,
    postComment,
    deleteComment,
    reportComment
  }
}
