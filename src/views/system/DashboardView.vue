<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/utilities/supabaseClient'
import AppLayout from '@/components/layout/AppLayout.vue'
import SideNavigation from '@/components/layout/SideNavigation.vue'

const isDrawerVisible = ref(true)
const loading = ref(true)
const camerasAvailable = ref([])
const activeRentals = ref([])
const rentalHistory = ref([])
const currentCustomerId = ref(null)

// Fetch current customer ID
const fetchCurrentCustomer = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data: customerData } = await supabase
      .from('customers')
      .select('id')
      .eq('user_id', user.id)
      .single()
    
    if (customerData) {
      currentCustomerId.value = customerData.id
    }
  }
}

// Fetch available cameras
const fetchAvailableCameras = async () => {
  try {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('status', 'Available')

    if (error) throw error
    camerasAvailable.value = data
  } catch (error) {
    console.error('Error fetching cameras:', error)
  }
}

// Fetch active rentals for the current user
const fetchActiveRentals = async () => {
  if (!currentCustomerId.value) return

  try {
    const { data, error } = await supabase
      .from('rental_transactions')
      .select(`
        id,
        rental_date,
        return_date,
        total_amount,
        payment_status,
        rental_details (
          rental_duration,
          items (
            brand,
            model,
            status,
            image
          )
        )
      `)
      .eq('customers.id', currentCustomerId.value)
      .eq('rental_details.items.status', 'Rented')

    if (error) throw error
    activeRentals.value = data
  } catch (error) {
    console.error('Error fetching active rentals:', error)
  }
}

// Fetch rental history for the current user
const fetchRentalHistory = async () => {
  if (!currentCustomerId.value) return

  try {
    const { data, error } = await supabase
      .from('rental_transactions')
      .select(`
        id,
        rental_date,
        return_date,
        total_amount,
        payment_status,
        rental_details (
          rental_duration,
          late_fee,
          items (
            brand,
            model,
            status,
            image
          )
        ),
        feedbacks (
          rating,
          comment
        )
      `)
      .eq('customers.id', currentCustomerId.value)
      .eq('rental_details.items.status', 'Returned')
      .order('return_date', { ascending: false })
      .limit(5)

    if (error) throw error
    rentalHistory.value = data
  } catch (error) {
    console.error('Error fetching rental history:', error)
  }
}

// Router for navigation
const router = useRouter()

// Navigate to browse page with the selected camera
const viewCamera = (camera) => {
  router.push({
    name: 'browse',
    query: { selected: camera.id }
  })
}

onMounted(async () => {
  loading.value = true
  await fetchCurrentCustomer()
  await Promise.all([
    fetchAvailableCameras(),
    fetchActiveRentals(),
    fetchRentalHistory()
  ])
  loading.value = false
})
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
      <v-container>
        <!-- Dashboard Header -->
        <v-row>
          <v-col cols="12">
            <v-card class="mb-4">
              <v-card-text class="text-center">
                <h1 class="text-h4 mb-2">Welcome to Cam'n Go</h1>
                <p class="text-subtitle-1">Rent the perfect camera for your next project!</p>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Loading State -->
        <v-row v-if="loading">
          <v-col cols="12" class="text-center">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
          </v-col>
        </v-row>

        <template v-else>
          <!-- Available Cameras Section -->
          <v-row>
            <v-col cols="12">
              <h2 class="text-h5 mb-4">Available Cameras for Rent</h2>
              <v-row>
                <v-col
                  v-for="camera in camerasAvailable"
                  :key="camera.id"
                  cols="12"
                  sm="6"
                  md="4"
                >
                  <v-card>
                    <v-img
                      :src="camera.image"
                      :alt="camera.brand"
                      height="200"
                      cover
                      class="bg-grey-lighten-2"
                    >
                      <template v-slot:placeholder>
                        <v-row class="fill-height ma-0" align="center" justify="center">
                          <v-progress-circular indeterminate color="grey-lighten-5"></v-progress-circular>
                        </v-row>
                      </template>
                    </v-img>

                    <v-card-title>{{ camera.brand }} {{ camera.model }}</v-card-title>
                    <v-card-text>
                      <p class="mb-2">Price: ₱{{ camera.rental_price_perday }}/day</p>
                      <p>{{ camera.specification }}</p>
                    </v-card-text>

                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn color="primary" @click="viewCamera(camera)">
                        View Details
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-col>
              </v-row>
            </v-col>
          </v-row>

          <!-- Active Rentals Section -->
          <v-row class="mt-6">
            <v-col cols="12">
              <h2 class="text-h5 mb-4">Your Active Rentals</h2>
              <v-row v-if="activeRentals.length">
                <v-col
                  v-for="rental in activeRentals"
                  :key="rental.id"
                  cols="12"
                  sm="6"
                  md="4"
                >
                  <v-card>
                    <v-img
                      :src="rental.rental_details.items.image"
                      height="200"
                      cover
                      class="bg-grey-lighten-2"
                    ></v-img>

                    <v-card-title>
                      {{ rental.rental_details.items.brand }}
                      {{ rental.rental_details.items.model }}
                    </v-card-title>

                    <v-card-text>
                      <p>Due Date: {{ new Date(rental.return_date).toLocaleDateString() }}</p>
                      <p>Duration: {{ rental.rental_details.rental_duration }} days</p>
                      <v-chip
                        :color="new Date() > new Date(rental.return_date) ? 'error' : 'success'"
                      >
                        {{ new Date() > new Date(rental.return_date) ? 'Overdue' : 'On Time' }}
                      </v-chip>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
              <v-card v-else>
                <v-card-text class="text-center">
                  No active rentals at the moment.
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <!-- Rental History Section -->
          <v-row class="mt-6">
            <v-col cols="12">
              <h2 class="text-h5 mb-4">Recent Rental History</h2>
              <v-row v-if="rentalHistory.length">
                <v-col
                  v-for="rental in rentalHistory"
                  :key="rental.id"
                  cols="12"
                  sm="6"
                  md="4"
                >
                  <v-card>
                    <v-img
                      :src="rental.rental_details.items.image"
                      height="200"
                      cover
                      class="bg-grey-lighten-2"
                    ></v-img>

                    <v-card-title>
                      {{ rental.rental_details.items.brand }}
                      {{ rental.rental_details.items.model }}
                    </v-card-title>

                    <v-card-text>
                      <p>Returned: {{ new Date(rental.return_date).toLocaleDateString() }}</p>
                      <p>Total Amount: ₱{{ rental.total_amount.toFixed(2) }}</p>
                      
                      <template v-if="rental.feedbacks">
                        <div class="mt-2">
                          <div class="text-subtitle-2">Your Rating</div>
                          <v-rating
                            v-model="rental.feedbacks.rating"
                            readonly
                            density="compact"
                            color="warning"
                          ></v-rating>
                        </div>
                      </template>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
              <v-card v-else>
                <v-card-text class="text-center">
                  No rental history available.
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </template>
      </v-container>
    </template>
  </AppLayout>
</template>

<style scoped>
.v-card {
  transition: transform 0.2s;
}

.v-card:hover {
  transform: translateY(-4px);
}
</style>
