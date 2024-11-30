<script setup>
<<<<<<< HEAD
import { ref } from 'vue'
const theme = ref(localStorage.getItem('theme') ?? 'dark')
=======
import { ref, onMounted } from 'vue'
>>>>>>> 7d3009753df6cd6e9f6ba07f9491eba95b7b1f77

const theme = ref(localStorage.getItem('theme') || 'dark') // Get the stored theme or default to 'dark'

// Function to toggle theme when switch is clicked
function onClick() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
<<<<<<< HEAD
  localStorage.setItem('theme', theme.value)
=======
  localStorage.setItem('theme', theme.value) // Store the theme preference in localStorage
>>>>>>> 7d3009753df6cd6e9f6ba07f9491eba95b7b1f77
}

// On mount, apply the theme from localStorage if available
onMounted(() => {
  document.body.setAttribute('data-theme', theme.value)
})
</script>

<template>
  <v-responsive>
    <v-app :theme="theme">
      <v-app-bar class="px-7" :color="theme === 'dark' ? 'grey-darken-5' : 'grey-lighten-1'">
        <v-spacer></v-spacer>

        <!-- Theme switch button -->
        <v-btn
          :prepend-icon="theme === 'light' ? 'mdi-weather-sunny' : 'mdi-weather-night'"
          slim
          @click="onClick"
        ></v-btn>
      </v-app-bar>

      <v-main>
        <slot name="content"></slot>
      </v-main>

      <v-footer
        class="text-center d-flex flex-column"
        :color="theme === 'dark' ? 'grey-darken-5' : 'grey-lighten-1'"
        border
        app
        elevation="24"
        >2024 - Copyright</v-footer
      >
    </v-app>
  </v-responsive>
</template>
