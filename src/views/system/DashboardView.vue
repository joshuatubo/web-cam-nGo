<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import '@/assets/dashboard_style.css'
import AppLayout from '@/components/layout/AppLayout.vue'
import SideNavigation from '@/components/layout/SideNavigation.vue'

const isDrawerVisible = ref(true)

const camerasAvailable = ref([
  {
    name: 'Canon EOS R5',
    price: '₱3,000/day',
    location: 'Makati',
    image: '/images/canon-eos-r5.jpg',
  },
  {
    name: 'Sony Alpha 7 IV',
    price: '₱2,500/day',
    location: 'Quezon City',
    image: '/images/sony-alpha-7.jpg',
  },
  { name: 'Nikon Z7 II', price: '₱2,800/day', location: 'Pasig', image: '/images/nikon-z7.jpg' },
])

const activeRentals = ref([{ name: 'Canon EOS R5', dueDate: '2024-12-08', status: 'On Time' }])
const rentalHistory = ref([
  { name: 'Sony Alpha 7 III', returnDate: '2024-11-28', status: 'Completed' },
  { name: 'Fujifilm X-T4', returnDate: '2024-11-15', status: 'Completed' },
])

// Cart state
const cart = ref([])

// Router for navigating to CartView
const router = useRouter()

// Add to Cart function
function addToCart(camera) {
  cart.value.push(camera)
  // Optional: Navigate to CartView after adding item
  router.push({ name: 'CartView', query: { cart: JSON.stringify(cart.value) } })
}
</script>
<template>
  <AppLayout
    :is-with-app-bar-nav-icon="true"
    @is-drawer-visible="isDrawerVisible = !isDrawerVisible"
  >
    <template #navigation>
      <SideNavigation :is-drawer-visible="isDrawerVisible" />
    </template>

    <template #content>
      <div class="dashboard">
        <!-- Dashboard Header -->
        <header class="dashboard-header">
          <h1>Welcome to Cam'n Go</h1>
          <p>Rent the perfect camera for your next project!</p>
        </header>

        <!-- Browse Cameras Section -->
        <section class="browse-cameras">
          <h2>Available Cameras for Rent</h2>
          <div class="camera-grid">
            <div v-for="camera in camerasAvailable" :key="camera.name" class="camera-card">
              <img :src="camera.image" :alt="camera.name" class="camera-image" />
              <h3>{{ camera.name }}</h3>
              <p>Price: {{ camera.price }}</p>
              <p>Location: {{ camera.location }}</p>
              <button class="rent-button" @click="addToCart(camera)">Add to Cart</button>
            </div>
          </div>
        </section>

        <!-- Active Rentals Section -->
        <section class="active-rentals">
          <h2>Your Active Rentals</h2>
          <div v-if="activeRentals.length" class="rentals-list">
            <div v-for="rental in activeRentals" :key="rental.name" class="rental-card">
              <h3>{{ rental.name }}</h3>
              <p>Due Date: {{ rental.dueDate }}</p>
              <p>
                Status: <span class="status">{{ rental.status }}</span>
              </p>
            </div>
          </div>
          <p v-else>No active rentals at the moment.</p>
        </section>

        <!-- Rental History Section -->
        <section class="rental-history">
          <h2>Rental History</h2>
          <div v-if="rentalHistory.length" class="history-list">
            <div v-for="history in rentalHistory" :key="history.name" class="history-card">
              <h3>{{ history.name }}</h3>
              <p>Returned On: {{ history.returnDate }}</p>
              <p>
                Status: <span class="status">{{ history.status }}</span>
              </p>
            </div>
          </div>
          <p v-else>You haven't rented any cameras yet.</p>
        </section>
      </div>
    </template>
  </AppLayout>
</template>
