<template>
    <div class="min-h-screen flex relative bg-white">
        <!-- Mobile Menu Toggle -->
        <Button 
            icon="pi pi-bars" 
            @click="showSidebar = !showSidebar"
            class="fixed top-4 left-4 md:hidden z-50" 
            rounded
        />

        <!-- Sidebar with Backdrop -->
        <div 
            v-if="showSidebar" 
            class="fixed inset-0 bg-black bg-opacity-50 md:hidden z-40"
            @click="showSidebar = false"
        ></div>

        <!-- Sidebar -->
        <div 
            class="fixed left-4 top-4 bottom-4 w-[230px] rounded-xl bg-gray-100 shadow-lg p-4 flex flex-col z-50 transition-all duration-300"
            :class="[
                'md:translate-x-0',
                showSidebar ? 'translate-x-0' : '-translate-x-[250px]'
            ]"
        >
            <!-- Logo/Brand -->
            <div class="flex items-center gap-2 p-2 mb-4">
                <img src="/shop-logo.svg" alt="Logo" class="w-8 h-8" />
                <span class="font-extrabold text-lg text-gray-800">TechPedia</span>
            </div>

            <!-- Navigation Links -->
            <div class="flex-1">
                <NuxtLink 
                    v-for="item in menuItems" 
                    :key="item.path"
                    :to="item.path"
                    class="flex items-center gap-2 p-3 rounded-lg hover:bg-gray-200 transition-colors"
                    :class="{ 'bg-gray-200': route.path === item.path }"
                >
                    <i :class="item.icon" class="text-gray-700"></i>
                    <span class="text-gray-800">{{ item.label }}</span>
                </NuxtLink>
            </div>

            <!-- User Section -->
            <div class="border-t border-gray-200 mt-4 pt-4">
                <template v-if="user">
                    <div class="flex items-center gap-3 p-3">
                        <i class="pi pi-user text-gray-700 text-xl"></i>
                        <span class="text-gray-800">{{ user.name }}</span>
                    </div>
                    <Button 
                        label="Logout" 
                        severity="secondary"
                        class="w-full mt-2"
                        @click="handleLogout"
                    />
                </template>
                <template v-else>
                    <Button 
                        label="Login" 
                        icon="pi pi-sign-in"
                        class="w-full"
                        @click="navigateTo('/auth/login')"
                    />
                </template>
            </div>
        </div>

        <!-- Main Content -->
        <div 
            class="flex-1 transition-all duration-300"
            :class="[
                'md:ml-[250px] mt-8',
                'p-4 pt-16 md:pt-4'
            ]"
        >
            <slot />
        </div>
    </div>
</template>

<script setup>
const route = useRoute()
const showSidebar = ref(false)
const user = ref(null)
const toast = useToast();

// Close sidebar when route changes (mobile)
watch(route, async () => {
    showSidebar.value = false
    try {
        user.value = await account.get()
    } catch (error) {
        user.value = null
    }
})

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

const menuItems = [
    {
        label: 'Home',
        icon: 'pi pi-home',
        path: '/'
    },
    {
        label: 'Cart',
        icon: 'pi pi-shopping-cart',
        path: '/cart'
    },
    {
        label: 'My Products',
        icon: 'pi pi-shopping-bag',
        path: '/seller'
    },
]
</script>

<style>
html, body {
    margin: 0;
    padding: 0;
    background-color: #ffffff;
}

body.sidebar-open {
    overflow: hidden;
}

.p-fileupload-buttonbar {
    display: none;
}
</style>