
export default defineNuxtRouteMiddleware(async() => {
    const accessToken = useMyTokenStore().accessToken

    if (accessToken) {
        return await navigateTo("/explore")
    }
})