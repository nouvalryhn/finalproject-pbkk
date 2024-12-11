<template>
    <div class="container mx-auto px-4">
        <h1 class="text-3xl font-bold">Featured Products</h1>

        <div class="rounded">

            <DataView :value="filteredProducts" :layout="layout">
                <template #header>
                    <div class="flex flex-col sm:flex-row justify-between gap-4 mb-4">
                        <span class="p-input-icon-left flex-1">
                            <!-- <i class="pi pi-search" /> -->
                            <InputText 
                                v-model="searchQuery" 
                                placeholder="Search products..." 
                                class="w-full"
                            />
                        </span>
                        <SelectButton v-model="layout" :options="layoutOptions" :allowEmpty="false">
                            <template #option="{ option }">
                                <i :class="[option === 'list' ? 'pi pi-bars' : 'pi pi-table']" />
                            </template>
                        </SelectButton>
                    </div>
                </template>

                <template #list="{ items }">
                    <div class="flex flex-col">
                        <div v-for="(item, index) in items" :key="item.id">
                            <div class="flex flex-col sm:flex-row sm:items-center p-6 gap-4"
                                :class="{ 'border-t border-surface-200 dark:border-surface-700': index !== 0 }"
                                style="height: 200px;">
                                <div class="md:w-40 relative">
                                    <img class="block xl:block mx-auto rounded w-full" :src="item.image"
                                        :alt="item.name" />
                                    <div class="absolute rounded-border" style="left: 4px; top: 4px">
                                        <Tag :value="item.inventoryStatus" :severity="getSeverity(item)"></Tag>
                                    </div>
                                </div>
                                <div class="flex flex-col md:flex-row justify-between md:items-center flex-1 gap-6">
                                    <div class="flex flex-row md:flex-col justify-between items-start gap-2">
                                        <div>
                                            <span class="font-medium text-surface-500 dark:text-surface-400 text-sm">{{
                                                item.category }}</span>
                                            <div class="text-lg font-medium mt-2">{{ item.name }}</div>
                                        </div>
                                        <div class="bg-surface-100 p-1" style="border-radius: 30px">
                                            <div class="bg-surface-0 flex items-center gap-2 justify-center py-1 px-2"
                                                style="border-radius: 30px; box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.04), 0px 1px 2px 0px rgba(0, 0, 0, 0.06)">
                                                <span class="text-surface-900 font-medium text-sm">{{ item.rating }}</span>
                                                <i class="pi pi-star-fill text-yellow-500"></i>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="flex flex-col md:items-end gap-8">
                                        <span class="text-xl font-semibold">Rp {{ formatPrice(item.price) }}</span>
                                        <div class="flex flex-row-reverse md:flex-row gap-2">
                                            <Button icon="pi pi-info-circle" outlined @click="showProductDetails(item)"></Button>
                                            <Button icon="pi pi-shopping-cart" label="Add to Cart"
                                                :disabled="item.inventoryStatus === 'OUTOFSTOCK'"
                                                @click="handleAddToCart(item.id)" class="flex-auto whitespace-nowrap" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </template>

                <template #grid="{ items }">
                    <div class="grid grid-cols-12 gap-4">
                        <div v-for="(item, index) in items" :key="item.id"
                            class="col-span-12 sm:col-span-6 md:col-span-4 xl:col-span-3 p-2">
                            <div
                                class="p-6 border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900 rounded flex flex-col"
                                style="height: 500px;">
                                <div class="bg-surface-50 flex justify-center rounded p-4">
                                    <div class="relative mx-auto">
                                        <img class="rounded w-full" :src="item.image" :alt="item.name"
                                            style="object-fit: contain; height: 200px; width: 100%;" />
                                        <div class="absolute rounded-border" style="left: 4px; top: 4px">
                                            <Tag :value="item.inventoryStatus" :severity="getSeverity(item)"></Tag>
                                        </div>
                                    </div>
                                </div>
                                <div class="pt-6">
                                    <div class="flex flex-row justify-between items-start gap-2">
                                        <div>
                                            <span class="font-medium text-surface-500 dark:text-surface-400 text-sm">{{
                                                item.category }}</span>
                                            <div class="text-lg font-medium mt-1">{{ item.name }}</div>
                                        </div>
                                        <div class="bg-surface-100 p-1" style="border-radius: 30px">
                                            <div class="bg-surface-0 flex items-center gap-2 justify-center py-1 px-2"
                                                style="border-radius: 30px; box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.04), 0px 1px 2px 0px rgba(0, 0, 0, 0.06)">
                                                <span class="text-surface-900 font-medium text-sm">{{ item.rating
                                                    }}</span>
                                                <i class="pi pi-star-fill text-yellow-500"></i>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="flex flex-col gap-6 mt-6">
                                        <span class="text-2xl font-semibold">Rp {{ formatPrice(item.price) }}</span>
                                        <div class="flex gap-2">
                                            <Button icon="pi pi-shopping-cart" label="Add to Cart"
                                                :disabled="item.inventoryStatus === 'OUTOFSTOCK'"
                                                @click="handleAddToCart(item.id)" class="flex-auto whitespace-nowrap" />
                                            <Button icon="pi pi-info-circle" outlined @click="showProductDetails(item)"></Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </template>
            </DataView>
        </div>

        <Dialog 
            v-model:visible="dialogVisible" 
            modal 
            header="Product Details"
            :style="{ width: '90%', maxWidth: '500px' }"
        >
            <div v-if="selectedProduct" class="flex flex-col gap-4">
                <img 
                    :src="selectedProduct.image" 
                    :alt="selectedProduct.name"
                    class="w-full h-64 object-contain rounded-lg"
                />
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <h3 class="font-bold text-lg">{{ selectedProduct.name }}</h3>
                        <p class="text-surface-600">{{ selectedProduct.category }}</p>
                    </div>
                    <div class="text-right">
                        <p class="text-xl font-semibold">Rp {{ formatPrice(selectedProduct.price) }}</p>
                        <div class="flex items-center justify-end gap-2">
                            <span>{{ selectedProduct.rating }}</span>
                            <i class="pi pi-star-fill text-yellow-500"></i>
                        </div>
                    </div>
                </div>
                <div>
                    <h4 class="font-semibold mb-2">Stock Status</h4>
                    <Tag 
                        :value="selectedProduct.inventoryStatus" 
                        :severity="getSeverity(selectedProduct)"
                    ></Tag>
                </div>
                <div>
                    <h4 class="font-semibold mb-2">Description</h4>
                    <p class="text-surface-600">{{ selectedProduct.description }}</p>
                </div>
            </div>
        </Dialog>
    </div>
