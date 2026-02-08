
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
      // Check user store first - if profile_completed is already true, skip API call
      if (userStore_instance.user?.profile_completed) {
        return
      }

      const { data: user } = await useFetch('/api/user', {
        headers: {
          Authorization: `Bearer ${tokenStore.accessToken}`
        },
        key: `user-${Date.now()}` // Prevent caching
      })

      if (user.value) {
        // Update user store with fresh data
        userStore_instance.setUser({
          user_id: user.value.user_id,
          name: user.value.name,
          email: user.value.email,
          role: user.value.role,
          imageUrl: user.value.image_url,
          profile_completed: user.value.profile_completed
        })

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