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
<script setup>
import { RouterLink } from 'vue-router'
import { ref } from 'vue'

const theme = ref('light')

function onClick() {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
}
</script>

<template>
  <v-app :theme="theme">
    <v-container>
      <!-- Navbar -->
      <v-app-bar app>
        <v-btn icon @click="drawer = !drawer">
          <v-icon>mdi-menu</v-icon>
        </v-btn>
        <v-img max-height="40" max-width="40" src="img/logo.png" class="mr-2"></v-img>
        <v-toolbar-title>Cam'n GO</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn
          :icon="theme === 'light' ? 'mdi-weather-sunny' : 'mdi-weather-night'"
          variant="elevated"
          slim
          @click="onClick"
        ></v-btn>
        <v-btn text @click="showLoginDialog = true">LOG IN</v-btn>
      </v-app-bar>

      <!-- Navigation Drawer -->
      <v-navigation-drawer v-model="drawer" app>
        <v-list>
          <v-list-item href="#">Home</v-list-item>
          <v-list-item href="#">Portfolio</v-list-item>
          <v-list-item href="#">Courses</v-list-item>
          <v-list-item href="#">About us</v-list-item>
          <v-list-item href="#">Contact us</v-list-item>
        </v-list>
      </v-navigation-drawer>

      <v-main>
        <v-container>
          <slot name="content"></slot>
        </v-container>
      </v-main>
    </v-container>
  </v-app>
</template>
