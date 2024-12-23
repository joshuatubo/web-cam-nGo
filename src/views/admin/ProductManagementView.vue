<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/utilities/supabase'

const items = ref([])
const loading = ref(false)
const showAddDialog = ref(false)
const showEditDialog = ref(false)
const selectedFile = ref(null)
const previewUrl = ref('')
const editingItem = ref(null) // To store the item being edited

// Form data for new item and editing item
const newItem = ref({
  brand: '',
  model: '',
  specification: '',
  rental_price_per_day: '',
  status: 'Available',
  serial_number: '', // Added serial_number
})
const formErrors = ref({})
const statusOptions = ['Available', 'Rented', 'Out of Stock']

// Get all items
const getItems = async () => {
  try {
    loading.value = true
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('id', { ascending: true })

    if (error) throw error
    items.value = data
  } catch (error) {
    console.error('Error fetching items:', error.message)
  } finally {
    loading.value = false
  }
}

// Handle image selection - ONLY preview, no storage interaction
const handleImageUpload = (event) => {
  const file = event.target.files[0]

  selectedFile.value = null
  previewUrl.value = ''
  formErrors.value.image = ''

  if (!file) return

  if (!file.type.startsWith('image/')) {
    formErrors.value.image = 'Please upload a valid image file'
    return
  }

  selectedFile.value = file
  previewUrl.value = URL.createObjectURL(file)
}

// Add new item
const addItem = async () => {
  try {
    formErrors.value = {}
    if (!newItem.value.brand) formErrors.value.brand = 'Brand is required'
    if (!newItem.value.model) formErrors.value.model = 'Model is required'
    if (!newItem.value.specification) formErrors.value.specification = 'Specification is required'
    if (!newItem.value.rental_price_per_day)
      formErrors.value.rental_price_per_day = 'Rental price per day is required'
    if (!newItem.value.serial_number) formErrors.value.serial_number = 'Serial number is required' // Validate serial number
    if (!selectedFile.value) formErrors.value.image = 'Image is required'

    if (Object.keys(formErrors.value).length > 0) return

    loading.value = true

    const bucketName = 'images'
    const timestamp = new Date().getTime()
    const random = Math.random().toString(36).substring(2, 15)
    const fileExt = selectedFile.value.name.split('.').pop().toLowerCase()
    const fileName = `${timestamp}-${random}.${fileExt}`
    const filePath = `items/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, selectedFile.value, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) throw uploadError

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucketName).getPublicUrl(filePath)

    const { error: dbError } = await supabase.from('items').insert([
      {
        brand: newItem.value.brand,
        model: newItem.value.model,
        specification: newItem.value.specification,
        rental_price_per_day: parseFloat(newItem.value.rental_price_per_day),
        status: newItem.value.status,
        serial_number: newItem.value.serial_number, // Add serial_number to the database
        image: publicUrl,
      },
    ])

    if (dbError) throw dbError

    handleDialogClose()
    await getItems()
  } catch (error) {
    console.error('Error adding item:', error)
    formErrors.value.image = `Failed to add item: ${error.message}`
  } finally {
    loading.value = false
  }
}

// Update existing item
const updateItem = async () => {
  try {
    formErrors.value = {}

    // Validation
    if (!editingItem.value.brand) formErrors.value.brand = 'Brand is required'
    if (!editingItem.value.model) formErrors.value.model = 'Model is required'
    if (!editingItem.value.specification)
      formErrors.value.specification = 'Specification is required'
    if (!editingItem.value.rental_price_per_day)
      formErrors.value.rental_price_per_day = 'Rental price per day is required'
    if (!editingItem.value.serial_number)
      formErrors.value.serial_number = 'Serial number is required' // Validate serial number

    if (Object.keys(formErrors.value).length > 0) return

    loading.value = true

    // If a new image is selected, upload it
    let imageUrl = editingItem.value.image
    if (selectedFile.value) {
      const bucketName = 'images'
      const timestamp = new Date().getTime()
      const random = Math.random().toString(36).substring(2, 15)
      const fileExt = selectedFile.value.name.split('.').pop().toLowerCase()
      const fileName = `${timestamp}-${random}.${fileExt}`
      const filePath = `items/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, selectedFile.value, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from(bucketName).getPublicUrl(filePath)
      imageUrl = publicUrl
    }

    const { error: dbError } = await supabase
      .from('items')
      .update({
        brand: editingItem.value.brand,
        model: editingItem.value.model,
        specification: editingItem.value.specification,
        rental_price_per_day: parseFloat(editingItem.value.rental_price_per_day),
        status: editingItem.value.status,
        serial_number: editingItem.value.serial_number, // Update serial_number
        image: imageUrl,
      })
      .eq('id', editingItem.value.id)

    if (dbError) throw dbError

    // After successful update, close the dialog and refresh the items list
    await getItems()
    showEditDialog.value = false // Close the dialog here after success
  } catch (error) {
    console.error('Error updating item:', error)
    formErrors.value.image = `Failed to update item: ${error.message}`
  } finally {
    loading.value = false
  }
}

