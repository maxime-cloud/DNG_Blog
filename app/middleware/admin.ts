export default defineNuxtRouteMiddleware(() => {
  const store = useAuthStore()
  if (!store.isAuthenticated) {
    return navigateTo('/auth/login')
  }
  console.log(store.user?.role)
  if (store.user?.role !== 'admin') {
    return navigateTo('/')
  }
})
