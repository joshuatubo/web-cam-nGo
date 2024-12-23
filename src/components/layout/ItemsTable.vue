<template>
  <AppLayout>
    <template #content>
      <div>
        <v-card flat>
          <!-- Title and Search -->
          <v-card-title class="d-flex align-center pe-2">
            <v-icon icon="mdi-video-input-component"></v-icon>&nbsp; Find a Product

            <v-spacer></v-spacer>
            <v-text-field
              v-model="search"
              density="compact"
              label="Search"
              prepend-inner-icon="mdi-magnify"
              variant="solo-filled"
              flat
              hide-details
              single-line
            ></v-text-field>
          </v-card-title>

          <v-divider></v-divider>

          <!-- Data Table -->
          <v-data-table :items="filteredProducts" :headers="headers" item-key="id">
            <!-- Product Brand -->
            <template v-slot:item.brand="{ item }">
              <div>{{ item.brand }}</div>
            </template>

            <!-- Product Model -->
            <template v-slot:item.model="{ item }">
              <div>{{ item.model }}</div>
            </template>

            <!-- Product Specification -->
            <template v-slot:item.specification="{ item }">
              <div>{{ item.specification }}</div>
            </template>

            <!-- Product Rental Price -->
            <template v-slot:item.rental_price_per_day="{ item }">
              <div>${{ item.rental_price_per_day.toFixed(2) }}</div>
            </template>

            <!-- Product Status -->
            <template v-slot:item.status="{ item }">
              <v-chip
                :color="item.status === 'Available' ? 'green' : 'red'"
                class="text-uppercase"
                size="small"
                label
              >
                {{ item.status }}
              </v-chip>
            </template>

            <!-- Product Serial Number -->
            <template v-slot:item.serial_number="{ item }">
              <div>{{ item.serial_number }}</div>
            </template>

            <!-- Product Image -->
            <template v-slot:item.image="{ item }">
              <v-card class="my-2" elevation="2" rounded>
                <v-img :src="item.image" height="64" cover></v-img>
              </v-card>
            </template>

            <!-- Edit & Delete Actions -->
            <template v-slot:item.actions="{ item }">
              <v-btn
                icon
                size="small"
                color="primary"
                @click="editProduct(item)"
                title="Edit Product"
              >
                <v-icon icon="mdi-pencil"></v-icon>
              </v-btn>
              <v-btn
                icon
                size="small"
                color="red"
                @click="deleteProduct(item)"
                title="Delete Product"
              >
                <v-icon icon="mdi-trash-can"></v-icon>
              </v-btn>
            </template>
          </v-data-table>
        </v-card>

        <!-- Edit Dialog -->
        <v-dialog v-model="dialog" max-width="600">
          <v-card>
            <v-card-title>Edit Product</v-card-title>
            <v-card-text>
              <v-row dense>
                <!-- Product Brand -->
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="selectedProduct.brand"
                    label="Brand*"
                    required
                  ></v-text-field>
                </v-col>

                <!-- Product Model -->
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="selectedProduct.model"
                    label="Model*"
                    required
                  ></v-text-field>
                </v-col>

                <!-- Product Specification -->
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="selectedProduct.specification"
                    label="Specification*"
                    required
                  ></v-text-field>
                </v-col>

                <!-- Product Rental Price -->
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="selectedProduct.rental_price_per_day"
                    label="Rental Price per Day*"
                    type="number"
                    required
                  ></v-text-field>
                </v-col>

                <!-- Product Status -->
                <v-col cols="12" md="6">
                  <v-select
                    v-model="selectedProduct.status"
                    :items="['Available', 'Rented', 'Out of Stock']"
                    label="Status"
                    required
                  ></v-select>
                </v-col>

                <!-- Product Serial Number -->
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="selectedProduct.serial_number"
                    label="Serial Number*"
                    required
                  ></v-text-field>
                </v-col>

                <!-- Product Image -->
                <v-col cols="12" md="6">
                  <v-file-input
                    v-model="selectedProduct.image"
                    accept="image/*"
                    label="Product Image"
                    prepend-icon="mdi-camera"
                  ></v-file-input>
                </v-col>
              </v-row>
              <small class="text-caption text-medium-emphasis">*indicates required field</small>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn variant="plain" @click="dialog = false">Cancel</v-btn>
              <v-btn variant="tonal" color="primary" @click="saveProduct">Save</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </div>
    </template>
  </AppLayout>
