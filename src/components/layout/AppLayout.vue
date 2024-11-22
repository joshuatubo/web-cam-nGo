<!-- <script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

const theme = ref('light')

function onClick() {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
}
</script>


<template>
  <v-responsive class="border rounded">
    <v-app :theme="theme">
      <v-app-bar class="px-3" color="grey-lighten-3">
        <v-spacer></v-spacer>

        <v-btn
          :prepend-icon="theme === 'light' ? 'mdi-weather-sunny' : 'mdi-weather-night'"
          text="Toggle Theme"
          slim
          @click="onClick"
        ></v-btn>
      </v-app-bar>

      <v-main>
        <v-container>
          <slot name="content"></slot>
        </v-container>
      </v-main>

      <v-footer class="d-flex flex-column" app>
        <div class="bg-blue-grey d-flex w-100 align-center px-4">
          <strong>Get connected with us on social networks!</strong>

          <v-spacer></v-spacer>

          <v-btn
            v-for="icon in icons"
            :key="icon"
            :icon="icon"
            class="mx-4"
            size="small"
            variant="plain"
          ></v-btn>
        </div>

        <div class="px-4 py-2 bg-black text-center w-100">
          {{ new Date().getFullYear() }} — <strong> Cam'n Go</strong>
        </div>
      </v-footer>
    </v-app>
  </v-responsive>
</template>
 -->
