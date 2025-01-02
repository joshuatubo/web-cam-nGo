<!-- <script setup>
import { ref } from 'vue'
import { useDisplay } from 'vuetify'

import AppLayout from '@/components/layout/AppLayout.vue'

// Sample Data
const cameras = ref([
  { id: 1, name: 'Canon EOS 5D', price: 150, image: '/images/camera1.jpg', available: true },
  { id: 2, name: 'Sony A7 III', price: 100, image: '/images/camera2.jpg', available: true },
  { id: 3, name: 'Nikon D850', price: 120, image: '/images/camera3.jpg', available: false },
])

const rentals = ref([
  { id: 1, camera: 'Canon EOS 5D', status: 'Active', dueDate: '2024-12-05' },
  { id: 2, camera: 'Sony A7 III', status: 'Completed', dueDate: '2024-11-25' },
])

const { mobile } = useDisplay()
</script>

<template>
  <AppLayout>
    <template #content>
      <v-app>

        <v-app-bar app color="primary" dark>
          <v-toolbar-title>Camera Rental Dashboard</v-toolbar-title>
        </v-app-bar>


        <v-main>
          <v-container>

            <v-row class="mb-6">
              <v-col>
                <v-card color="blue lighten-4" elevation="8">
                  <v-card-title> Welcome to Camera Rentals! </v-card-title>
                  <v-card-text>
                    Browse from our collection of premium cameras and manage your rentals with ease.
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>


            <v-row>
              <v-col cols="12">
                <h4>Available Cameras</h4>
              </v-col>
              <v-col v-for="camera in cameras" :key="camera.id" cols="12" sm="6" md="4">
                <v-card class="pa-4" elevation="2">
                  <v-img :src="camera.image" height="200px"></v-img>
                  <v-card-title class="text-h6">{{ camera.name }}</v-card-title>
                  <v-card-subtitle>Price: ${{ camera.price }} / day</v-card-subtitle>
                  <v-card-actions>
                    <v-btn color="primary" :disabled="!camera.available">
                      {{ camera.available ? 'Rent Now' : 'Unavailable' }}
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-col>
            </v-row>


            <v-row class="mt-10">
              <v-col cols="12">
                <h4>My Rentals</h4>
                <v-data-table :headers="rentalHeaders" :items="rentals" class="elevation-1">
                  <template v-slot:top>
                    <v-toolbar flat>
                      <v-toolbar-title>Rental History</v-toolbar-title>
                    </v-toolbar>
                  </template>
                </v-data-table>
              </v-col>
            </v-row>
          </v-container>
        </v-main>
      </v-app>
    </template>
  </AppLayout>
</template>

<script>
export default {
  data() {
    return {
      rentalHeaders: [
        { text: 'Camera', value: 'camera' },
        { text: 'Status', value: 'status' },
        { text: 'Due Date', value: 'dueDate' },
      ],
    }
  },
}
</script>

<style scoped>
.v-card {
  border-radius: 12px;
}

h4 {
  font-family: 'Roboto', sans-serif;
  font-weight: bold;
}
</style> -->
