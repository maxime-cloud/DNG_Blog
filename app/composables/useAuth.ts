import { useAuthStore } from '~/stores/auth'
import { authClient } from '~/lib/auth-client'

export function useAuth() {
  const store = useAuthStore()

  const user = computed(() => store.user)
  const isLoggedIn = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isAuthor = computed(
    () => user.value?.role === 'author' || user.value?.role === 'admin'
  )

  async function login(email: string, password: string) {
    try {
      const result = await authClient.signIn.email({ email, password })
      if (result.data?.user) {
        await store.fetchSession()
      }
      return result
    } catch (error) {
      console.error('[useAuth] login error:', error)
      throw error
    }
  }

  async function logout() {
    try {
      await store.logout()
    } catch (error) {
      console.error('[useAuth] logout error:', error)
      throw error
    }
  }

  async function register(email: string, password: string, name: string) {
    try {
      const result = await authClient.signUp.email({ email, password, name })
      return result
    } catch (error) {
      console.error('[useAuth] register error:', error)
      throw error
    }
  }

  return {
    user,
    isLoggedIn,
    isAdmin,
    isAuthor,
    login,
    logout,
    register
  }
}
