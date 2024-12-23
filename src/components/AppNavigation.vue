<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getUserInformation, isAuthenticated, supabase } from '@/utilities/supabase'

const router = useRouter()
const drawer = ref(true)
const isAdmin = ref(false)
const userEmail = ref('')

const checkAdminStatus = async () => {
  const userInfo = await getUserInformation()
  isAdmin.value = userInfo?.is_admin || false
  userEmail.value = userInfo?.email || ''
}

const handleSignOut = async () => {
  try {
    await supabase.auth.signOut()
    router.push('/login')
  } catch (error) {
    console.error('Error signing out:', error)
  }
}

onMounted(async () => {
  await checkAdminStatus()
})

// Navigation items based on user role
const adminItems = [
  {
    title: 'Dashboard',
    icon: 'mdi-view-dashboard',
    to: '/system/dashboard'
  },
  {
    title: 'Browse Cameras',
    icon: 'mdi-camera',
    to: '/browse'
  },
  {
    title: 'Rental Management',
    icon: 'mdi-clipboard-list',
    to: '/admin/rentals'
  },
  {
    title: 'Provider',
    icon: 'mdi-account-group',
    to: '/provider'
  }
]

const userItems = [
  {
    title: 'Dashboard',
    icon: 'mdi-view-dashboard',
    to: '/system/dashboard'
  },
  {
    title: 'Browse Cameras',
    icon: 'mdi-camera',
    to: '/browse'
  },
  {
    title: 'My Rentals',
    icon: 'mdi-camera-timer',
    to: '/my-rentals'
  },
  {
    title: 'Saved Items',
    icon: 'mdi-bookmark-multiple',
    to: '/checkout'
  }
]
</script>

<template>
  <v-navigation-drawer
    v-model="drawer"
    permanent
    :rail="!drawer"
    location="left"
    @click="drawer = !drawer"
  >
    <v-list-item
      :prepend-avatar="isAdmin ? 'mdi-shield-account' : 'mdi-account-circle'"
      :title="userEmail"
      :subtitle="isAdmin ? 'Administrator' : 'User'"
    >
      <template v-slot:append>
        <v-btn
          variant="text"
          icon="mdi-chevron-left"
          @click.stop="drawer = !drawer"
        ></v-btn>
      </template>
    </v-list-item>

    <v-divider></v-divider>

    <v-list density="compact" nav>
      <v-list-item
        v-for="item in isAdmin ? adminItems : userItems"
        :key="item.title"
        :value="item.title"
        :to="item.to"
        :prepend-icon="item.icon"
        :title="item.title"
      ></v-list-item>

      <v-divider class="my-2"></v-divider>

      <!-- Sign Out Button -->
      <v-list-item
        @click="handleSignOut"
        prepend-icon="mdi-logout"
        title="Sign Out"
        color="error"
      ></v-list-item>
    </v-list>

    <!-- Bottom Status -->
    <template v-slot:bottom>
      <div class="pa-2">
        <v-chip
          :color="isAdmin ? 'success' : 'primary'"
          size="small"
          class="mb-2"
        >
          {{ isAdmin ? 'Admin Mode' : 'User Mode' }}
        </v-chip>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<style scoped>
.v-navigation-drawer {
  transition: width 0.2s ease-out;
}
</style>
