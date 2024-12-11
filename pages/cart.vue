<template>
    <div class="container mx-auto px-4">
        <h1 class="text-3xl font-bold mb-8">Shopping Cart</h1>

        <div v-if="loading" class="flex justify-center">
            <ProgressSpinner />
        </div>

        <div v-else-if="cartItems.length === 0" class="text-center py-8">
            <i class="pi pi-shopping-cart text-4xl mb-4"></i>
            <p class="text-xl">Your cart is empty</p>
            <Button label="Continue Shopping" class="mt-4" @click="navigateTo('/')"/>
        </div>

        <div v-else class="grid grid-cols-12 gap-8">
            <div class="col-span-12 lg:col-span-8">
                <div v-for="item in cartItems" :key="item.id" 
                     class="flex gap-4 p-4 border-b border-surface-200">
                    <img :src="item.image" :alt="item.name" class="w-24 h-24 object-cover rounded"/>
                    <div class="flex-1">
                        <h3 class="text-lg font-medium">{{ item.name }}</h3>
                        <p class="text-surface-500">Rp {{ formatPrice(item.price) }}</p>
                        <p class="text-sm text-surface-400">Stock: {{ item.stock }}</p>
                        <div class="flex items-center gap-4 mt-2">
                            <InputNumber 
                                v-model="item.quantity" 
                                :min="1" 
                                :max="item.stock"
                                showButtons
                                @change="updateCartItem(item)"
                            />
                            <Button 
                                icon="pi pi-trash" 
                                severity="danger" 
                                @click="removeFromCart(item.id)"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-span-12 lg:col-span-4">
                <Card>
                    <template #title>Order Summary</template>
                    <template #content>
                        <div class="flex justify-between mb-4">
                            <span>Total Items:</span>
                            <span>{{ totalItems }}</span>
                        </div>
                        <div class="flex justify-between mb-4">
                            <span>Total Price:</span>
                            <span>Rp {{ formatPrice(totalPrice) }}</span>
                        </div>
                        <Button 
                            label="Checkout" 
                            class="w-full"
                            @click="handleCheckout"
                            :loading="checkoutLoading"
                        />
                    </template>
                </Card>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useCart } from '~/stores/useCart'
const { cartItems, loading, totalItems, totalPrice, fetchCartItems, removeFromCart, updateCartItem, checkout } = useCart()
const toast = useToast()
const checkoutLoading = ref(false)

const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID').format(price)
}

async function handleCheckout() {
    checkoutLoading.value = true
    try {
        await checkout()
        toast.add({ 
            severity: 'success', 
            summary: 'Success', 
            detail: 'Order placed successfully', 
            life: 3000 
        })
        await fetchCartItems()
    } catch (error) {
        toast.add({ 
            severity: 'error', 
            summary: 'Error', 
            detail: error.message || 'Failed to place order', 
            life: 3000 
        })
    } finally {
        checkoutLoading.value = false
    }
}

onMounted(async () => {
    try {
        await fetchCartItems()
    } catch (error) {
        toast.add({ 
            severity: 'error', 
            summary: 'Error', 
            detail: 'Failed to fetch cart items', 
            life: 3000 
        })
    }
})
</script> 