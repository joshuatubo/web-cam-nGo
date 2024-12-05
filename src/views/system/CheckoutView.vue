<script setup>
import { ref, computed } from 'vue'
import '@/assets/checkout_style.css'
import AppLayout from '@/components/layout/AppLayout.vue'

// Cart and User Info
const cart = ref([
  { name: 'Canon EOS R5', price: 3000, duration: 3, image: '/images/canon-eos-r5.jpg' },
  { name: 'Sony Alpha 7 IV', price: 2500, duration: 2, image: '/images/sony-alpha-7.jpg' },
  { name: 'Nikon Z6 II', price: 2700, duration: 4, image: '/images/nikon-z6.jpg' },
  { name: 'Fujifilm X-T4', price: 2200, duration: 2, image: '/images/fujifilm-xt4.jpg' },
])

// Scrolling Logic for Rental Summary
const currentStartIndex = ref(0)
const visibleCount = ref(3)

const currentEndIndex = computed(() => currentStartIndex.value + visibleCount.value)
const visibleCameras = computed(() =>
  cart.value.slice(currentStartIndex.value, currentEndIndex.value),
)

function scrollLeft() {
  currentStartIndex.value = Math.max(currentStartIndex.value - 1, 0)
}

function scrollRight() {
  if (currentEndIndex.value < cart.value.length) {
    currentStartIndex.value++
  }
}

// User Information
const user = ref({
  name: '',
  email: '',
  phone: '',
  address: '',
})

// Pickup locations and payment methods
const pickupLocations = ['Makati', 'Quezon City', 'Pasig']
const paymentMethods = ['Credit/Debit Card', 'PayPal', 'Cash on Delivery']

// User selections
const pickupLocation = ref('')
const pickupDate = ref('')
const paymentMethod = ref('')
const cardNumber = ref('')
const expiryDate = ref('')
const cvv = ref('')
const termsAccepted = ref(false)

// Total cost calculation
const totalCost = computed(() =>
  cart.value.reduce((sum, camera) => sum + camera.price * camera.duration, 0),
)

// Complete booking function
function completeBooking() {
  if (termsAccepted.value) {
    alert('Your booking is confirmed!')
  } else {
    alert('Please accept the terms and conditions to complete the booking.')
  }
}
</script>

<template>
  <AppLayout>
    <template #content>
      <v-container class="checkout">
        <v-row>
          <!-- Page Title -->
          <v-col cols="12">
            <v-typography variant="h1" align="center">Checkout</v-typography>
            <v-typography variant="subtitle1" align="center">
              Review your rental details and complete your booking.
            </v-typography>
          </v-col>
        </v-row>

        <!-- Rental Summary Section -->
        <v-row>
          <v-col cols="12">
            <v-card>
              <v-card-title>
                <v-typography variant="h2">Your Rental Summary</v-typography>
              </v-card-title>
              <v-card-text>
                <!-- Row for Cameras and Arrow Buttons -->
                <v-row align="center" justify="center">
                  <!-- Arrow Button: Scroll Left -->
                  <v-col cols="auto">
                    <v-btn icon @click="scrollLeft" :disabled="currentStartIndex === 0">
                      <v-icon>mdi-chevron-left</v-icon>
                    </v-btn>
                  </v-col>

                  <!-- Cameras List (Dynamic) -->
                  <v-col>
                    <v-row>
                      <v-col
                        v-for="camera in visibleCameras"
                        :key="camera.name"
                        cols="12"
                        sm="6"
                        md="4"
                      >
                        <v-card>
                          <v-img :src="camera.image" :alt="camera.name" height="200px" />
                          <v-card-title>{{ camera.name }}</v-card-title>
                          <v-card-subtitle>
                            Price: ₱{{ camera.price }} | Duration: {{ camera.duration }} days
                          </v-card-subtitle>
                          <v-card-text>Total: ₱{{ camera.price * camera.duration }}</v-card-text>
                        </v-card>
                      </v-col>
                    </v-row>
                  </v-col>

                  <!-- Arrow Button: Scroll Right -->
                  <v-col cols="auto">
                    <v-btn icon @click="scrollRight" :disabled="currentEndIndex >= cart.length">
                      <v-icon>mdi-chevron-right</v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-row>
          <!-- Form Card -->
          <v-col cols="12">
            <v-card>
              <v-card-title>
                <v-typography variant="h2">Booking Information</v-typography>
              </v-card-title>
              <v-card-text>
                <v-form>
                  <!-- Personal Information Section -->
                  <v-row>
                    <v-col cols="12" md="6">
                      <v-text-field v-model="user.name" label="Full Name" required></v-text-field>
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="user.email"
                        label="Email Address"
                        type="email"
                        required
                      ></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="user.phone"
                        label="Phone Number"
                        type="tel"
                        required
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-text-field v-model="user.address" label="Delivery Address"></v-text-field>
                    </v-col>
                  </v-row>

                  <!-- Pickup and Delivery Section -->
                  <v-row>
                    <v-col cols="12" sm="6">
                      <v-select
                        v-model="pickupLocation"
                        :items="pickupLocations"
                        label="Select Pickup Location"
                        required
                      ></v-select>
                      <v-text-field
                        v-model="pickupDate"
                        label="Select Pickup Date"
                        type="date"
                        required
                      ></v-text-field>
                    </v-col>

                    <!-- Payment Information Section -->
                    <v-col cols="12" sm="6">
                      <v-select
                        v-model="paymentMethod"
                        :items="paymentMethods"
                        label="Select Payment Method"
                        required
                      ></v-select>

                      <v-text-field
                        v-if="paymentMethod === 'creditCard'"
                        v-model="cardNumber"
                        label="Card Number"
                        type="text"
                        required
                      ></v-text-field>

                      <v-text-field
                        v-if="paymentMethod === 'creditCard'"
                        v-model="expiryDate"
                        label="Expiry Date"
                        type="text"
                        required
                      ></v-text-field>

                      <v-text-field
                        v-if="paymentMethod === 'creditCard'"
                        v-model="cvv"
                        label="CVV"
                        type="text"
                        required
                      ></v-text-field>

                      <v-typography variant="h6">Total: ₱{{ totalCost }}</v-typography>
                    </v-col>
                  </v-row>

                  <!-- Terms and Conditions Section -->
                  <v-row>
                    <v-col cols="6">
                      <v-checkbox
                        v-model="termsAccepted"
                        label="I agree to the Terms & Conditions and Privacy Policy."
                        required
                      ></v-checkbox>
                    </v-col>
                    <!-- Final Confirmation Section -->
                    <v-col cols="6">
                      <v-btn :disabled="!termsAccepted" color="primary" @click="completeBooking">
                        Complete Booking
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-form>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </template>
  </AppLayout>
</template>
