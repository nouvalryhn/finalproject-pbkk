<template>
    <div class="container mx-auto p-4">
        <Card class="mb-8">
            <template #title>
                <h2 class="text-2xl font-semibold">Add New Product</h2>
            </template>
            <template #content>
                <div class="flex flex-col md:flex-row gap-8">
                    <form class="w-full md:w-1/2">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="field">
                                <label for="name">Product Name</label>
                                <InputText id="name" v-model="newProduct.name" class="w-full" />
                            </div>
                            <div class="field">
                                <label for="price">Price</label>
                                <InputNumber 
                                    id="price" 
                                    v-model="newProduct.price" 
                                    mode="currency" 
                                    currency="IDR" 
                                    locale="id-ID"
                                    :minFractionDigits="0"
                                    class="w-full" 
                                />
                            </div>
                            <div class="field">
                                <label for="category">Category</label>
                                <InputText 
                                    id="category" 
                                    v-model="newProduct.category" 
                                    class="w-full"
                                    placeholder="Enter product category" 
                                />
                            </div>
                            <div class="field">
                                <label for="stock">Stock</label>
                                <InputNumber id="stock" v-model="newProduct.quantity" class="w-full" />
                            </div>
                            <div class="field">
                                <label for="rating">Initial Rating</label>
                                <Rating v-model="newProduct.rating" :cancel="false" />
                            </div>
                            <div class="field col-span-2">
                                <label for="description">Description</label>
                                <Textarea id="description" v-model="newProduct.description" rows="5" class="w-full" />
                            </div>
                        </div>
                    </form>

                    <div class="w-full md:w-1/2">
                        <div class="field">
                            <label for="image">Product Image</label>
                            <div class="flex flex-col gap-3">
                                <FileUpload
                                    mode="basic"
                                    :auto="true"
                                    accept="image/*"
                                    :maxFileSize="5000000"
                                    @select="onSelect"
                                    @progress="uploadProgress = $event.progress"
                                    chooseLabel="Browse Image" 
                                    class="w-full"/>
                                <div v-if="newProduct.image" class="relative mt-2">
                                    <img 
                                        ref="imageRef" 
                                        :src="newProduct.image" 
                                        alt="Product preview" 
                                        class="w-full h-[400px] object-cover rounded-lg shadow-md"
                                        @load="analyzeImage"
                                    />
                                    <div v-if="isAnalyzing" class="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                                        <ProgressSpinner />
                                    </div>
                                    <div 
                                        v-for="(prediction, index) in predictions" 
                                        :key="index"
                                        class="absolute border-2 border-red-500"
                                        :style="getBoundingBoxStyle(prediction)"
                                    >
                                        <span class="absolute -top-6 left-0 bg-red-500 text-white px-2 py-1 text-xs rounded">
                                            {{ prediction.class }} ({{ Math.round(prediction.confidence * 100) }}%)
                                        </span>
                                    </div>
                                </div>
                                <div v-if="predictions.length && !isAnalyzing" class="mt-4 p-4 bg-gray-50 rounded-lg">
                                    <h3 class="font-semibold mb-2">Analysis Results:</h3>
                                    <ul class="list-disc pl-4">
                                        <li v-for="(prediction, index) in predictions" :key="index">
                                            {{ prediction.class }} ({{ Math.round(prediction.confidence * 100) }}% confidence)
                                        </li>
                                    </ul>
                                    
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="flex justify-end mt-4">
                    <Button @click="handleAddProduct" label="Add Product" icon="pi pi-plus" />
                </div>
            </template>
        </Card>

        <Card>
            <template #title>
                <h2 class="text-2xl font-semibold">Your Products</h2>
            </template>
            <template #content>
                <DataTable :value="products" class="p-datatable-sm" responsiveLayout="scroll"
                    :paginator="true" :rows="10">
                    <Column field="name" header="Name" sortable>
                        <template #body="slotProps">
                            <div class="flex align-items-center">
                                <img :src="slotProps.data.image" :alt="slotProps.data.name" 
                                    class="w-12 h-12 mr-2 rounded-md object-cover" />
                                {{ slotProps.data.name }}
                            </div>
                        </template>
                    </Column>
                    <Column field="price" header="Price" sortable>
                        <template #body="slotProps">
                            {{ formatCurrency(slotProps.data.price) }}
                        </template>
                    </Column>
                    <Column field="stock" header="Stock" sortable></Column>
                    <Column field="rating" header="Rating">
                        <template #body="slotProps">
                            <Rating v-model="slotProps.data.rating" :readonly="true" :cancel="false" />
                        </template>
                    </Column>
                    <Column header="Actions" :exportable="false" style="min-width:8rem">
                        <template #body="slotProps">
                            <Button icon="pi pi-pencil" class="p-button-rounded p-button-success mr-2" @click="editProduct(slotProps.data)" />
                            <Button icon="pi pi-trash" class="p-button-rounded p-button-danger" @click="confirmDelete(slotProps.data)" />
                        </template>
                    </Column>
                </DataTable>
            </template>
        </Card>
    </div>
