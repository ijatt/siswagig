
export default defineNuxtRouteMiddleware(async (to, from) => {
  // Initialize token from localStorage on client side
  if (process.client) {
    const tokenStore = useMyTokenStore()
    tokenStore.initializeToken()
  }

  const tokenStore = useMyTokenStore()
  const userStore_instance = userStore()
  
  // If token exists in store, validate it by fetching user data
  if (tokenStore.accessToken) {
    try {
      const { data: user } = await useFetch('/api/user/index', {
        headers: {
          Authorization: `Bearer ${tokenStore.accessToken}`
        }
      })

      if (user.value) {
        // Token is valid and user data is accessible
        // Check if user is a freelancer and hasn't completed profile
        if (user.value.role === 'freelancer' && !user.value.profile_completed && to.path !== '/complete-profile') {
          return navigateTo('/complete-profile')
        }
        return
      }
    } catch (err) {
      // Token is invalid or expired, clear everything
      console.error('Token validation failed:', err)
      userStore_instance.clearUser()
      tokenStore.clearToken()
      return navigateTo("/auth")
    }
  }

  // If no token in store, try to get a new one from the server
  try {
    const { data: accessToken } = await useFetch('/api/user/access-token', {
      method: "post"
    })

    if (accessToken.value) {
      tokenStore.setToken(accessToken.value as string)
      return
    }
  } catch (err) {
    console.error('Failed to get access token:', err)
  }

  // No valid token, clear user and redirect to auth
  userStore_instance.clearUser()
  tokenStore.clearToken()
  return navigateTo("/auth")
})