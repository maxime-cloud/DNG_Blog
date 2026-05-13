import { useMutation } from '@tanstack/vue-query'
import { toast } from 'vue-sonner'

interface SubscribeResponse {
  success: boolean
  message: string
}

export function useSubscribeNewsletter() {
  return useMutation({
    mutationFn: ({ email, name }: { email: string, name?: string }) =>
      $fetch<SubscribeResponse>('/api/newsletter/subscribe', {
        method: 'POST',
        body: { email, name }
      }),
    onSuccess: () => toast.success('Abonnement confirmé ! Vérifiez vos emails.'),
    onError: () => toast.error('Erreur lors de l\'abonnement — réessayez')
  })
}

export function useUnsubscribeNewsletter() {
  return useMutation({
    mutationFn: (token: string) =>
      $fetch('/api/newsletter/unsubscribe', { method: 'POST', body: { token } }),
    onSuccess: () => toast.success('Vous avez été désabonné'),
    onError: () => toast.error('Erreur lors du désabonnement')
  })
}

export const useNewsletter = () => {
  const status = ref<'idle' | 'loading' | 'success' | 'error'>('idle')
  const errorMessage = ref<string | null>(null)

  const subscribe = async (email: string, name?: string): Promise<SubscribeResponse> => {
    try {
      status.value = 'loading'
      errorMessage.value = null
      const response = await $fetch<SubscribeResponse>('/api/newsletter/subscribe', {
        method: 'POST',
        body: { email, name }
      })
      status.value = 'success'
      return response
    } catch (error) {
      status.value = 'error'
      errorMessage.value = error instanceof Error ? error.message : 'Une erreur est survenue'
      throw error
    }
  }

  const unsubscribe = async (token: string): Promise<void> => {
    try {
      status.value = 'loading'
      errorMessage.value = null
      await $fetch('/api/newsletter/unsubscribe', { method: 'POST', body: { token } })
      status.value = 'success'
    } catch (error) {
      status.value = 'error'
      errorMessage.value = error instanceof Error ? error.message : 'Une erreur est survenue'
      throw error
    }
  }

  return { status, errorMessage, subscribe, unsubscribe }
}
