interface FavoritesResponse {
  data: unknown[]
  total: number
}

interface FavoritesParams {
  page?: number
  limit?: number
  [key: string]: unknown
}

export const useFavorite = () => {
  const addFavorite = async (articleId: string): Promise<void> => {
    try {
      await $fetch(`/api/users/me/favorites/${articleId}`, { method: 'POST' })
    } catch (error) {
      throw error
    }
  }

  const removeFavorite = async (articleId: string): Promise<void> => {
    try {
      await $fetch(`/api/users/me/favorites/${articleId}`, {
        method: 'DELETE'
      })
    } catch (error) {
      throw error
    }
  }

  const getFavorites = async (
    params?: FavoritesParams
  ): Promise<FavoritesResponse> => {
    try {
      return await $fetch<FavoritesResponse>('/api/users/me/favorites', {
        query: params
      })
    } catch (error) {
      throw error
    }
  }

  return {
    addFavorite,
    removeFavorite,
    getFavorites
  }
}
