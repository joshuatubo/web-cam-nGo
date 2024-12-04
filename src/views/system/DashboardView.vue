<script setup>
import AppLayout from '@/components/layout/AppLayout.vue'
import { ref } from 'vue'
import SideNavigation from '@/components/layout/SideNavigation.vue'

const isDrawerVisible = ref(true)

// Sample data for cameras available for rent
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

// Sample data for active rentals
const activeRentals = ref([{ name: 'Canon EOS R5', dueDate: '2024-12-08', status: 'On Time' }])

// Sample data for rental history
const rentalHistory = ref([
  { name: 'Sony Alpha 7 III', returnDate: '2024-11-28', status: 'Completed' },
  { name: 'Fujifilm X-T4', returnDate: '2024-11-15', status: 'Completed' },
])
</script>

<template>
  <AppLayout
    :is-with-app-bar-nav-icon="true"
    @is-drawer-visible="isDrawerVisible = !isDrawerVisible"
  >
    <template #navigation>
      <SideNavigation :is-drawer-visible="isDrawerVisible"> </SideNavigation>
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
              <button class="rent-button">Rent Now</button>
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

<style scoped>
.dashboard {
  padding: 20px;
  font-family: Arial, sans-serif;
}

.dashboard-header {
  text-align: center;
  margin-bottom: 20px;
}

.dashboard-header h1 {
  font-size: 24px;
}

.dashboard-header p {
  font-size: 16px;
  color: #666;
}

.browse-cameras {
  margin-bottom: 30px;
}

.browse-cameras h2 {
  font-size: 20px;
  margin-bottom: 10px;
}

.camera-grid {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.camera-card {
  flex: 1 1 calc(33.333% - 20px);
  background: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
  padding: 15px;
}

.camera-image {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
}

.rent-button {
  margin-top: 10px;
  padding: 10px 15px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.rent-button:hover {
  background-color: #0056b3;
}

.active-rentals,
.rental-history {
  margin-bottom: 30px;
}

.rentals-list,
.history-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.rental-card,
.history-card {
  flex: 1 1 calc(50% - 20px);
  background: #f9f9f9;
  border: 1px solid #ddd;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.status {
  font-weight: bold;
  color: green;
}
</style>
