<template>
    <div class="min-h-screen flex items-center justify-center">
        <Card class="w-96">
            <template #title>
                <h2 class="text-2xl font-bold text-center">Register</h2>
            </template>
            <template #content>
                <form @submit.prevent="handleRegister" class="flex flex-col gap-4">
                    <div class="field">
                        <span class="p-float-label">
                            <InputText
                                id="name"
                                v-model="name"
                                class="w-full"
                            />
                            <label for="name">Full Name</label>
                        </span>
                    </div>
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
                                toggleMask
                                class="w-full"
                            />
                            <label for="password">Password</label>
                        </span>
                    </div>
                    <Button
                        type="submit"
                        label="Register"
                        class="w-full"
                        :loading="loading"
                    />
                    <div class="text-center">
                        <NuxtLink to="/auth/login">
                            <Button
                                link
                                label="Already have an account? Login"
                            />
                        </NuxtLink>
                    </div>
                </form>
            </template>
        </Card>
    </div>
</template>

<script setup>
const name = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)
const toast = useToast();

async function handleRegister() {
    loading.value = true
    try {
        await account.create('unique()', email.value, password.value, name.value)
        await account.createEmailPasswordSession(email.value, password.value)
        toast.add({ severity: 'success', summary: 'Success', detail: 'Registered successfully', life: 3000 });
        navigateTo('/')
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: error.message, life: 3000 });
    } finally {
        loading.value = false
    }
}
</script> 