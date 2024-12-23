<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '@/utilities/supabaseClient'

const rentals = ref([])
const loading = ref(true)
const snackbar = ref(false)
const snackbarMessage = ref('')
const feedbackDialog = ref(false)
const selectedRental = ref(null)

const feedback = ref({
  rating: 5,
  comment: ''
})

const fetchUserRentals = async () => {
  loading.value = true
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .select('id')
      .eq('users.id', user.id)
      .single()

    if (customerError) throw customerError

    const { data, error } = await supabase
      .from('rental_details')
      .select(`
        *,
        rental_transactions (
          id,
          rental_date,
          return_date,
          total_amount,
          payment_status,
          penalty_per_day,
          feedbacks_id
        ),
        items (
          id,
          brand,
          model,
          status,
          image
        )
      `)
      .order('id', { ascending: false })

    if (error) throw error

    // Fetch feedback for each rental that has one
    const rentalsWithFeedback = await Promise.all(data.map(async rental => {
      if (rental.rental_transactions.feedbacks_id) {
        const { data: feedbackData } = await supabase
          .from('feedbacks')
          .select('*')
          .eq('id', rental.rental_transactions.feedbacks_id)
          .single()
        
        return { ...rental, feedback: feedbackData }
      }
      return rental
    }))

    rentals.value = rentalsWithFeedback
  } catch (error) {
    console.error('Error fetching rentals:', error)
    snackbarMessage.value = 'Error loading rentals'
    snackbar.value = true
  } finally {
    loading.value = false
  }
}

const openFeedbackDialog = (rental) => {
  selectedRental.value = rental
  feedback.value = {
    rating: 5,
    comment: ''
  }
  feedbackDialog.value = true
}

const submitFeedback = async () => {
  if (!selectedRental.value) return

  try {
    // Create feedback record
    const { data: feedbackData, error: feedbackError } = await supabase
      .from('feedbacks')
      .insert({
        feedbacks_date: new Date().toISOString(),
        rating: feedback.value.rating,
        comment: feedback.value.comment,
        rental_details_id: selectedRental.value.id
      })
      .select('id')
      .single()

    if (feedbackError) throw feedbackError

    // Update rental transaction with feedback ID
    const { error: transactionError } = await supabase
      .from('rental_transactions')
      .update({
        feedbacks_id: feedbackData.id
      })
      .eq('id', selectedRental.value.rental_transactions.id)

    if (transactionError) throw transactionError

    feedbackDialog.value = false
    snackbarMessage.value = 'Thank you for your feedback!'
    snackbar.value = true
    await fetchUserRentals()
  } catch (error) {
    console.error('Error submitting feedback:', error)
    snackbarMessage.value = 'Error submitting feedback'
    snackbar.value = true
  }
}

const getRentalStatus = (rental) => {
  const returnDate = new Date(rental.rental_transactions.return_date)
  const today = new Date()
  
  if (rental.items.status === 'Returned') {
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
  <v-container>
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon icon="mdi-camera" class="me-2"></v-icon>
        My Rentals
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          :loading="loading"
          @click="fetchUserRentals"
          icon="mdi-refresh"
        ></v-btn>
      </v-card-title>

      <v-card-text>
        <v-row>
          <v-col v-for="rental in rentals" :key="rental.id" cols="12" md="6">
            <v-card>
              <v-img
                :src="rental.items.image"
                height="200"
                cover
              ></v-img>
              
              <v-card-title>{{ rental.items.brand }} {{ rental.items.model }}</v-card-title>
              
              <v-card-text>
                <v-row>
                  <v-col cols="6">
                    <div class="text-caption">Rental Date</div>
                    <div>{{ new Date(rental.rental_transactions.rental_date).toLocaleDateString() }}</div>
                  </v-col>
                  <v-col cols="6">
                    <div class="text-caption">Return Date</div>
                    <div>{{ new Date(rental.rental_transactions.return_date).toLocaleDateString() }}</div>
                  </v-col>
                  <v-col cols="6">
                    <div class="text-caption">Duration</div>
                    <div>{{ rental.rental_duration }} days</div>
                  </v-col>
                  <v-col cols="6">
                    <div class="text-caption">Total Amount</div>
                    <div>${{ rental.rental_transactions.total_amount.toFixed(2) }}</div>
                  </v-col>
                  <v-col cols="12">
                    <v-chip
                      :color="getRentalStatus(rental).color"
                    >
                      {{ getRentalStatus(rental).text }}
                    </v-chip>
                    
                    <v-chip
                      v-if="rental.late_fee > 0"
                      color="error"
                      class="ms-2"
                    >
                      Late Fee: ${{ rental.late_fee.toFixed(2) }}
                    </v-chip>
                  </v-col>
                </v-row>

                <!-- Feedback Section -->
                <v-row v-if="rental.feedback" class="mt-4">
                  <v-col cols="12">
                    <div class="text-caption">Your Feedback</div>
                    <v-rating
                      v-model="rental.feedback.rating"
                      readonly
                      density="compact"
                    ></v-rating>
                    <div class="text-body-2">{{ rental.feedback.comment }}</div>
                  </v-col>
                </v-row>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  v-if="rental.items.status === 'Returned' && !rental.feedback"
                  color="primary"
                  @click="openFeedbackDialog(rental)"
                >
                  Leave Feedback
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Feedback Dialog -->
    <v-dialog v-model="feedbackDialog" max-width="500">
      <v-card>
        <v-card-title>Leave Feedback</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <div class="text-subtitle-1 mb-2">Rate your experience</div>
              <v-rating
                v-model="feedback.rating"
                color="warning"
              ></v-rating>
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="feedback.comment"
                label="Your Comments"
                rows="3"
              ></v-textarea>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="error"
            variant="text"
            @click="feedbackDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            @click="submitFeedback"
          >
            Submit Feedback
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar" :timeout="3000">
      {{ snackbarMessage }}
      <template v-slot:actions>
        <v-btn
          color="primary"
          variant="text"
          @click="snackbar = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>
