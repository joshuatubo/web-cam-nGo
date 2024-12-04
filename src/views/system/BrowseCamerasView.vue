<script setup>
import AppLayout from '@/components/layout/AppLayout.vue'
import { ref, onMounted } from 'vue'

const cameras = ref([]) // List of cameras to display
const page = ref(1) // Current page for pagination
const totalPages = ref(1) // Total number of pages for pagination

// Mock camera data (can be fetched from an API)
const mockCameras = [
  {
    id: 1,
    name: 'Canon EOS R5',
    description: 'High-end mirrorless camera',
    image: 'https://example.com/canon.jpg',
    price: 100,
  },
  {
    id: 2,
    name: 'Nikon D850',
    description: 'Full-frame DSLR',
    image: 'https://example.com/nikon.jpg',
    price: 80,
  },
  {
    id: 3,
    name: 'Sony A7 III',
    description: 'Popular mirrorless camera',
    image: 'https://example.com/sony.jpg',
    price: 90,
  },
  {
    id: 4,
    name: 'Fujifilm X-T4',
    description: 'Compact mirrorless camera',
    image: 'https://example.com/fuji.jpg',
    price: 70,
  },
  // Add more camera objects as necessary
]

const fetchCameras = () => {
  // Simulate fetching data from an API with pagination
  cameras.value = mockCameras.slice((page.value - 1) * 4, page.value * 4)
  totalPages.value = Math.ceil(mockCameras.length / 4)
}

const viewCamera = (id) => {
  // Navigate to the detailed camera page (you can use Vue Router here)
  console.log('Viewing camera details for camera ID:', id)
}

const addToCart = (id) => {
  // Handle adding the camera to the cart (you may want to use a Vuex store or local state)
  console.log('Added camera ID to cart:', id)
}

// Fetch initial camera data when the component is mounted
onMounted(() => {
  fetchCameras()
})
</script>

<style scoped>
/* You can add custom styles for the page here */
.v-img {
  border-radius: 8px;
}
</style>
<template>
  <AppLayout>
    <template #content>
      <v-container>
        <v-row>
          <!-- Iterate through camera items and display them as cards -->
          <v-col v-for="camera in cameras" :key="camera.id" cols="12" sm="6" md="4">
            <v-card>
              <v-img :src="camera.image" height="200px" alt="Camera Image" />

              <v-card-title>
                <span>{{ camera.name }}</span>
              </v-card-title>

              <v-card-subtitle>
                <span>{{ camera.description }}</span>
              </v-card-subtitle>

              <v-card-actions>
                <v-btn color="primary" @click="viewCamera(camera.id)">View Details</v-btn>
                <v-btn color="success" @click="addToCart(camera.id)">Rent Now</v-btn>
              </v-card-actions>

              <v-card-footer>
                <span class="text-h6">${{ camera.price }} / day</span>
              </v-card-footer>
            </v-card>
          </v-col>
        </v-row>

        <!-- Pagination for the camera list -->
        <v-pagination
          v-if="cameras.length > 0"
          v-model="page"
          :length="totalPages"
          @input="fetchCameras"
        />
      </v-container>
    </template>
  </AppLayout>
</template>
