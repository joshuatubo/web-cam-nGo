<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  camera: {
    type: Object,
    required: true,
  },
  addToCart: {
    type: Function,
    required: true,
  },
})
</script>

<template>
  <v-card>
    <v-img :src="camera.image" height="200px" alt="Camera Image" class="white--text align-end">
      <v-card-title>{{ camera.name }}</v-card-title>
    </v-img>
    <v-card-subtitle>{{ camera.description }}</v-card-subtitle>
    <v-card-actions>
      <v-btn color="primary" class="w-50" @click="addToCart(camera)">Add to Cart</v-btn>
    </v-card-actions>
    <v-card-footer>
      <span class="text-h6">₱{{ camera.price }} / day</span>
      <v-chip :color="camera.isAvailable ? 'green' : 'red'" text-color="white">
        {{ camera.isAvailable ? 'Available' : 'Unavailable' }}
      </v-chip>
    </v-card-footer>
  </v-card>
</template>
