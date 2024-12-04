<script setup>
import ProfileHeader from './ProfileHeader.vue'
import '@/assets/theme_style.css'

//import { useAuthUserStore } from '@/stores/authUser'
import { ref, onMounted } from 'vue'
import { useDisplay } from 'vuetify'
import { isAuthenticated } from '@/utilities/supabase'

// For drawer
//const props = defineProps(['isWithAppBarNavIcon'])

//const emit = defineEmits(['isDrawerVisible', 'theme'])

// Utilize pre-defined vue functions
//const { xs, sm, mobile } = useDisplay()

// Use Pinia Store
//const authStore = useAuthUserStore()

// Load Variables
const isLoggedIn = ref(false)
//const isMobileLogged = ref(false)
//const isDesktop = ref(false)

// Get Authentication status from supabase (needed for loading)
const getLoggedStatus = async () => {
  isLoggedIn.value = await isAuthenticated()
}

//isMobileLogged.value = mobile.value && isLoggedIn.value
//isDesktop.value = !mobile.value && (isLoggedIn.value || !isLoggedIn.value)
//}

// Load Functions during component rendering
//onMounted(() => {
//getLoggedStatus()
//})

// For theme toggle
const theme = ref(localStorage.getItem('theme') ?? 'light')
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
    <v-card :theme="theme"
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

        <v-main style="height: 100vh">
          <slot name="content"> </slot>
        </v-main>
        <v-footer
          class="text-center d-flex flex-column font-weight-medium"
          :color="theme === 'dark' ? 'grey-darken-5' : 'grey-lighten-1'"
          border
          app
          elevation="24"
          >2024 - Copyright</v-footer
        >
      </v-layout>
    </v-card>
  </v-responsive>
</template>

