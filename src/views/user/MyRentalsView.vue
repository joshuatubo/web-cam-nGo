<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/utilities/supabaseClient'
import AppLayout from '@/components/layout/AppLayout.vue'

const loading = ref(false)
const rentalItems = ref([])
const snackbar = ref(false)
const snackbarMessage = ref('')
const feedbackDialog = ref(false)
const detailsDialog = ref(false)
const lostItemDialog = ref(false)
const selectedRentalItem = ref(null)
const feedback = ref({
  rating: 0,
  comment: '',
})
const lostItemPayment = ref({
  amount: 0,
  payment_method: 'credit_card',
  notes: '',
})

//const rentalDuration = ref(null) // Define rentalDuration as a reactive variable

/*
const rules = {
  required: (v) => !!v || 'This field is required',
  rating: (v) => v > 0 || 'Please provide a rating',
}*/

// Payment methods available
const paymentMethods = [
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'gcash', label: 'GCash' },
  { value: 'maya', label: 'Maya' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
]

const openFeedbackDialog = (rentalItem) => {
  selectedRentalItem.value = rentalItem
  feedback.value = {
    rating: 0,
    comment: '',
  }
  feedbackDialog.value = true
  detailsDialog.value = false // Close details dialog when opening feedback dialog
}

const openDetailsDialog = (rentalItem) => {
  selectedRentalItem.value = rentalItem
  detailsDialog.value = true
}

const closeDetailsDialog = () => {
  detailsDialog.value = false
  selectedRentalItem.value = null
}

const openLostItemDialog = (rentalItem) => {
  selectedRentalItem.value = rentalItem
  // Set the payment amount to the item's value or a default multiplier of the rental price
  lostItemPayment.value.amount =
    rentalItem.items.item_value || rentalItem.items.rental_price_per_day * 30
  lostItemDialog.value = true
}

