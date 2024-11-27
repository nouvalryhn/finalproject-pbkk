<template>
    <div class="min-h-screen flex items-center justify-center">
        <Card class="w-96">
            <template #title>
                <h2 class="text-2xl font-bold text-center">Login</h2>
            </template>
            <template #content>
                <form  class="flex flex-col gap-4">
                    <div class="field">
                        <span class="p-float-label">
                            <InputText
                                id="email"
                                v-model="email"
                                type="email"
                                class="w-full"
                            />
                            <label for="email">Email</label>
                        </span>
                    </div>
                    <div class="field">
                        <span class="p-float-label">
                            <Password
                                id="password"
                                v-model="password"
                                :feedback="false"
                                toggleMask
                                class="w-full"
                            />
                            <label for="password">Password</label>
                        </span>
                    </div>
                    <Button
                        label="Login"
                        class="w-full"
                        @click="handleLogin"
                        :loading="loading"
                    />
                    <div class="text-center">
                        <NuxtLink to="/auth/register">
                            <Button
                                link
                                label="Don't have an account? Register"
                            />
                        </NuxtLink>
                    </div>
                </form>
            </template>
        </Card>
    </div>
</template>

<script setup>
const email = ref('')
const password = ref('')
const loading = ref(false)
const toast = useToast();
const user = ref(null)

async function handleLogin() {
    loading.value = true
    console.log('Attempting to log in with email:', email.value);
    try {
        await account.createEmailPasswordSession(email.value, password.value)
        user.value = await account.get()
        console.log('Login successful');
        toast.add({ severity: 'success', summary: 'Success', detail: 'Logged in successfully', life: 3000 });
        navigateTo('/')
    } catch (error) {
        console.error('Login failed:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: error.message, life: 3000 });
    } finally {
        loading.value = false
    }
}
</script> 