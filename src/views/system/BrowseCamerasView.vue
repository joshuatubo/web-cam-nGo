<script setup>
import AppLayout from '@/components/layout/AppLayout.vue'
import { ref, onMounted } from 'vue'

const cameras = ref([]) // Full list of cameras
const filteredCameras = ref([]) // Filtered list of cameras based on availability
const cameraFilter = ref('all') // Track the current filter state
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
    isAvailable: true,
  },
  {
    id: 2,
    name: 'Nikon D850',
    description: 'Full-frame DSLR',
    image: 'https://example.com/nikon.jpg',
    price: 80,
    isAvailable: false,
  },
  {
    id: 3,
    name: 'Sony A7 III',
    description: 'Popular mirrorless camera',
    image: 'https://example.com/sony.jpg',
    price: 90,
    isAvailable: true,
  },
  {
    id: 4,
    name: 'Fujifilm X-T4',
    description: 'Compact mirrorless camera',
    image: 'https://example.com/fuji.jpg',
    price: 70,
    isAvailable: false,
  },
  // Add more camera objects as necessary
]

const fetchCameras = () => {
  // Simulate fetching data from an API with pagination
  const camerasPerPage = 4
  filteredCameras.value = mockCameras.slice(
    (page.value - 1) * camerasPerPage,
    page.value * camerasPerPage,
  )
  totalPages.value = Math.ceil(mockCameras.length / camerasPerPage)
}

const filterCameras = (filter) => {
  cameraFilter.value = filter
  if (filter === 'available') {
    filteredCameras.value = mockCameras.filter((camera) => camera.isAvailable)
  } else if (filter === 'unavailable') {
    filteredCameras.value = mockCameras.filter((camera) => !camera.isAvailable)
  } else {
    filteredCameras.value = mockCameras
  }
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
  filterCameras(cameraFilter.value) // Apply the initial filter
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
        <!-- Filter Buttons -->
        <v-row class="mb-4">
          <v-col>
            <v-btn
              color="primary"
              @click="filterCameras('available')"
              :class="{ 'v-btn--active': cameraFilter === 'available' }"
            >
              Show Available Cameras
            </v-btn>
          </v-col>
          <v-col>
            <v-btn
              color="error"
              @click="filterCameras('unavailable')"
              :class="{ 'v-btn--active': cameraFilter === 'unavailable' }"
            >
              Show Unavailable Cameras
            </v-btn>
          </v-col>
          <v-col>
            <v-btn
              color="default"
              @click="filterCameras('all')"
              :class="{ 'v-btn--active': cameraFilter === 'all' }"
            >
              Show All Cameras
            </v-btn>
          </v-col>
        </v-row>

        <!-- Camera Cards -->
        <v-row>
          <!-- Iterate through the filtered camera list and display them as cards -->
          <v-col v-for="camera in filteredCameras" :key="camera.id" cols="12" sm="6" md="4">
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
                <v-btn color="success" @click="addToCart(camera.id)" :disabled="!camera.isAvailable"
                  >Rent Now</v-btn
                >
              </v-card-actions>

              <v-card-footer>
                <span class="text-h6">${{ camera.price }} / day</span>
                <v-chip :color="camera.isAvailable ? 'green' : 'red'" text-color="white">
                  {{ camera.isAvailable ? 'Available' : 'Unavailable' }}
                </v-chip>
              </v-card-footer>
            </v-card>
          </v-col>
        </v-row>

        <!-- Pagination -->
        <v-pagination
          v-if="filteredCameras.length > 0"
          v-model="page"
          :length="totalPages"
          @input="fetchCameras"
        />
      </v-container>
    </template>
  </AppLayout>
</template>
