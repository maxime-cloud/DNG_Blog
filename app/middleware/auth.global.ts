// middleware/auth.global.ts  ← "global" = s'exécute sur chaque page
export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()

  // S'exécute côté serveur AVEC les cookies disponibles
  if (import.meta.server) {
    const event = useRequestEvent()
    const session = await $fetch('/api/auth/session', {
      headers: event?.headers // ← transmet les cookies de la requête HTTP
    })
    authStore.user = session?.user ?? null
  }
})