interface LikeResponse {
  liked: boolean
  count: number
}

export const useLike = () => {
  const likeArticle = async (slug: string): Promise<LikeResponse> => {
    try {
      return await $fetch<LikeResponse>(`/api/articles/${slug}/likes`, {
        method: 'POST'
      })
    } catch (error) {
      throw error
    }
  }

  const unlikeArticle = async (slug: string): Promise<LikeResponse> => {
    try {
      return await $fetch<LikeResponse>(`/api/articles/${slug}/likes`, {
        method: 'DELETE'
      })
    } catch (error) {
      throw error
    }
  }

  const getLikes = async (slug: string): Promise<LikeResponse> => {
    try {
      return await $fetch<LikeResponse>(`/api/articles/${slug}/likes`)
    } catch (error) {
      throw error
    }
  }

  const likeComment = async (id: string): Promise<void> => {
    try {
      await $fetch(`/api/comments/${id}/likes`, { method: 'POST' })
    } catch (error) {
      throw error
    }
  }

  const unlikeComment = async (id: string): Promise<void> => {
    try {
      await $fetch(`/api/comments/${id}/likes`, { method: 'DELETE' })
    } catch (error) {
      throw error
    }
  }

  return {
    likeArticle,
    unlikeArticle,
    getLikes,
    likeComment,
    unlikeComment
  }
}