// Clean up when dialog closes
const handleDialogClose = () => {
  selectedFile.value = null
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = ''
  }
  formErrors.value = {}
  editingItem.value = null // Reset editing item
}

// Open edit dialog with selected item data
const openEditDialog = (item) => {
  editingItem.value = { ...item }
  showEditDialog.value = true
}

// Delete item
const deleteItem = async (item) => {
  try {
    loading.value = true

    if (item.image) {
      const imagePath = item.image.split('/').pop()
      const { error: deleteImageError } = await supabase.storage
        .from('images')
        .remove([`items/${imagePath}`])

      if (deleteImageError) throw deleteImageError
    }

    const { error: deleteItemError } = await supabase.from('items').delete().eq('id', item.id)

    if (deleteItemError) throw deleteItemError

    await getItems()
  } catch (error) {
    console.error('Error in delete operation:', error)
    alert(`Failed to delete item: ${error.message}`)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  getItems()
})
</script>

<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <span>Items Management</span>
            <v-btn color="primary" @click="showAddDialog = true" :loading="loading">
              Add New Item
            </v-btn>
          </v-card-title>

          <v-card-text>
            <v-table>
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Brand</th>
                  <th>Model</th>
                  <th>Specification</th>
                  <th>Rental Price/Day</th>
                  <th>Status</th>
                  <th>Serial Number</th>
                  <!-- Added column for serial_number -->
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in items" :key="item.id">
                  <td><v-img :src="item.image" width="50" height="50" cover></v-img></td>
                  <td>{{ item.brand }}</td>
                  <td>{{ item.model }}</td>
                  <td>{{ item.specification }}</td>
                  <td>${{ item.rental_price_per_day }}</td>
                  <td>{{ item.status }}</td>
                  <td>{{ item.serial_number }}</td>
                  <!-- Display serial_number -->
                  <td>
                    <v-btn icon color="primary" @click="openEditDialog(item)" :loading="loading">
                      <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn icon color="error" @click="deleteItem(item)" :loading="loading">
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Edit Item Dialog -->
    <v-dialog v-model="showEditDialog" max-width="600px">
      <v-card>
        <v-card-title>Edit Item</v-card-title>
        <v-card-text>
          <v-form>
            <v-row>
              <v-col cols="6">
                <v-text-field
                  v-model="editingItem.brand"
                  label="Brand"
                  required
                  :error-messages="formErrors.brand"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="editingItem.model"
                  label="Model"
                  required
                  :error-messages="formErrors.model"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="editingItem.specification"
                  label="Specification"
                  required
                  :error-messages="formErrors.specification"
                ></v-textarea>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="editingItem.rental_price_per_day"
                  label="Rental Price per Day"
                  type="number"
                  required
                  :error-messages="formErrors.rental_price_per_day"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-select
                  v-model="editingItem.status"
                  :items="statusOptions"
                  label="Status"
                  required
                  :error-messages="formErrors.status"
                ></v-select>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="editingItem.serial_number"
                  label="Serial Number"
                  required
                  :error-messages="formErrors.serial_number"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-file-input
                  label="Upload Image"
                  v-model="selectedFile"
                  accept="image/*"
                  :error-messages="formErrors.image"
                  @change="handleImageUpload"
                ></v-file-input>
                <v-img v-if="previewUrl" :src="previewUrl" height="200"></v-img>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn text @click="showEditDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="updateItem" :loading="loading">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Add Item Dialog -->
    <v-dialog v-model="showAddDialog" max-width="600px">
      <v-card>
        <v-card-title>Add New Item</v-card-title>
        <v-card-text>
          <v-form>
            <v-row>
              <v-col cols="6">
                <v-text-field
                  v-model="newItem.brand"
                  label="Brand"
                  required
                  :error-messages="formErrors.brand"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="newItem.model"
                  label="Model"
                  required
                  :error-messages="formErrors.model"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="newItem.specification"
                  label="Specification"
                  required
                  :error-messages="formErrors.specification"
                ></v-textarea>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="newItem.rental_price_per_day"
                  label="Rental Price per Day"
                  type="number"
                  required
                  :error-messages="formErrors.rental_price_per_day"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-select
                  v-model="newItem.status"
                  :items="statusOptions"
                  label="Status"
                  required
                  :error-messages="formErrors.status"
                ></v-select>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="newItem.serial_number"
                  label="Serial Number"
                  required
                  :error-messages="formErrors.serial_number"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-file-input
                  label="Upload Image"
                  v-model="selectedFile"
                  accept="image/*"
                  :error-messages="formErrors.image"
                  @change="handleImageUpload"
                ></v-file-input>
                <v-img v-if="previewUrl" :src="previewUrl" height="200"></v-img>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn text @click="showAddDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="addItem" :loading="loading">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
