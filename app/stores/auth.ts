import { authClient } from '@/lib/auth-client'

interface AuthUser {
  id: string
  name: string
  email: string
  image?: string | null
  role?: string | null
  banned?: boolean | null
  banReason?: string | null
  banExpires?: string | null
  createdAt: string
  updatedAt: string
  emailVerified: boolean
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const isAuthenticated = computed(() => !!user.value)

  async function fetchSession() {
    const data = await $fetch('/api/auth/session') // ← appel SSR
    user.value = data?.user ?? null
  }

  async function logout() {
    await authClient.signOut()
    user.value = null
  }

  return { user, isAuthenticated, fetchSession, logout }
})
