<script setup>
import { ref, reactive, computed } from 'vue'
import { useSavedItemsStore } from '@/stores/savedItems'
import { supabase } from '@/utilities/supabaseClient'
import AppLayout from '@/components/layout/AppLayout.vue'

const savedItemsStore = useSavedItemsStore()
const savedItems = computed(() => savedItemsStore.savedItems)
const bookingDialog = ref(false)
const selectedItem = ref(null)
const validForm = ref(false)
const form = ref(null)
const isBooking = ref(false)

const bookingDetails = reactive({
  F_name: '',
  L_name: '',
  email: '',
  phone_number: '',
  address: '',
  paymentDetails: {
    method: 'Credit Card',
  },
  rentalDuration: 1,
})

const calculateTotalAmount = computed(() => {
  if (!selectedItem.value) return 0
  return selectedItem.value.rental_price_per_day * bookingDetails.rentalDuration
})

const validateBooking = computed(() => {
  return (
    bookingDetails.F_name &&
    bookingDetails.L_name &&
    bookingDetails.email &&
    bookingDetails.address &&
    bookingDetails.phone_number &&
    bookingDetails.rentalDuration > 0
  )
})

const openBookingDialog = (item) => {
  selectedItem.value = item
  bookingDialog.value = true
}

const submitBooking = async () => {
  if (!validForm.value || !validateBooking.value) {
    alert('Please fill in all required fields')
    return
  }

  isBooking.value = true
  try {
    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError) throw userError

    // Update customer record
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .upsert({
        user_id: user.id,
        email: bookingDetails.email,
        F_name: bookingDetails.F_name,
        L_name: bookingDetails.L_name,
        address: bookingDetails.address,
        phone_number: bookingDetails.phone_number,
        status: 'Active',
        registration_date: new Date().toISOString()
      })
      .select()
      .single()

    if (customerError) throw customerError

    // Create rental transaction
    const rentalDate = new Date()
    const returnDate = new Date()
    returnDate.setDate(returnDate.getDate() + bookingDetails.rentalDuration)

    const { data: transaction, error: transactionError } = await supabase
      .from('rental_transactions')
      .insert({
        customer_id: customer.id,
        rental_date: rentalDate.toISOString(),
        return_date: returnDate.toISOString(),
        total_amount: calculateTotalAmount.value,
        payment_status: 'Pending',
        penalty_per_day: selectedItem.value.rental_price_per_day * 1.5, // 50% penalty rate
      })
      .select('id')
      .single()

    if (transactionError) throw transactionError

    // Create rental item entry
    const { error: rentalItemError } = await supabase.from('rental_items').insert({
      rental_transaction_id: transaction.id,
      customer_id: customer.id,
      item_id: selectedItem.value.id,
      status: 'Pending',
      created_at: new Date().toISOString()
    })

    if (rentalItemError) throw rentalItemError

    // Create rental details
    const { error: detailsError } = await supabase.from('rental_details').insert({
      rental_transaction_id: transaction.id,
      item_id: selectedItem.value.id,
      quantity: 1,
      rental_duration: bookingDetails.rentalDuration,
      payment_details: bookingDetails.paymentDetails,
      return_date: returnDate.toISOString(),
      late_fee: 0,
    })

    if (detailsError) throw detailsError

    // Update item status
    const { error: itemError } = await supabase
      .from('items')
      .update({ status: 'Pending' })
      .eq('id', selectedItem.value.id)

    if (itemError) throw itemError

    // Remove from saved items
    savedItemsStore.removeItem(selectedItem.value.id)

    // Show success message
    alert('Booking submitted successfully! Waiting for admin approval.')

    // Close dialog and reset form
    bookingDialog.value = false
    Object.keys(bookingDetails).forEach((key) => {
      if (typeof bookingDetails[key] !== 'object') {
        bookingDetails[key] = ''
      }
    })
    bookingDetails.rentalDuration = 1
    form.value?.reset()
  } catch (error) {
    console.error('Error submitting booking:', error)
    alert(error.message || 'Error submitting booking. Please try again.')
  } finally {
    isBooking.value = false
  }
}
</script>
<template>
  <AppLayout>
    <template #content>
      <div>
        <v-card flat>
          <v-card-title class="d-flex align-center">
            <v-icon icon="mdi-bookmark-multiple" class="me-2"></v-icon>
            Saved Items
          </v-card-title>
          <v-divider></v-divider>

          <v-container>
            <v-row v-if="savedItems.length > 0">
              <v-col v-for="item in savedItems" :key="item.id" cols="12" sm="6" md="4">
                <v-card class="my-2" elevation="2" @click="openBookingDialog(item)">
                  <v-img :src="item.image" height="200" cover></v-img>
                  <v-card-title class="text-truncate"
                    >{{ item.brand }} {{ item.model }}</v-card-title
                  >
                  <v-card-subtitle class="text-truncate">{{ item.specification }}</v-card-subtitle>
                  <v-card-text>
                    <div class="d-flex align-center mb-2">
                      <span class="text-h6">₱{{ item.rental_price_per_day.toFixed(2) }}</span>
                      <span class="text-subtitle-1 ms-1">/day</span>
                    </div>
                    <v-chip
                      :color="
                        item.status === 'Available'
                          ? 'success'
                          : item.status === 'Rented'
                            ? 'info'
                            : 'error'
                      "
                      :text="item.status"
                      size="small"
                      variant="tonal"
                    ></v-chip>
                  </v-card-text>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                      color="error"
                      variant="text"
                      @click.stop="savedItemsStore.removeItem(item.id)"
                    >
                      <v-icon>mdi-bookmark-remove</v-icon>
                      Remove
                    </v-btn>
                    <v-btn color="primary" variant="tonal" @click.stop="openBookingDialog(item)">
                      <v-icon>mdi-calendar-check</v-icon>
                      Book Now
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-col>
            </v-row>
            <v-row v-else>
              <v-col cols="12" class="text-center">
                <v-icon icon="mdi-bookmark-outline" size="64" color="grey"></v-icon>
                <p class="text-h6 mt-4">No saved items</p>
                <p class="text-subtitle-1 text-medium-emphasis">
                  Browse cameras and save items to book them later
                </p>
              </v-col>
            </v-row>
          </v-container>
        </v-card>

        <!-- Booking Dialog -->
        <v-dialog v-model="bookingDialog" max-width="500">
          <v-card v-if="selectedItem">
            <v-card-title>Book {{ selectedItem.brand }} {{ selectedItem.model }}</v-card-title>
            <v-card-text>
              <v-form ref="form" v-model="validForm">
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="bookingDetails.F_name"
                      label="First Name"
                      :rules="[(v) => !!v || 'First name is required']"
                      required
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="bookingDetails.L_name"
                      label="Last Name"
                      :rules="[(v) => !!v || 'Last name is required']"
                      required
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      v-model="bookingDetails.address"
                      label="Address"
                      type="address"
                      :rules="[(v) => !!v || 'Address is required']"
                      required
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      v-model="bookingDetails.email"
                      label="Email"
                      type="email"
                      :rules="[
                        (v) => !!v || 'Email is required',
                        (v) => /.+@.+\..+/.test(v) || 'Email must be valid',
                      ]"
                      required
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      v-model="bookingDetails.phone_number"
                      label="Phone Number"
                      :rules="[(v) => !!v || 'Phone number is required']"
                      required
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      v-model.number="bookingDetails.rentalDuration"
                      label="Rental Duration (Days)"
                      type="number"
                      min="1"
                      :rules="[
                        (v) => !!v || 'Duration is required',
                        (v) => v > 0 || 'Duration must be at least 1 day',
                      ]"
                      required
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-select
                      v-model="bookingDetails.paymentDetails.method"
                      :items="['Credit Card', 'Cash', 'Bank Transfer']"
                      label="Payment Method"
                      required
                    ></v-select>
                  </v-col>
                  <v-col cols="6">
                    <div class="text-h6">Total Amount: ₱{{ calculateTotalAmount.toFixed(2) }}</div>
                    <div class="text-caption">
                      Late return penalty: ₱{{
                        (selectedItem.rental_price_per_day * 1.5).toFixed(2)
                      }}/day
                    </div>
                  </v-col>
                </v-row>
              </v-form>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="error" variant="text" @click="bookingDialog = false">Cancel</v-btn>
              <v-btn
                color="primary"
                :loading="isBooking"
                :disabled="!validForm || !validateBooking"
                @click="submitBooking"
              >
                Confirm Booking
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </div>
    </template>
  </AppLayout>
</template>
