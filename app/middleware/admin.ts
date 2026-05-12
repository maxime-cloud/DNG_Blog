export default defineNuxtRouteMiddleware(() => {
  const store = useAuthStore()
  if (!store.isAuthenticated) {
    return navigateTo('/auth/login')
  }
  if (store.user?.role !== 'admin') {
    return navigateTo('/')
  }
})
