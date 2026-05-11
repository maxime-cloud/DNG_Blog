interface SubscribeResponse {
  success: boolean
  message: string
}

export const useNewsletter = () => {
  const status = ref<'idle' | 'loading' | 'success' | 'error'>('idle')
  const errorMessage = ref<string | null>(null)

  const subscribe = async (
    email: string,
    name?: string
  ): Promise<SubscribeResponse> => {
    try {
      status.value = 'loading'
      errorMessage.value = null
      const response = await $fetch<SubscribeResponse>(
        '/api/newsletter/subscribe',
        {
          method: 'POST',
          body: { email, name }
        }
      )
      status.value = 'success'
      return response
    } catch (error) {
      status.value = 'error'
      errorMessage.value
        = error instanceof Error ? error.message : 'Une erreur est survenue'
      throw error
    }
  }

  const unsubscribe = async (token: string): Promise<void> => {
    try {
      status.value = 'loading'
      errorMessage.value = null
      await $fetch('/api/newsletter/unsubscribe', {
        method: 'POST',
        body: { token }
      })
      status.value = 'success'
    } catch (error) {
      status.value = 'error'
      errorMessage.value
        = error instanceof Error ? error.message : 'Une erreur est survenue'
      throw error
    }
  }

  return {
    status,
    errorMessage,
    subscribe,
    unsubscribe
  }
}
