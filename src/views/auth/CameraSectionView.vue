<script setup>
import AppLayout from '@/components/layout/AppLayout.vue'
import { ref, computed } from 'vue'

// Sample Camera Data
const cameras = ref([
  {
    id: 1,
    name: 'Canon EOS 5D',
    price: 150,
    image: '/images/camera1.jpg',
    description: 'A professional-grade DSLR with exceptional image quality.',
    available: true,
  },
  {
    id: 2,
    name: 'Sony A7 III',
    price: 100,
    image: '/images/camera2.jpg',
    description: 'A full-frame mirrorless camera ideal for low-light photography.',
    available: true,
  },
  {
    id: 3,
    name: 'Nikon D850',
    price: 120,
    image: '/images/camera3.jpg',
    description: 'A versatile DSLR with outstanding resolution and speed.',
    available: false,
  },
  {
    id: 4,
    name: 'Fujifilm X-T4',
    price: 90,
    image: '/images/camera4.jpg',
    description: 'A compact mirrorless camera perfect for videographers.',
    available: true,
  },
])

// Filter for Availability
const showAvailable = ref(false)

const filteredCameras = computed(() => {
  return showAvailable.value ? cameras.value.filter((camera) => camera.available) : cameras.value
})

// Function to Rent a Camera
function rentCamera(camera) {
  alert(`You selected to rent: ${camera.name}`)
}
</script>

<template>
  <AppLayout>
    <template #content>
      <v-container>
        <!-- Header -->
        <v-row align="center" justify="space-between" class="mb-6">
          <h3 class="text-h5 font-weight-bold">Browse Cameras</h3>
          <v-switch v-model="showAvailable" label="Show Available Only"></v-switch>
        </v-row>

        <!-- Camera Grid -->
        <v-row>
          <v-col v-for="camera in filteredCameras" :key="camera.id" cols="12" sm="6" md="4">
            <v-card class="hover-card pa-3" elevation="3">
              <!-- Camera Image -->
              <v-img :src="camera.image" height="200px" class="rounded"></v-img>

              <!-- Camera Info -->
              <v-card-title>{{ camera.name }}</v-card-title>
              <v-card-subtitle>Price: ${{ camera.price }} / day</v-card-subtitle>
              <v-card-text class="text-truncate">
                {{ camera.description }}
              </v-card-text>
              <span class="availability" :class="camera.available ? 'text-success' : 'text-error'">
                {{ camera.available ? 'Available' : 'Unavailable' }}
              </span>

              <!-- Actions -->
              <v-card-actions>
                <v-btn color="primary" :disabled="!camera.available" @click="rentCamera(camera)">
                  Rent Now
                </v-btn>
                <v-btn text color="secondary"> Details </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </template>
  </AppLayout>
</template>

<style scoped>
/* Style for hover effects */
.hover-card {
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}
.hover-card:hover {
  transform: translateY(-5px);
  box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.2);
}

.availability {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
}

.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