</template>

<script setup>
const products = ref([])
const layout = ref('grid')
const layoutOptions = ['list', 'grid']
const toast = useToast()
const searchQuery = ref('')
import { useCart } from '~/stores/useCart'
const { addToCart } = useCart()

const filteredProducts = computed(() => {
    if (!searchQuery.value) return products.value
    
    const query = searchQuery.value.toLowerCase()
    return products.value.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query)
    )
})

async function handleAddToCart(productId) {
    try {
        await addToCart(productId)
        toast.add({ 
            severity: 'success', 
            summary: 'Success', 
            detail: 'Item added to cart', 
            life: 3000 
        })
    } catch (error) {
        toast.add({ 
            severity: 'error', 
            summary: 'Error', 
            detail: 'Failed to add item to cart', 
            life: 3000 
        })
    }
}

const getSeverity = (product) => {
    switch (product.inventoryStatus) {
        case 'INSTOCK':
            return 'success'
        case 'LOWSTOCK':
            return 'warning'
        case 'OUTOFSTOCK':
            return 'danger'
        default:
            return null
    }
}

const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID').format(price);
}

onMounted(async () => {
    try {
        const response = await databases.listDocuments(
            '6746fde600237a0a08d3',
            '6746fe20002e26e57729'
        )
        products.value = response.documents.map(doc => ({
            id: doc.$id,
            name: doc.name,
            price: doc.price,
            description: doc.description,
            image: doc.image,
            category: doc.category || 'Uncategorized',
            inventoryStatus: doc.quantity > 0 ? 'INSTOCK' : 'OUTOFSTOCK',
            rating: doc.rating || 5
        }))
    } catch (error) {
        console.error('Error:', error)
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch products', life: 3000 });
    }
})

const dialogVisible = ref(false)
const selectedProduct = ref(null)

function showProductDetails(product) {
    selectedProduct.value = product
    dialogVisible.value = true
}
</script>