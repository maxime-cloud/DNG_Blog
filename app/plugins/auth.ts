// export default defineNuxtPlugin(async (nuxtApp) => {
//   // Ne pas refaire l'appel côté client si déjà fait côté serveur
//   if (import.meta.server) return

//   const authStore = useAuthStore()

//   try {
//     const session = await $fetch('/api/auth/session')
//     authStore.user = session?.user ?? null
//   } catch {
//     authStore.user = null
//   }
// })

// ### Pourquoi ça règle le problème

// AVANT (ton code actuel)
// Navigateur reçoit la page → JS se charge → authClient.getSession() appelé
// → données arrivent → flash visible ❌

// APRÈS (avec le plugin SSR)
// Serveur lit la session via les cookies → hydrate le store Pinia
// → Navigateur reçoit la page AVEC les données déjà dedans