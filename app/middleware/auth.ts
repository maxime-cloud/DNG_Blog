import { authClient } from '~/lib/auth-client'

export default defineNuxtRouteMiddleware(async (to) => {  
  if (import.meta.server) {
    const event = useRequestEvent()
    const session = await $fetch('/api/auth/session', {
      headers: event?.headers // ← transmet les cookies de la requête HTTP
    })
    if (!session?.user) {
      return navigateTo('/login')
    }
  }
})


// definePageMeta({
//   middleware: 'auth'
// })