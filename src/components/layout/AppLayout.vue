<script setup>
import { ref } from 'vue'
const theme = ref('dark')

function onClick() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
}
</script>

<template>
  <v-responsive>
    <v-app :theme="theme">
      <v-app-bar class="px-7" :color="theme === 'dark' ? 'grey-darken-5' : 'grey-lighten-1'">
        <v-spacer></v-spacer>

        <v-switch color="primary" slim @click="onClick" variant="elevated"> </v-switch>
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
