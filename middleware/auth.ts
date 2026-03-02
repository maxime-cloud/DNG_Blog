import { authClient } from '~/lib/auth-client'

export default defineNuxtRouteMiddleware(async (to) => {
  const session = authClient.useSession()

  // Attendre que la session soit chargée
  await until(session.isPending).toBe(false)

  if (!session.data.value) {
    return navigateTo('/login')
  }
})


// definePageMeta({
//   middleware: 'auth'
// })