</template>
<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { supabase } from '@/utilities/supabaseClient'
import AppLayout from './AppLayout.vue'

const search = ref('')
const products = ref([])
const dialog = ref(false)
const selectedProduct = ref({}) // Holds the product being edited
let inventorySubscription = null

// Table Headers
const headers = ref([
  { title: 'Brand', key: 'brand' },
  { title: 'Model', key: 'model' },
  { title: 'Specification', key: 'specification' },
  { title: 'Rental Price per Day', key: 'rental_price_per_day' },
  { title: 'Status', key: 'status' },
  { title: 'Serial Number', key: 'serial_number' },
  { title: 'Image', key: 'image', sortable: false },
  { title: 'Actions', key: 'actions', sortable: false },
])

// Filtered products based on search input
const filteredProducts = computed(() => {
  return products.value.filter((product) => {
    return (
      product.brand.toLowerCase().includes(search.value.toLowerCase()) ||
      product.model.toLowerCase().includes(search.value.toLowerCase()) ||
      product.serial_number.toLowerCase().includes(search.value.toLowerCase()) ||
      product.status.toLowerCase().includes(search.value.toLowerCase()) ||
      product.specification.toLowerCase().includes(search.value.toLowerCase())
    )
  })
})

// Fetch products from Supabase
const fetchProducts = async () => {
  try {
    const { data, error } = await supabase
      .from('items')
      .select('id, brand, model, specification, rental_price_per_day, status, serial_number, image')
    if (error) throw error

    products.value = data.map((item) => ({
      id: item.id,
      brand: item.brand,
      model: item.model,
      specification: item.specification,
      rental_price_per_day: item.rental_price_per_day || 0.0,
      status: item.status || 'unavailable',
      serial_number: item.serial_number,
      image: item.image,
    }))
  } catch (error) {
    console.error('Error fetching products:', error)
  }
}

// Edit Product Handler
const editProduct = (item) => {
  selectedProduct.value = { ...item }
  dialog.value = true
}

// Save Product Changes
const saveProduct = async () => {
  try {
    let imageUrl = selectedProduct.value.image // Keep the existing image URL if no new file is uploaded

    // Check if a new image file is provided
    if (selectedProduct.value.image instanceof File) {
      const file = selectedProduct.value.image

      // Generate a unique file name for the image
      const fileName = `public/${Date.now()}_${file.name}`

      // Upload the image to Supabase storage
      const { error: uploadError } = await supabase.storage.from('items').upload(fileName, file)

      if (uploadError) {
        console.error('Image upload error:', uploadError)
        throw uploadError
      }

      // Fetch the public URL for the uploaded image
      const { data: publicUrlData, error: publicUrlError } = supabase.storage
        .from('items')
        .getPublicUrl(fileName)

      if (publicUrlError || !publicUrlData) {
        console.error('Error fetching public URL:', publicUrlError)
        throw publicUrlError
      }

      // Update image URL with the newly uploaded image
      imageUrl = publicUrlData.publicUrl
    }

    // Prepare data for update
    const { id, ...updatedData } = selectedProduct.value
    updatedData.image = imageUrl

    // Update the product in Supabase
    const { error } = await supabase.from('items').update(updatedData).eq('id', id)

    if (error) {
      console.error('Error updating product:', error)
      throw error
    }

    console.log('Product updated successfully')
    await fetchProducts() // Refresh product list
  } catch (error) {
    console.error('Error saving product:', error)
  } finally {
    dialog.value = false
  }
}

// Delete Product Handler
const deleteProduct = async (item) => {
  try {
    const { error } = await supabase.from('items').delete().eq('id', item.id)
    if (error) throw error

    console.log('Product deleted successfully')
    fetchProducts() // Refresh product list
  } catch (error) {
    console.error('Error deleting product:', error)
  }
}

// Subscribe to inventory changes
const listenToInventoryChanges = () => {
  inventorySubscription = supabase
    .channel('custom-inventory-channel')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'items' }, async () => {
      await fetchProducts()
    })
    .subscribe()
}

// Stop Subscription
const stopInventorySubscription = () => {
  if (inventorySubscription) {
    supabase.removeChannel(inventorySubscription)
  }
}

// Lifecycle Hooks
onMounted(() => {
  fetchProducts()
  listenToInventoryChanges()
})

onBeforeUnmount(() => {
  stopInventorySubscription()
})
</script>
