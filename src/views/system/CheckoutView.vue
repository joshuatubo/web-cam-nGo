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
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  address: '',
  rentalDuration: 1,
  paymentDetails: {
    method: 'Credit Card',
    status: 'Pending',
  },
})

const calculateTotalAmount = computed(() => {
  if (!selectedItem.value) return 0
  return selectedItem.value.rental_price_per_day * bookingDetails.rentalDuration
})

const validateBooking = computed(() => {
  return (
    bookingDetails.customerName &&
    bookingDetails.customerEmail &&
    bookingDetails.customerPhone &&
    bookingDetails.address &&
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
    // Check if customer exists, if not create new customer
    const { data: existingCustomer, error: customerCheckError } = await supabase
      .from('customers')
      .select('id')
      .eq('email', bookingDetails.customerEmail)
      .single()

    let customerId
    if (!existingCustomer) {
      const { data: newCustomer, error: createCustomerError } = await supabase
        .from('customers')
        .insert({
          email: bookingDetails.customerEmail,
          address: bookingDetails.address,
          registration_date: new Date().toISOString(),
          status: 'Active',
        })
        .select('id')
        .single()

      if (createCustomerError) throw createCustomerError
      customerId = newCustomer.id
    } else {
      customerId = existingCustomer.id
    }

    // Create rental transaction
    const rentalDate = new Date()
    const returnDate = new Date()
    returnDate.setDate(returnDate.getDate() + bookingDetails.rentalDuration)

    const { data: transaction, error: transactionError } = await supabase
      .from('rental_transactions')
      .insert({
        rental_date: rentalDate.toISOString(),
        return_date: returnDate.toISOString(),
        total_amount: calculateTotalAmount.value,
        payment_status: 'Pending',
        penalty_per_day: selectedItem.value.rental_price_per_day * 1.5, // 50% penalty rate
      })
      .select('id')
      .single()

    if (transactionError) throw transactionError

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
      .update({ status: 'Rented' })
      .eq('id', selectedItem.value.id)

    if (itemError) throw itemError

    // Remove from saved items
    savedItemsStore.removeItem(selectedItem.value.id)

    // Show success message
    alert('Booking successful! Your rental transaction has been created.')

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
                      <span class="text-h6">${{ item.rental_price_per_day.toFixed(2) }}</span>
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
            <v-card-title> Book {{ selectedItem.brand }} {{ selectedItem.model }} </v-card-title>
            <v-card-text>
              <v-form ref="form" v-model="validForm">
                <v-row>
                  <v-col cols="12">
                    <v-text-field
                      v-model="bookingDetails.customerName"
                      label="Your Name"
                      :rules="[(v) => !!v || 'Name is required']"
                      required
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      v-model="bookingDetails.customerEmail"
                      label="Email"
                      type="email"
                      :rules="[
                        (v) => !!v || 'Email is required',
                        (v) => /.+@.+\..+/.test(v) || 'Email must be valid',
                      ]"
                      required
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      v-model="bookingDetails.customerPhone"
                      label="Phone Number"
                      :rules="[(v) => !!v || 'Phone number is required']"
                      required
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-textarea
                      v-model="bookingDetails.address"
                      label="Delivery Address"
                      :rules="[(v) => !!v || 'Address is required']"
                      required
                    ></v-textarea>
                  </v-col>
                  <v-col cols="12">
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
                  <v-col cols="12">
                    <v-select
                      v-model="bookingDetails.paymentDetails.method"
                      :items="['Credit Card', 'Cash', 'Bank Transfer']"
                      label="Payment Method"
                      required
                    ></v-select>
                  </v-col>
                  <v-col cols="12">
                    <div class="text-h6">Total Amount: ${{ calculateTotalAmount.toFixed(2) }}</div>
                    <div class="text-caption">
                      Late return penalty: ${{
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
