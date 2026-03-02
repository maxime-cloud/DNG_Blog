import { authClient } from "@/lib/auth-client";

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const isAuthenticated = computed(() => !!user.value)

  async function fetchSession() {
    const session = await authClient.getSession()
    user.value = session?.data?.user ?? null
  }

  async function logout() {
    await authClient.signOut()
    user.value = null
  }

  return { user, isAuthenticated, fetchSession, logout }
})