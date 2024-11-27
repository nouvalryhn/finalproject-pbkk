export default defineNuxtRouteMiddleware(async (to) => {
    if (to.path.startsWith('/seller')) {
        try {
            await account.get()
        } catch (error) {
            return navigateTo('/auth/login')
        }
    }
}) 