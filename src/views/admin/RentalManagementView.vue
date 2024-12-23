<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '@/utilities/supabaseClient'
import AppLayout from '@/components/layout/AppLayout.vue'

const rentals = ref([])
const loading = ref(true)
const snackbar = ref(false)
const snackbarMessage = ref('')

const fetchRentals = async () => {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('rental_details')
      .select(
        `
        *,
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
          status
        )
      `,
      )
      .order('id', { ascending: false })

    if (error) throw error
    rentals.value = data.map((rental) => ({
      ...rental,
      isUpdating: false,
    }))
  } catch (error) {
    console.error('Error fetching rentals:', error)
    snackbarMessage.value = 'Error loading rentals'
    snackbar.value = true
  } finally {
    loading.value = false
  }
}

const calculateLateFee = (rental) => {
  const returnDate = new Date(rental.rental_transactions.return_date)
  const today = new Date()
  const daysLate = Math.max(0, Math.floor((today - returnDate) / (1000 * 60 * 60 * 24)))
  return daysLate * rental.rental_transactions.penalty_per_day
}

const updateRentalStatus = async (rental, newStatus) => {
  rental.isUpdating = true
  try {
    // Update item status
    const { error: itemError } = await supabase
      .from('items')
      .update({ status: newStatus })
      .eq('id', rental.item_id)

    if (itemError) throw itemError

    if (newStatus === 'Returned') {
      // Calculate and update late fee
      const lateFee = calculateLateFee(rental)

      // Update rental details
      const { error: rentalError } = await supabase
        .from('rental_details')
        .update({
          late_fee: lateFee,
          return_date: new Date().toISOString(),
        })
        .eq('id', rental.id)

      if (rentalError) throw rentalError

      // Update rental transaction
      const { error: transactionError } = await supabase
        .from('rental_transactions')
        .update({
          total_amount: rental.rental_transactions.total_amount + lateFee,
          payment_status: lateFee > 0 ? 'Late Fee Pending' : 'Completed',
        })
        .eq('id', rental.rental_transactions.id)

      if (transactionError) throw transactionError
    }

    await fetchRentals()
    snackbarMessage.value = `Rental status updated to ${newStatus}`
    snackbar.value = true
  } catch (error) {
    console.error('Error updating rental:', error)
    snackbarMessage.value = 'Error updating rental status'
    snackbar.value = true
  } finally {
    rental.isUpdating = false
  }
}

onMounted(() => {
  fetchRentals()
})
</script>

<template>
  <AppLayout>
    <template #content>
      <v-container>
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon icon="mdi-clipboard-list" class="me-2"></v-icon>
            Rental Management
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              :loading="loading"
              @click="fetchRentals"
              icon="mdi-refresh"
            ></v-btn>
          </v-card-title>

          <v-card-text>
            <v-table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Item</th>
                  <th>Rental Date</th>
                  <th>Return Date</th>
                  <th>Duration</th>
                  <th>Amount</th>
                  <th>Late Fee</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="rental in rentals" :key="rental.id">
                  <td>{{ rental.id }}</td>
                  <td>{{ rental.items.brand }} {{ rental.items.model }}</td>
                  <td>
                    {{ new Date(rental.rental_transactions.rental_date).toLocaleDateString() }}
                  </td>
                  <td>
                    {{ new Date(rental.rental_transactions.return_date).toLocaleDateString() }}
                  </td>
                  <td>{{ rental.rental_duration }} days</td>
                  <td>${{ rental.rental_transactions.total_amount.toFixed(2) }}</td>
                  <td>${{ rental.late_fee?.toFixed(2) || '0.00' }}</td>
                  <td>
                    <v-chip
                      :color="
                        rental.items.status === 'Rented'
                          ? 'warning'
                          : rental.items.status === 'Returned'
                            ? 'success'
                            : 'error'
                      "
                    >
                      {{ rental.items.status }}
                    </v-chip>
                  </td>
                  <td>
                    <v-btn-group v-if="rental.items.status !== 'Returned'">
                      <v-btn
                        color="success"
                        :loading="rental.isUpdating"
                        @click="updateRentalStatus(rental, 'Returned')"
                        size="small"
                      >
                        Mark Returned
                      </v-btn>
                      <v-btn
                        color="error"
                        :loading="rental.isUpdating"
                        @click="updateRentalStatus(rental, 'Lost')"
                        size="small"
                      >
                        Mark Lost
                      </v-btn>
                    </v-btn-group>
                    <span v-else>Completed</span>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>

        <v-snackbar v-model="snackbar" :timeout="3000">
          {{ snackbarMessage }}
          <template v-slot:actions>
            <v-btn color="primary" variant="text" @click="snackbar = false"> Close </v-btn>
          </template>
        </v-snackbar>
      </v-container>
    </template>
  </AppLayout>
</template>
