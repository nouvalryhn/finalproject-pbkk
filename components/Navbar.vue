<template>
    <Menubar class="fixed w-full top-0 z-50">
        <template #start>
            <NuxtLink to="/">
                <Button 
                    label="Marketplace" 
                    link 
                    class="font-bold text-xl"
                />
            </NuxtLink>
        </template>
        
        <template #end>
            <div class="flex gap-2">
                <Button 
                    label="Home" 
                    link
                    @click="navigateTo('/')"
                />
                <Button 
                    label="Sell" 
                    link
                    @click="navigateTo('/seller')"
                />
                <template v-if="!user">
                    <Button 
                        label="Login" 
                        outlined
                        @click="navigateTo('/auth/login')"
                    />
                    <Button 
                        label="Register"
                        @click="navigateTo('/auth/register')"
                    />
                </template>
                <template v-else>
                    <Button 
                        label="Logout" 
                        severity="secondary"
                        @click="handleLogout"
                    />
                </template>
            </div>
        </template>
    </Menubar>
</template>

<script setup>
const user = ref(null)
const toast = useToast();

onMounted(async () => {
    try {
        user.value = await account.get()
    } catch (error) {
        user.value = null
    }
})

async function handleLogout() {
    try {
        await account.deleteSession('current')
        user.value = null
        toast.add({ severity: 'success', summary: 'Success', detail: 'Logged out successfully', life: 3000 });
        navigateTo('/auth/login')
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: error.message, life: 3000 });
    }
}
</script> 