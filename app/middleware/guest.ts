
export default defineNuxtRouteMiddleware(async (to, from) => {
  // Initialize token from localStorage on client side
  if (process.client) {
    const tokenStore = useMyTokenStore()
    tokenStore.initializeToken()
  }

  const accessToken = useMyTokenStore().accessToken

  if (accessToken) {
    return navigateTo("/explore")
  }
})