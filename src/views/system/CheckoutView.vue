<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'
import SideNavigation from '@/components/layout/SideNavigation.vue'

// Cart and User Info
const cart = ref([
  { name: 'Canon EOS R5', price: 3000, duration: 3, image: '/images/canon-eos-r5.jpg' },
  { name: 'Sony Alpha 7 IV', price: 2500, duration: 2, image: '/images/sony-alpha-7.jpg' },
])

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
const totalCost = ref(cart.value.reduce((sum, camera) => sum + camera.price * camera.duration, 0))

// Complete booking function
function completeBooking() {
  if (termsAccepted.value) {
    alert('Your booking is confirmed!')
  } else {
    alert('Please accept the terms and conditions to complete the booking.')
  }
}
</script>

<style scoped>
.checkout {
  padding: 20px;
}

.v-card {
  margin-bottom: 20px;
}

.v-btn {
  width: 100%;
}
</style>
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
                <v-row>
                  <v-col v-for="camera in cart" :key="camera.name" cols="12" sm="6" md="4">
                    <v-card>
                      <v-img :src="camera.image" :alt="camera.name" height="200px" />
                      <v-card-title>{{ camera.name }}</v-card-title>
                      <v-card-subtitle>
                        Price: {{ camera.price }} | Duration: {{ camera.duration }} days
                      </v-card-subtitle>
                      <v-card-text>Total: ₱{{ camera.price * camera.duration }}</v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- User Information Section -->
        <v-row>
          <v-col cols="12">
            <v-card>
              <v-card-title>
                <v-typography variant="h2">Personal Information</v-typography>
              </v-card-title>
              <v-card-text>
                <v-form>
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
                </v-form>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Pickup and Delivery Section and Payment Information Section in one row -->
        <v-row>
          <!-- Pickup and Delivery Section -->
          <v-col cols="12" sm="6">
            <v-card>
              <v-card-title>
                <v-typography variant="h2">Pickup and Delivery Options</v-typography>
              </v-card-title>
              <v-card-text>
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
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Payment Information Section -->
          <v-col cols="12" sm="6">
            <v-card>
              <v-card-title>
                <v-typography variant="h2">Payment Information</v-typography>
              </v-card-title>
              <v-card-text>
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
                <br />
                <br />
                <br />
                <br />
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Terms and Conditions Section -->
        <v-row>
          <v-col cols="12">
            <v-card>
              <v-card-title>
                <v-typography variant="h2">Terms & Conditions</v-typography>
              </v-card-title>
              <v-card-text>
                <v-checkbox
                  v-model="termsAccepted"
                  label="I agree to the Terms & Conditions and Privacy Policy."
                  required
                ></v-checkbox>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Final Confirmation Section -->
        <v-row>
          <v-col cols="12">
            <v-btn :disabled="!termsAccepted" color="primary" @click="completeBooking">
              Complete Booking
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </template>
  </AppLayout>
</template>
