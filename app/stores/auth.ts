import { authClient } from "@/lib/auth-client";

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
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