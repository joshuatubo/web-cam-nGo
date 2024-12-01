<script setup>
import { ref, onMounted } from 'vue'

const theme = ref(localStorage.getItem('theme') || 'dark')

function onClick() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
  localStorage.setItem('theme', theme.value)
}

onMounted(() => {
  document.body.setAttribute('data-theme', theme.value)
})
</script>

<template>
  <v-responsive>
    <v-app :theme="theme">
      <v-app-bar class="px-7" :color="theme === 'dark' ? 'grey-darken-5' : 'grey-lighten-1'">
        <v-spacer></v-spacer>
        <v-btn
          :icon="theme === 'light' ? 'mdi-weather-sunny' : 'mdi-weather-night'"
          variant="elevated"
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
