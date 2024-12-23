<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '@/utilities/supabaseClient'
import AppLayout from '@/components/layout/AppLayout.vue'

const rentals = ref([])
const loading = ref(true)
const snackbar = ref(false)
const snackbarMessage = ref('')
const feedbackDialog = ref(false)
const selectedRental = ref(null)

const feedback = ref({
  rating: 0,
  comment: '',
})

/**
 * Fetch all rentals for the authenticated user.
 */
const fetchUserRentals = async () => {
  loading.value = true
  try {
    // Get the authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')
    console.log('Current user:', user)

    // Find the customer record for the authenticated user
    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (customerError) {
      console.error('Customer error:', customerError)
      throw customerError
    }
    console.log('Customer data:', customerData)

    // Fetch all rentals for the customer
    const { data: rentalData, error: rentalError } = await supabase
      .from('rental_transactions')
      .select(`
        *,
        rental_details (
          *,
          items (
            *
          )
        )
      `)
      .eq('customer_id', customerData.id)

    if (rentalError) {
      console.error('Rental error:', rentalError)
      throw rentalError
    }
    console.log('Rental data:', rentalData)

    rentals.value = rentalData
  } catch (error) {
    console.error('Error in fetchUserRentals:', error)
    snackbarMessage.value = 'Error loading rentals'
    snackbar.value = true
  } finally {
    loading.value = false
  }
}

const openFeedbackDialog = (rental) => {
  selectedRental.value = rental
  feedback.value = {
    rating: 0,
    comment: '',
  }
  feedbackDialog.value = true
}

const submitFeedback = async () => {
  if (!selectedRental.value) return

  try {
    loading.value = true
    // Create feedback record
    const { data: feedbackData, error: feedbackError } = await supabase
      .from('feedbacks')
      .insert({
        rental_transaction_id: selectedRental.value.id,
        item_id: selectedRental.value.rental_details.items.id,
        rating: feedback.value.rating,
        comment: feedback.value.comment,
        feedback_date: new Date().toISOString()
      })
      .select('id')
      .single()

    if (feedbackError) throw feedbackError

    feedbackDialog.value = false
    feedback.value = { rating: 0, comment: '' }
    selectedRental.value = null
    snackbarMessage.value = 'Thank you for your feedback!'
    snackbar.value = true
    await fetchUserRentals()
  } catch (error) {
    console.error('Error submitting feedback:', error)
    snackbarMessage.value = 'Error submitting feedback'
    snackbar.value = true
  } finally {
    loading.value = false
  }
}

const getRentalStatus = (rental) => {
  const returnDate = new Date(rental.return_date)
  const today = new Date()

  if (rental.rental_details.items.status === 'Returned') {
    return { text: 'Completed', color: 'success' }
  } else if (today > returnDate) {
    return { text: 'Overdue', color: 'error' }
  } else {
    return { text: 'Active', color: 'warning' }
  }
}

onMounted(() => {
  fetchUserRentals()
})
</script>

<template>
  <AppLayout>
    <template #content>
      <v-container>
        <h1 class="text-h4 mb-4">My Rentals</h1>

        <div v-if="loading" class="d-flex justify-center align-center" style="height: 200px">
          <v-progress-circular indeterminate></v-progress-circular>
        </div>

        <div v-else-if="!rentals || rentals.length === 0" class="text-center pa-4">
          <p class="text-h6">No rentals found</p>
          <v-btn color="primary" to="/browse" class="mt-4">Browse Cameras</v-btn>
        </div>

        <v-row v-else>
          <v-col v-for="rental in rentals" :key="rental.id" cols="12" md="6" lg="4">
            <v-card>
              <v-img
                v-if="rental.rental_details && rental.rental_details[0]?.items?.image"
                :src="rental.rental_details[0].items.image"
                height="200"
                cover
              ></v-img>

              <v-card-title>
                {{ rental.rental_details && rental.rental_details[0]?.items?.brand }} 
                {{ rental.rental_details && rental.rental_details[0]?.items?.model }}
              </v-card-title>

              <v-card-text>
                <v-row>
                  <v-col cols="6">
                    <div class="text-caption">Rental Date</div>
                    <div>{{ rental.rental_date ? new Date(rental.rental_date).toLocaleDateString() : 'N/A' }}</div>
                  </v-col>
                  <v-col cols="6">
                    <div class="text-caption">Return Date</div>
                    <div>{{ rental.return_date ? new Date(rental.return_date).toLocaleDateString() : 'N/A' }}</div>
                  </v-col>
                </v-row>

                <v-row class="mt-2">
                  <v-col cols="6">
                    <div class="text-caption">Duration</div>
                    <div>{{ rental.rental_details && rental.rental_details[0]?.rental_duration }} days</div>
                  </v-col>
                  <v-col cols="6">
                    <div class="text-caption">Status</div>
                    <v-chip
                      :color="rental.rental_details && rental.rental_details[0]?.items?.status === 'Rented' ? 'warning' : 'success'"
                      size="small"
                    >
                      {{ rental.rental_details && rental.rental_details[0]?.items?.status || 'N/A' }}
                    </v-chip>
                  </v-col>
                </v-row>

                <v-row class="mt-2">
                  <v-col cols="6">
                    <div class="text-caption">Total Amount</div>
                    <div>${{ rental.total_amount || '0.00' }}</div>
                  </v-col>
                  <v-col cols="6">
                    <div class="text-caption">Late Fee</div>
                    <div>${{ rental.rental_details && rental.rental_details[0]?.late_fee || '0.00' }}</div>
                  </v-col>
                </v-row>

                <v-row class="mt-2">
                  <v-col cols="12">
                    <div class="text-caption">Specifications</div>
                    <div>{{ rental.rental_details && rental.rental_details[0]?.items?.specification || 'N/A' }}</div>
                  </v-col>
                </v-row>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  v-if="rental.rental_details && rental.rental_details[0]?.items?.status === 'Returned'"
                  color="primary"
                  @click="openFeedbackDialog(rental)"
                >
                  Add Feedback
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>

        <!-- Feedback Dialog -->
        <v-dialog v-model="feedbackDialog" max-width="500px">
          <v-card>
            <v-card-title>Add Feedback</v-card-title>
            <v-card-text>
              <v-rating v-model="feedback.rating" hover></v-rating>
              <v-textarea
                v-model="feedback.comment"
                label="Your feedback"
                rows="3"
              ></v-textarea>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="error" @click="feedbackDialog = false">Cancel</v-btn>
              <v-btn
                color="primary"
                @click="submitFeedback"
                :disabled="!feedback.rating || !feedback.comment"
              >
                Submit
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <v-snackbar v-model="snackbar" :timeout="3000">
          {{ snackbarMessage }}
          <template v-slot:actions>
            <v-btn color="primary" variant="text" @click="snackbar = false">Close</v-btn>
          </template>
        </v-snackbar>
      </v-container>
    </template>
  </AppLayout>
</template>
