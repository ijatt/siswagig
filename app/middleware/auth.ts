
export default defineNuxtRouteMiddleware(async() => {
    const { data: accessToken } = await useFetch('/api/user/access-token', {
      method: "post"
    })

    if (!accessToken.value) {
        userStore().clearUser()
        return await navigateTo("/auth")
    }

    const token = useMyTokenStore()
    token.accessToken = accessToken.value as string
})