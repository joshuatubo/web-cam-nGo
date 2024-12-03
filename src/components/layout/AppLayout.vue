<!-- <script setup>
import { ref, onMounted } from 'vue'

const theme = ref(localStorage.getItem('theme') || 'dark') // Get the stored theme or default to 'dark'

// Function to toggle theme when switch is clicked
function onClick() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
  localStorage.setItem('theme', theme.value) // Store the theme preference in localStorage
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

    
        <v-btn
          :icon="theme === 'light' ? 'mdi-weather-sunny' : 'mdi-weather-night'"
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
</template> -->
<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

// Theme setup
const theme = ref(localStorage.getItem('theme') || 'dark')
const route = useRoute()

function toggleTheme() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
  localStorage.setItem('theme', theme.value)
}

onMounted(() => {
  document.body.setAttribute('data-theme', theme.value)
})

// Check if we are on the login page to prevent layout change
const isLoginPage = route.path === '/auth/login'
</script>

<template>
  <v-responsive>
    <v-app :theme="theme">
      <!-- Navigation Bar -->
      <v-app-bar
        app
        :color="theme === 'dark' ? 'grey-darken-5' : 'grey-lighten-1'"
        flat
        elevate-on-scroll
      >
        <v-toolbar-title class="ml-2">Cam'N Go</v-toolbar-title>

        <!-- Spacer to push right-side icons -->
        <v-spacer></v-spacer>

        <!-- Search Bar -->
        <v-card-text>
          <v-text-field
            :loading="loading"
            append-inner-icon="mdi-magnify"
            density="compact"
            label="Search Camera"
            variant="solo"
            hide-details
            single-line
            @click:append-inner="onClick"
          ></v-text-field>
        </v-card-text>

        <!-- Profile Picture with Dropdown -->
        <v-menu offset-y>
          <template #activator="{ props }">
            <v-avatar v-bind="props" size="32">
              <v-img
                src="/images/logo.png"
                alt="Logo"
                :width="mobile ? '75%' : '45%'"
                class="d-block mx-auto"
              ></v-img>
            </v-avatar>
          </template>
          <v-list>
            <v-list-item>
              <v-list-item-title>Profile</v-list-item-title>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>Settings</v-list-item-title>
            </v-list-item>
            <v-divider></v-divider>
            <v-list-item>
              <v-list-item-title>Logout</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>

        <!-- Theme Toggle -->
        <v-btn
          :icon="theme === 'light' ? 'mdi-weather-sunny' : 'mdi-weather-night'"
          @click="toggleTheme"
        ></v-btn>
      </v-app-bar>

      <!-- Main Content -->
      <v-main>
        <slot name="content"></slot>
      </v-main>

      <!-- Footer -->
      <v-footer
        class="text-center"
        :color="theme === 'dark' ? 'grey-darken-5' : 'grey-lighten-1'"
        app
      >
        2024 - Copyright
      </v-footer>
    </v-app>
  </v-responsive>
</template>
