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

// Add to Cart function
</script>
<template>
  <AppLayout>
    <template #content>
      <div class="dashboard" style="height: 100vh">
        <!-- Dashboard Header -->
        <header class="dashboard-header">
          <h1>Welcome to Cam'n Go</h1>
          <p>Rent the perfect camera for your next project!</p>
        </header>

        <!-- Browse Cameras Section -->

        <!-- Active Rentals Section -->

        <!-- Rental History Section -->
      </div>
    </template>
  </AppLayout>
</template>
