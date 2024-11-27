import { ref, computed } from 'vue'
import { databases } from '~/utils/appwrite'

// Define a type for cart items
interface CartItem {
    id: string;
    quantity: number;
    product_id: string;
    name: string;
    price: number;
    image: string;
}

export const useCart = () => {
    const cartItems = ref<CartItem[]>([])
    const loading = ref(false)
    const error = ref<unknown>(null)

    const totalItems = computed(() => {
        return cartItems.value.reduce((acc, item) => acc + item.quantity, 0)
    })

    const totalPrice = computed(() => {
        return cartItems.value.reduce((acc, item) => acc + (item.price * item.quantity), 0)
    })

    async function fetchCartItems() {
        loading.value = true
        try {
            const response = await databases.listDocuments(
                '6746fde600237a0a08d3',
                '6747667f00301137b5fd'
            )
            cartItems.value = await Promise.all(response.documents.map(async (item) => {
                // Fetch product details for each cart item
                const product = await databases.getDocument(
                    '6746fde600237a0a08d3',
                    '6746fe20002e26e57729',
                    item.product_id
                )
                return {
                    id: item.$id,
                    quantity: item.quantity,
                    product_id: item.product_id,
                    name: product.name,
                    price: product.price,
                    image: product.image
                }
            }))
        } catch (err) {
            error.value = err
        } finally {
            loading.value = false
        }
    }

    async function addToCart(productId: string, quantity = 1) {
        loading.value = true
        try {
            // Check if item already exists in cart
            const existingItem = cartItems.value.find(item => item.product_id === productId)
            
            if (existingItem) {
                // Update quantity if item exists
                await databases.updateDocument(
                    '6746fde600237a0a08d3',
                    '6747667f00301137b5fd',
                    existingItem.id,
                    {
                        quantity: existingItem.quantity + quantity,
                        updated_at: new Date()
                    }
                )
            } else {
                // Create new cart item
                await databases.createDocument(
                    '6746fde600237a0a08d3',
                    '6747667f00301137b5fd',
                    'unique()',
                    {
                        product_id: productId,
                        quantity: quantity,
                        user_id: (await account.get()).$id,
                        created_at: new Date(),
                        updated_at: new Date()
                    }
                )
            }
            await fetchCartItems()
        } catch (err) {
            error.value = err
        } finally {
            loading.value = false
        }
    }

    async function removeFromCart(cartItemId: string) {
        loading.value = true
        try {
            await databases.deleteDocument(
                '6746fde600237a0a08d3',
                '6747667f00301137b5fd',
                cartItemId
            )
            await fetchCartItems()
        } catch (err) {
            error.value = err
        } finally {
            loading.value = false
        }
    }

    return {
        cartItems,
        loading,
        error,
        totalItems,
        totalPrice,
        fetchCartItems,
        addToCart,
        removeFromCart
    }
} 