export default defineNuxtRouteMiddleware(async () => {
  const authStore = useAuthStore()

  if (import.meta.server) {
    const event = useRequestEvent()
    const session = await $fetch('/api/auth/session', {
      headers: event?.headers
    })
    authStore.user = (session?.user ?? null) as any
  }
})
