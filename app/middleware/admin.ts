export default defineNuxtRouteMiddleware(async (to, from) => {
  // Only run on client side
  if (process.server) {
    return
  }

  const tokenStore = useMyTokenStore()
  const userStore_instance = userStore()
  
  // Initialize token from localStorage
  tokenStore.initializeToken()
  
  console.log('[Admin Middleware] Checking access...')
  console.log('[Admin Middleware] Token:', tokenStore.accessToken ? 'exists' : 'missing')
  console.log('[Admin Middleware] User in store:', userStore_instance.user)
  
  // First check if user is already in store and is admin
  if (userStore_instance.user?.role === 'admin') {
    console.log('[Admin Middleware] User is admin from store, allowing access')
    return
  }
  
  // If no token, redirect to auth
  if (!tokenStore.accessToken) {
    // Try to get a new token from the server
    try {
      const tokenRes = await $fetch('/api/user/access-token', {
        method: 'POST'
      }) as string | null
      
      if (tokenRes) {
        tokenStore.setToken(tokenRes)
      } else {
        console.log('[Admin Middleware] No token available, redirecting to auth')
        return navigateTo("/auth")
      }
    } catch (err) {
      console.error('[Admin Middleware] Failed to get access token:', err)
      return navigateTo("/auth")
    }
  }
  
  // Validate token and check admin role
  try {
    const user = await $fetch('/api/user', {
      headers: {
        Authorization: `Bearer ${tokenStore.accessToken}`
      }
    }) as any
    
    console.log('[Admin Middleware] Fetched user:', user)
    console.log('[Admin Middleware] User role:', user?.role)
    
    // Check if response is an error or if user doesn't have admin role
    if (!user || user.statusCode || user.role !== 'admin') {
      console.log('[Admin Middleware] Not an admin user, redirecting to explore')
      return navigateTo('/explore')
    }
    
    // Update user store with admin user data
    userStore_instance.setUser({
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      role: user.role,
      imageUrl: user.image_url,
      profile_completed: user.profile_completed
    })
    
    console.log('[Admin Middleware] User is admin, allowing access')
    // User is admin, allow access
    return
  } catch (err: any) {
    console.error('[Admin Middleware] Error:', err)
    // If unauthorized, clear and redirect to auth
    if (err?.statusCode === 401) {
      userStore_instance.clearUser()
      tokenStore.clearToken()
      return navigateTo("/auth")
    }
    return navigateTo('/explore')
  }
})