</template>

<script setup>
import { ID } from 'appwrite';

const products = ref([])
const newProduct = ref({
    name: '',
    price: 0,
    description: '',
    quantity: 0,
    rating: 0,
    image: '',
    imageId: '',
    category: ''
})

const imageRef = ref(null)
const isAnalyzing = ref(false)
const predictions = ref([])

onMounted(async () => {
    await fetchProducts()
})

async function fetchProducts() {
    try {
        const response = await databases.listDocuments(
            '6746fde600237a0a08d3',
            '6746fe20002e26e57729'
        )
        products.value = response.documents
    } catch (error) {
        console.error('Failed to fetch products:', error)
    }
}

async function onSelect(event) {
    const file = event.files[0]
    try {
        // Upload to Appwrite Storage
        const response = await storage.createFile(
            '6746fe5a0036069d253f', // Replace with your bucket ID
            ID.unique(),
            file
        )
        
        // Get file view URL
        const fileUrl = storage.getFileView(
            '6746fe5a0036069d253f',
            response.$id
        )

        newProduct.value.image = fileUrl
        newProduct.value.imageId = response.$id
    } catch (error) {
        console.error('Failed to upload image:', error)
    }
}

async function handleAddProduct() {
    try {
        if (!newProduct.value.image) {
            throw new Error('Please upload an image first')
        }

        await databases.createDocument(
            '6746fde600237a0a08d3',
            '6746fe20002e26e57729',
            ID.unique(),
            {
                name: newProduct.value.name,
                price: newProduct.value.price,
                description: newProduct.value.description,
                quantity: newProduct.value.quantity,
                rating: newProduct.value.rating,
                image: newProduct.value.image,
                imageId: newProduct.value.imageId,
                category: newProduct.value.category
            }
        )
        await fetchProducts()
        newProduct.value = {
            name: '',
            price: 0,
            description: '',
            quantity: 0,
            rating: 0,
            image: '',
            imageId: '',
            category: ''
        }
    } catch (error) {
        console.error('Failed to add product:', error)
    }
}

async function deleteProduct(id, imageId) {
    try {
        // Delete image from storage
        await storage.deleteFile('6746fe5a0036069d253f', imageId)
        // Delete product document
        await databases.deleteDocument(
            '6746fde600237a0a08d3',
            '6746fe20002e26e57729',
            id
        )
        await fetchProducts()
    } catch (error) {
        console.error('Failed to delete product:', error)
    }
}

function formatCurrency(value) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value)
}

async function analyzeImage() {
    if (!newProduct.value.image) return
    
    isAnalyzing.value = true
    predictions.value = []
    
    try {
        // Convert image URL to base64
        const response = await fetch(newProduct.value.image)
        const blob = await response.blob()
        const base64 = await new Promise((resolve) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result.split(',')[1])
            reader.readAsDataURL(blob)
        })
        
        // Call Roboflow API with base64 data
        const result = await fetch('https://detect.roboflow.com/ds1-znqts-gmcfp/3?api_key=sSLcfPO8snn8ltYQ2u1T', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: base64,
        })
        
        if (!result.ok) {
            throw new Error(`HTTP error! status: ${result.status}`)
        }
        
        const data = await result.json()
        predictions.value = data.predictions || []
        
        
        // Set category based on highest confidence prediction
        if (predictions.value.length > 0) {
            const topPrediction = predictions.value.reduce((prev, current) => 
                (current.confidence > prev.confidence) ? current : prev
            )
            newProduct.value.category = topPrediction.class
        }
        
    } catch (error) {
        console.error('Failed to analyze image:', error)
        toast.add({ 
            severity: 'error', 
            summary: 'Error', 
            detail: 'Failed to analyze image: ' + error.message, 
            life: 3000 
        })
    } finally {
        isAnalyzing.value = false
    }
}

function getBoundingBoxStyle(prediction) {
    const img = imageRef.value
    if (!img) return {}
    
    const { x, y, width, height } = prediction
    return {
        left: `${x * 100}%`,
        top: `${y * 100}%`,
        width: `${width * 100}%`,
        height: `${height * 100}%`
    }
}


</script> 