const submitFeedback = async () => {
  if (!selectedRentalItem.value || feedback.value.rating === 0) {
    snackbarMessage.value = 'Please provide a rating'
    snackbar.value = true
    return
  }

  try {
    loading.value = true

    // Create new feedback record using the customer_id from the selected rental
    const { data: feedbackData, error: createError } = await supabase
      .from('feedback')
      .insert({
        item_id: selectedRentalItem.value.items.id,
        customer_id: selectedRentalItem.value.customer_id,
        feedback_date: new Date().toISOString(),
        rating: feedback.value.rating,
        comment: feedback.value.comment || '',
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating feedback:', createError)
      throw createError
    }

    // Update rental transaction with feedback ID
    const { error: updateError } = await supabase
      .from('rental_transactions')
      .update({ feedbacks_id: feedbackData.id })
      .eq('id', selectedRentalItem.value.rental_transaction_id)

    if (updateError) {
      console.error('Error updating rental transaction:', updateError)
      throw updateError
    }

    console.log('Feedback submitted successfully:', feedbackData)

    // Close dialogs and reset form
    feedbackDialog.value = false
    detailsDialog.value = false
    feedback.value = { rating: 0, comment: '' }
    selectedRentalItem.value = null

    // Show success message
    snackbarMessage.value = 'Thank you for your feedback!'
    snackbar.value = true

    // Refresh the rentals list to show new feedback
    await fetchUserRentalItems()
  } catch (error) {
    console.error('Error submitting feedback:', error)
    snackbarMessage.value = 'Error submitting feedback: ' + error.message
    snackbar.value = true
  } finally {
    loading.value = false
  }
}

const submitLostItemPayment = async () => {
  if (!selectedRentalItem.value || !lostItemPayment.value.amount) {
    snackbarMessage.value = 'Please provide payment details'
    snackbar.value = true
    return
  }

  try {
    loading.value = true

    // Debug logging
    console.log(
      'Selected rental item full object:',
      JSON.stringify(selectedRentalItem.value, null, 2),
    )
    console.log('Rental item ID:', selectedRentalItem.value.id)
    console.log('Customer ID:', selectedRentalItem.value.customer_id)
    console.log('Item ID:', selectedRentalItem.value.items.id)

    // First, let's get the rental item's UUID from the rental_items table
    const { data: rentalItemData, error: rentalItemError } = await supabase
      .from('rental_items')
      .select('id')
      .eq('id', selectedRentalItem.value.id)
      .single()

    if (rentalItemError) {
      console.error('Error fetching rental item:', rentalItemError)
      throw rentalItemError
    }

    if (!rentalItemData) {
      throw new Error('Rental item not found')
    }

    console.log('Fetched rental item data:', rentalItemData)

    // Create lost item payment record
    const { data: paymentData, error: paymentError } = await supabase
      .from('lost_item_payments')
      .insert({
        rental_item_id: rentalItemData.id, // Use the UUID from the fetched data
        customer_id: Number(selectedRentalItem.value.customer_id),
        item_id: Number(selectedRentalItem.value.items.id),
        amount: lostItemPayment.value.amount,
        payment_method: lostItemPayment.value.payment_method,
        payment_date: new Date().toISOString(),
        notes: lostItemPayment.value.notes,
        status: 'pending',
      })
      .select()

    if (paymentError) {
      console.error('Payment Error:', paymentError)
      throw paymentError
    }

    console.log('Payment submitted:', paymentData)

    // Update rental_items status to "Lost and Paid"
    const { error: rentalError } = await supabase
      .from('rental_items')
      .update({ status: 'Lost and Paid' })
      .eq('id', rentalItemData.id)

    if (rentalError) {
      console.error('Rental Update Error:', rentalError)
      throw rentalError
    }

    // Update item status to "Lost"
    const { error: itemError } = await supabase
      .from('items')
      .update({ status: 'Lost' })
      .eq('id', Number(selectedRentalItem.value.items.id))

    if (itemError) {
      console.error('Item Update Error:', itemError)
      throw itemError
    }

    lostItemDialog.value = false
    snackbarMessage.value = 'Lost item payment submitted successfully'
    snackbar.value = true

    // Refresh rentals list
    await fetchUserRentalItems()
  } catch (error) {
    console.error('Error submitting lost item payment:', error)
    snackbarMessage.value = 'Error submitting payment: ' + error.message
    snackbar.value = true
  } finally {
    loading.value = false
  }
}

const fetchUserRentalItems = async () => {
  loading.value = true
  try {
    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError) throw userError

    // Get customer records for the user
    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .select('id')
      .eq('user_id', user.id)

    if (customerError) throw customerError

    if (!customerData || customerData.length === 0) {
      console.log('No customer records found for user')
      rentalItems.value = []
      return
    }

    const customerIds = customerData.map((customer) => customer.id)
    console.log('Customer IDs:', customerIds)

    // Get rental items with all related data
    const { data: rentalData, error: rentalError } = await supabase
      .from('rental_items')
      .select(
        `
        *,
        items (
          id,
          brand,
          model,
          specification,
          rental_price_per_day,
          status,
          image,
          feedback (
            id,
            rating,
            comment,
            feedback_date,
            customer_id
          )
        ),
        rental_transactions (
          id,
          rental_date,
          return_date,
          total_amount,
          customer_id
        ),
        lost_item_payments (
          id,
          status,
          payment_date
        )
      `,
      )
      .in('customer_id', customerIds)

    if (rentalError) throw rentalError

    if (!rentalData || rentalData.length === 0) {
      console.log('No rentals found for customer IDs:', customerIds)
      rentalItems.value = []
      return
    }

    rentalItems.value = rentalData
      .map((rental) => {
        const processedRental = {
          id: rental.id, // This is the rental_items UUID
          rental_date: rental.rental_transactions?.rental_date,
          return_date: rental.rental_transactions?.return_date,
          total_amount: rental.rental_transactions?.total_amount,
          customer_id: rental.customer_id,
          status: rental.status,
          items: rental.items,
          lost_item_payments: rental.lost_item_payments,
          rental_transaction_id: rental.rental_transactions?.id, // Add rental_transaction_id
        }
        console.log('Processed rental:', processedRental)
        return processedRental
      })
      .filter((rental) => rental.id != null)

    console.log('Final rentals:', rentalItems.value)
  } catch (error) {
    console.error('Error in fetchUserRentalItems:', error)
    snackbarMessage.value = 'Error loading rentals: ' + error.message
    snackbar.value = true
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchUserRentalItems()
})
</script>

