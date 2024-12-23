<script setup>
import { RouterView, useRoute } from 'vue-router'
import AppNavigation from '@/components/AppNavigation.vue'
import { ref, computed } from 'vue'
import { isAuthenticated } from '@/utilities/supabase'

const route = useRoute()
const isLoggedIn = ref(false)

// Check if current route is a public route (login/register)
const isPublicRoute = computed(() => {
  return ['login', 'register', 'forbidden', 'not-found'].includes(route.name)
})

// Check authentication status
const checkAuth = async () => {
  isLoggedIn.value = await isAuthenticated()
}

checkAuth()
</script>

<template>
  <v-app>
    <!-- Show navigation only for authenticated users and non-public routes -->
    <!-- <template v-if="isLoggedIn && !isPublicRoute">
      <AppNavigation />
    </template> -->

    <!-- Main Content -->
    <v-main>
      <v-container fluid>
        <RouterView />
      </v-container>
    </v-main>
  </v-app>
</template>

<style>
.v-main {
  min-height: 100vh;
  background-color: #f5f5f5;
}
</style>
