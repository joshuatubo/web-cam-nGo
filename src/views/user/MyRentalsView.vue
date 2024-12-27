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
  comment: '',
})
const rentalDuration = ref(null) // Define rentalDuration as a reactive variable

const rules = {
  required: (v) => !!v || 'This field is required',
  rating: (v) => v > 0 || 'Please provide a rating',
}

const openFeedbackDialog = (rental) => {
  selectedRental.value = rental
  feedback.value = {
    rating: 0,
    comment: ''
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
    
    // Create new feedback record using the customer_id from the selected rental
    const { data: feedbackData, error: createError } = await supabase
      .from('feedback')
      .insert({
        item_id: selectedRental.value.items.id,
        customer_id: selectedRental.value.customer_id,
        feedback_date: new Date().toISOString(),
        rating: feedback.value.rating,
        comment: feedback.value.comment || ''
      })
      .select()

    if (createError) {
      console.error('Error creating feedback:', createError)
      throw createError
    }

    console.log('Feedback submitted successfully:', feedbackData)

    // Close dialog and reset form
    feedbackDialog.value = false
    feedback.value = { rating: 0, comment: '' }
    selectedRental.value = null
    
    // Show success message
    snackbarMessage.value = 'Thank you for your feedback!'
    snackbar.value = true
    
    // Refresh the rentals list to show new feedback
    await fetchUserRentals()
  } catch (error) {
    console.error('Error submitting feedback:', error)
    snackbarMessage.value = 'Error submitting feedback: ' + error.message
    snackbar.value = true
  } finally {
    loading.value = false
  }
}

const fetchUserRentals = async () => {
  loading.value = true
  try {
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) throw userError

    console.log('Current user:', user)

    // Get all customer IDs for this user
    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .select('id')
      .eq('user_id', user.id)

    if (customerError) throw customerError

    if (!customerData || customerData.length === 0) {
      console.log('No customer records found for user')
      rentals.value = []
      return
    }

    const customerIds = customerData.map(customer => customer.id)
    console.log('Customer IDs:', customerIds)

    // Get all rentals for all customer IDs
    const { data: rentalData, error: rentalError } = await supabase
      .from('rental_items')
      .select(`
        id,
        customer_id,
        status,
        rental_transactions (
          id,
          rental_date,
          return_date,
          total_amount,
          payment_status,
          penalty_per_day
        ),
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
            feedback_date
          )
        )
      `)
      .in('customer_id', customerIds)
      .order('id', { ascending: false })

    if (rentalError) {
      console.error('Rental error:', rentalError)
      throw rentalError
    }

    console.log('Raw rental data:', rentalData)

    if (!rentalData || rentalData.length === 0) {
      console.log('No rentals found for customer IDs:', customerIds)
      rentals.value = []
      return
    }

    rentals.value = rentalData.map(rental => {
      const processedRental = {
        id: rental.rental_transactions?.id,
        rental_date: rental.rental_transactions?.rental_date,
        return_date: rental.rental_transactions?.return_date,
        total_amount: rental.rental_transactions?.total_amount,
        payment_status: rental.rental_transactions?.payment_status,
        penalty_per_day: rental.rental_transactions?.penalty_per_day,
        status: rental.status,
        customer_id: rental.customer_id,
        items: {
          ...rental.items,
          feedback: rental.items?.feedback || []
        }
      }
      console.log('Processed rental:', processedRental)
      return processedRental
    }).filter(rental => rental.id != null)

    console.log('Final rentals:', rentals.value)

  } catch (error) {
    console.error('Error in fetchUserRentals:', error)
    snackbarMessage.value = 'Error loading rentals: ' + error.message
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
          <v-btn color="primary" to="/browse" class="mt-4">Browse Items</v-btn>
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
                <v-list>
                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon>mdi-calendar</v-icon>
                    </template>
                    <v-list-item-title>Rental Date</v-list-item-title>
                    <v-list-item-subtitle>{{ new Date(rental.rental_date).toLocaleDateString() }}</v-list-item-subtitle>
                  </v-list-item>

                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon>mdi-calendar-check</v-icon>
                    </template>
                    <v-list-item-title>Return Date</v-list-item-title>
                    <v-list-item-subtitle>{{ new Date(rental.return_date).toLocaleDateString() }}</v-list-item-subtitle>
                  </v-list-item>

                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon>mdi-clock-outline</v-icon>
                    </template>
                    <v-list-item-title>Duration</v-list-item-title>
                    <v-list-item-subtitle>{{ rental.rental_duration }} days</v-list-item-subtitle>
                  </v-list-item>

                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon>mdi-cash</v-icon>
                    </template>
                    <v-list-item-title>Total Amount</v-list-item-title>
                    <v-list-item-subtitle>${{ rental.total_amount }}</v-list-item-subtitle>
                  </v-list-item>

                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon>mdi-information</v-icon>
                    </template>
                    <v-list-item-title>Status</v-list-item-title>
                    <v-list-item-subtitle>
                      <v-chip
                        :color="rental.status === 'returned' ? 'success' : rental.status === 'active' ? 'primary' : 'warning'"
                        size="small"
                      >
                        {{ rental.status }}
                      </v-chip>
                    </v-list-item-subtitle>
                  </v-list-item>

                  <v-list-item v-if="rental.items?.specification">
                    <template v-slot:prepend>
                      <v-icon>mdi-camera</v-icon>
                    </template>
                    <v-list-item-title>Specifications</v-list-item-title>
                    <v-list-item-subtitle>{{ rental.items.specification }}</v-list-item-subtitle>
                  </v-list-item>
                </v-list>

                <v-divider class="my-2"></v-divider>

                <div class="d-flex justify-space-between align-center mt-2">
                  <div>
                    <v-rating
                      v-if="rental.items?.feedback && rental.items.feedback.length > 0"
                      :model-value="rental.items.feedback[0].rating"
                      readonly
                      density="compact"
                      size="small"
                    ></v-rating>
                    <div v-if="rental.items?.feedback && rental.items.feedback.length > 0" class="text-body-2 mt-1">
                      {{ rental.items.feedback[0].comment || 'No comment provided' }}
                    </div>
                  </div>
                  <v-btn
                    v-if="rental.status === 'Returned' && (!rental.items?.feedback || rental.items.feedback.length === 0)"
                    color="primary"
                    @click="openFeedbackDialog(rental)"
                  >
                    Add Review
                  </v-btn>
                </div>

                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn
                    v-if="rental.status === 'Returned' && (!rental.items?.feedback || rental.items.feedback.length === 0)"
                    color="primary"
                    @click="openFeedbackDialog(rental)"
                  >
                    Add Review
                  </v-btn>
                </v-card-actions>
              </v-card-text>

            </v-card>
          </v-col>
        </v-row>

        <v-dialog v-model="feedbackDialog" max-width="500px">
          <v-card>
            <v-card-title class="text-h5 bg-primary text-white pa-4">
              Add Your Review
            </v-card-title>

            <v-card-text class="pt-4">
              <div v-if="selectedRental" class="text-subtitle-1 mb-2">
                {{ selectedRental.items?.brand }} {{ selectedRental.items?.model }}
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
              <v-btn
                color="grey-darken-1"
                variant="text"
                @click="feedbackDialog = false"
              >
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

        <v-snackbar v-model="snackbar" :timeout="3000">
          {{ snackbarMessage }}
          <template v-slot:actions>
            <v-btn
              color="white"
              variant="text"
              @click="snackbar = false"
            >
              Close
            </v-btn>
          </template>
        </v-snackbar>
      </v-container>
    </template>
  </AppLayout>
</template>