<template>
  <AppLayout>
    <template #content>
      <v-container style="height: 100vh">
        <h1 class="text-h4 mb-4">My Rentals</h1>

        <div v-if="loading" class="d-flex justify-center align-center" style="height: 200px">
          <v-progress-circular indeterminate></v-progress-circular>
        </div>

        <div v-else-if="!rentalItems || rentalItems.length === 0" class="text-center pa-4">
          <p class="text-h6">No rentals found</p>
          <v-btn color="primary" to="/browse" class="mt-4">Browse Items</v-btn>
        </div>

        <v-row v-else>
          <v-col
            v-for="rentalItem in rentalItems"
            :key="rentalItem.id"
            cols="12"
            sm="6"
            md="4"
            lg="3"
          >
            <v-hover v-slot="{ isHovering, props }">
              <v-card
                v-bind="props"
                :elevation="isHovering ? 8 : 2"
                class="transition-fast-in-fast-out"
                @click="openDetailsDialog(rentalItem)"
              >
                <v-img
                  :src="rentalItem.items?.image || '@/assets/no-image.png'"
                  height="200"
                  cover
                  class="bg-grey-lighten-2"
                >
                  <template v-slot:placeholder>
                    <v-row class="fill-height ma-0" align="center" justify="center">
                      <v-progress-circular
                        indeterminate
                        color="grey-lighten-5"
                      ></v-progress-circular>
                    </v-row>
                  </template>
                  <div
                    class="d-flex fill-height align-end"
                    :class="{ 'bg-black-overlay': isHovering }"
                  >
                    <div v-if="isHovering" class="text-white pa-2 text-center w-100">
                      Click to view details
                    </div>
                  </div>
                </v-img>
              </v-card>
            </v-hover>
          </v-col>
        </v-row>

        <!-- Details Dialog -->
        <v-dialog v-model="detailsDialog" max-width="600px">
          <v-card v-if="selectedRentalItem">
            <v-img
              :src="selectedRentalItem.items?.image || '@/assets/no-image.png'"
              height="300"
              cover
              class="bg-grey-lighten-2"
            ></v-img>

            <v-card-title class="text-h5 pt-4">
              {{ selectedRentalItem.items?.brand }} {{ selectedRentalItem.items?.model }}
            </v-card-title>

            <v-card-text>
              <v-row>
                <v-col cols="6">
                  <div class="text-caption">Rental Date</div>
                  <div>{{ new Date(selectedRentalItem.rental_date).toLocaleDateString() }}</div>
                </v-col>
                <v-col cols="6">
                  <div class="text-caption">Return Date</div>
                  <div>{{ new Date(selectedRentalItem.return_date).toLocaleDateString() }}</div>
                </v-col>
              </v-row>

              <v-row class="mt-2">
                <v-col cols="6">
                  <div class="text-caption">Status</div>
                  <v-chip
                    :color="selectedRentalItem.status === 'Returned' ? 'success' : 'primary'"
                    size="small"
                  >
                    {{ selectedRentalItem.status }}
                  </v-chip>
                  <!-- Add payment status message -->
                  <div
                    v-if="
                      selectedRentalItem.lost_item_payments &&
                      selectedRentalItem.lost_item_payments[0]?.status === 'completed'
                    "
                    class="text-success text-caption mt-2"
                  >
                    Payment Status: Lost item has been fully paid
                  </div>
                </v-col>
                <v-col cols="6">
                  <div class="text-caption">Total Amount</div>
                  <div>${{ selectedRentalItem.total_amount }}</div>
                </v-col>
              </v-row>

              <v-divider class="my-4"></v-divider>

              <!-- Reviews Section -->
              <div class="text-h6 mb-2">Reviews</div>
              <div
                v-if="
                  selectedRentalItem.items?.feedback && selectedRentalItem.items.feedback.length > 0
                "
              >
                <v-list>
                  <v-list-item
                    v-for="feedback in selectedRentalItem.items.feedback"
                    :key="feedback.id"
                    class="mb-2"
                  >
                    <template v-slot:prepend>
                      <v-avatar color="primary" size="36">
                        <v-icon icon="mdi-account" color="white"></v-icon>
                      </v-avatar>
                    </template>
                    <v-list-item-title>
                      <v-rating
                        :model-value="feedback.rating"
                        readonly
                        density="compact"
                        size="small"
                      ></v-rating>
                    </v-list-item-title>
                    <v-list-item-subtitle>
                      {{ feedback.comment || 'No comment provided' }}
                    </v-list-item-subtitle>
                    <v-list-item-subtitle class="text-caption">
                      {{ new Date(feedback.feedback_date).toLocaleDateString() }}
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </div>
              <div v-else class="text-body-2 text-grey">No reviews yet</div>

              <v-btn
                v-if="
                  selectedRentalItem.status === 'Returned' &&
                  (!selectedRentalItem.items?.feedback ||
                    !selectedRentalItem.items.feedback.some(
                      (f) => f.customer_id === selectedRentalItem.customer_id,
                    ))
                "
                color="primary"
                block
                class="mt-4"
                @click="openFeedbackDialog(selectedRentalItem)"
              >
                Add Your Review
              </v-btn>

              <v-btn
                v-if="
                  selectedRentalItem.status === 'Lost' &&
                  (!selectedRentalItem.lost_item_payments ||
                    selectedRentalItem.lost_item_payments[0]?.status !== 'completed')
                "
                color="error"
                block
                class="mt-4"
                @click="openLostItemDialog(selectedRentalItem)"
              >
                Pay for Lost Item
              </v-btn>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="grey" variant="text" @click="closeDetailsDialog">Close</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <!-- Feedback Dialog -->
        <v-dialog v-model="feedbackDialog" max-width="500px">
          <v-card>
            <v-card-title class="text-h5 bg-primary text-white pa-4">
              Add Your Review
            </v-card-title>

            <v-card-text class="pt-4">
              <div v-if="selectedRentalItem" class="text-subtitle-1 mb-2">
                {{ selectedRentalItem.items?.brand }} {{ selectedRentalItem.items?.model }}
              </div>

              <div class="mb-4">
                <label class="text-body-2 mb-1 d-block">Rating *</label>
                <v-rating
                  v-model="feedback.rating"
                  color="warning"
                  hover
                  half-increments
                ></v-rating>
                <div class="text-caption text-error" v-if="feedback.rating === 0">
                  Please provide a rating
                </div>
              </div>

              <v-textarea
                v-model="feedback.comment"
                label="Your Comment"
                placeholder="Share your experience with this item..."
                rows="3"
                class="mt-4"
              ></v-textarea>
            </v-card-text>

            <v-card-actions class="pa-4">
              <v-spacer></v-spacer>
              <v-btn color="grey-darken-1" variant="text" @click="feedbackDialog = false">
                Cancel
              </v-btn>
              <v-btn
                color="primary"
                :loading="loading"
                :disabled="feedback.rating === 0"
                @click="submitFeedback"
              >
                Submit Review
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <!-- Lost Item Payment Dialog -->
        <v-dialog v-model="lostItemDialog" max-width="500px">
          <v-card>
            <v-card-title class="text-h5 bg-error text-white pa-4">
              Lost Item Payment
            </v-card-title>

            <v-card-text class="pa-4">
              <v-alert type="warning" variant="tonal" class="mb-4">
                This item has been marked as lost. Please proceed with the lost item payment.
              </v-alert>

              <v-form @submit.prevent="submitLostItemPayment">
                <v-text-field
                  v-model="lostItemPayment.amount"
                  label="Payment Amount"
                  prefix="$"
                  type="number"
                  readonly
                  class="mb-4"
                ></v-text-field>

                <v-select
                  v-model="lostItemPayment.payment_method"
                  :items="paymentMethods"
                  label="Payment Method"
                  item-title="label"
                  item-value="value"
                  class="mb-4"
                ></v-select>

                <v-textarea
                  v-model="lostItemPayment.notes"
                  label="Additional Notes"
                  rows="3"
                  class="mb-4"
                ></v-textarea>

                <v-card-actions class="pa-0">
                  <v-spacer></v-spacer>
                  <v-btn color="grey" variant="text" @click="lostItemDialog = false">
                    Cancel
                  </v-btn>
                  <v-btn color="error" :loading="loading" @click="submitLostItemPayment">
                    Submit Payment
                  </v-btn>
                </v-card-actions>
              </v-form>
            </v-card-text>
          </v-card>
        </v-dialog>

        <!-- Snackbar -->
        <v-snackbar v-model="snackbar" :timeout="3000">
          {{ snackbarMessage }}
          <template v-slot:actions>
            <v-btn color="white" variant="text" @click="snackbar = false">Close</v-btn>
          </template>
        </v-snackbar>
      </v-container>
    </template>
  </AppLayout>
</template>

<style scoped>
.bg-black-overlay {
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.7) 100%);
}

.transition-fast-in-fast-out {
  transition: all 0.3s ease;
}
</style>
