<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/utilities/supabaseClient'
import AppLayout from '@/components/layout/AppLayout.vue'

const loading = ref(false)
const rentals = ref([])
const snackbar = ref(false)
const snackbarMessage = ref('')
const feedbackDialog = ref(false)
const selectedRental = ref(null)
const feedback = ref({
  rating: 0,
  comment: ''
})

const rules = {
  required: v => !!v || 'This field is required',
  rating: v => v > 0 || 'Please provide a rating'
}

const openFeedbackDialog = (rental) => {
  selectedRental.value = rental
  if (rental.feedbacks && rental.feedbacks.length > 0) {
    feedback.value = {
      rating: rental.feedbacks[0].rating,
      comment: rental.feedbacks[0].comment
    }
  } else {
    feedback.value = {
      rating: 0,
      comment: ''
    }
  }
  feedbackDialog.value = true
}

const submitFeedback = async () => {
  if (!selectedRental.value || feedback.value.rating === 0) {
    snackbarMessage.value = 'Please provide a rating'
    snackbar.value = true
    return
  }

  try {
    loading.value = true
    const feedbackData = {
      rental_item_id: selectedRental.value.id,
      item_id: selectedRental.value.item_id,
      rating: feedback.value.rating,
      comment: feedback.value.comment,
      feedback_date: new Date().toISOString()
    }

    if (selectedRental.value.feedbacks?.[0]?.id) {
      // Update existing feedback
      const { error: updateError } = await supabase
        .from('feedbacks')
        .update(feedbackData)
        .eq('id', selectedRental.value.feedbacks[0].id)

      if (updateError) throw updateError
    } else {
      // Create new feedback
      const { error: createError } = await supabase
        .from('feedbacks')
        .insert(feedbackData)

      if (createError) throw createError
    }

    feedbackDialog.value = false
    feedback.value = { rating: 0, comment: '' }
    selectedRental.value = null
    snackbarMessage.value = 'Thank you for your feedback!'
    snackbar.value = true
  } catch (error) {
    console.error('Error submitting feedback:', error)
    snackbarMessage.value = 'Error submitting feedback'
    snackbar.value = true
  } finally {
    loading.value = false
  }
}

const getRentalStatus = (rental) => {
  if (rental.status === 'Returned') {
    return { text: 'Returned', color: 'success' }
  } else if (rental.status === 'Rented') {
    return { text: 'Active', color: 'warning' }
  } else if (rental.status === 'Lost') {
    return { text: 'Lost', color: 'error' }
  } else {
    return { text: rental.status, color: 'info' }
  }
}

const fetchUserRentals = async () => {
  loading.value = true
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (customerError) throw customerError

    const { data: rentalData, error: rentalError } = await supabase
      .from('rental_items')
      .select('*, items(*)')
      .eq('customer_id', customerData.id)

    if (rentalError) {
      console.error('Rental error:', rentalError)
      throw rentalError
    }

    const { data: transactionData, error: transactionError } = await supabase
      .from('rental_transactions')
      .select('*')
      .in('id', rentalData.map(r => r.rental_transaction_id))

    if (transactionError) {
      console.error('Transaction error:', transactionError)
      throw transactionError
    }

    const { data: feedbackData, error: feedbackError } = await supabase
      .from('feedbacks')
      .select('*')
      .in('rental_item_id', rentalData.map(r => r.id))

    if (feedbackError) {
      console.error('Feedback error:', feedbackError)
      throw feedbackError
    }

    rentals.value = rentalData.map(rental => {
      const transaction = transactionData.find(t => t.id === rental.rental_transaction_id)
      const feedbacks = feedbackData.filter(f => f.rental_item_id === rental.id)
      return {
        ...rental,
        rental_transactions: transaction,
        feedbacks: feedbacks
      }
    })
  } catch (error) {
    console.error('Error in fetchUserRentals:', error)
    snackbarMessage.value = 'Error loading rentals'
    snackbar.value = true
  } finally {
    loading.value = false
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
                v-if="rental.items?.image"
                :src="rental.items.image"
                height="200"
                cover
                class="bg-grey-lighten-2"
              ></v-img>
              <v-img
                v-else
                src="@/assets/no-image.png"
                height="200"
                cover
                class="bg-grey-lighten-2"
              ></v-img>

              <v-card-title class="text-truncate">
                {{ rental.items?.brand }} {{ rental.items?.model }}
              </v-card-title>

              <v-card-text>
                <v-row>
                  <v-col cols="6">
                    <div class="text-caption">Rental Date</div>
                    <div>{{ rental.rental_transactions?.rental_date ? new Date(rental.rental_transactions.rental_date).toLocaleDateString() : 'N/A' }}</div>
                  </v-col>
                  <v-col cols="6">
                    <div class="text-caption">Return Date</div>
                    <div>{{ rental.rental_transactions?.return_date ? new Date(rental.rental_transactions.return_date).toLocaleDateString() : 'Not Returned' }}</div>
                  </v-col>
                </v-row>

                <v-row class="mt-2">
                  <v-col cols="6">
                    <div class="text-caption">Status</div>
                    <v-chip
                      :color="rental.status === 'Rented' ? 'success' : rental.status === 'Pending' ? 'warning' : 'error'"
                      size="small"
                    >
                      {{ rental.status }}
                    </v-chip>
                  </v-col>
                  <v-col cols="6">
                    <div class="text-caption">Amount</div>
                    <div>${{ rental.rental_transactions?.total_amount }}</div>
                  </v-col>
                </v-row>

                <v-row class="mt-2">
                  <v-col cols="12">
                    <div class="text-caption">Your Rating</div>
                    <div v-if="rental.feedbacks && rental.feedbacks.length > 0">
                      <v-rating
                        v-model="rental.feedbacks[0].rating"
                        readonly
                        size="small"
                        color="amber"
                      ></v-rating>
                      <div class="text-body-2 mt-1">{{ rental.feedbacks[0].comment || 'No comment provided' }}</div>
                    </div>
                    <div v-else class="text-caption text-grey">Not rated yet</div>
                  </v-col>
                </v-row>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  color="primary"
                  variant="text"
                  @click="openFeedbackDialog(rental)"
                  v-if="rental.status === 'Rented'"
                >
                  {{ rental.feedbacks && rental.feedbacks.length > 0 ? 'Edit Review' : 'Add Review' }}
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>

        <v-dialog v-model="feedbackDialog" max-width="500px">
          <v-card>
            <v-card-title>
              {{ selectedRental?.feedbacks && selectedRental.feedbacks.length > 0 ? 'Edit Review' : 'Add Review' }}
            </v-card-title>
            <v-card-text>
              <v-form @submit.prevent="submitFeedback">
                <div class="mb-4">
                  <div class="text-subtitle-1 mb-2">Rating</div>
                  <v-rating
                    v-model="feedback.rating"
                    color="amber"
                    hover
                  ></v-rating>
                </div>
                
                <v-textarea
                  v-model="feedback.comment"
                  label="Your feedback"
                  placeholder="Share your experience with this item..."
                  rows="3"
                ></v-textarea>
              </v-form>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="error" variant="text" @click="feedbackDialog = false">Cancel</v-btn>
              <v-btn 
                color="primary" 
                variant="text" 
                @click="submitFeedback"
                :disabled="!feedback.rating"
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
