<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '@/utilities/supabaseClient'
import AppLayout from '@/components/layout/AppLayout.vue'

const rentals = ref([])
const loading = ref(true)
const snackbar = ref(false)
const snackbarMessage = ref('')
const currentAdminId = ref(null)
const totalCommission = ref(0)

const fetchCurrentAdmin = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data: adminData } = await supabase
      .from('admin_users')
      .select('id')
      .eq('user_id', user.id)
      .single()
    
    if (adminData) {
      currentAdminId.value = adminData.id
      // Fetch total commission for the admin
      const { data: commissionData, error: commissionError } = await supabase
        .from('admin_commissions')
        .select('total_commission')
        .eq('admin_id', adminData.id)
      
      if (!commissionError && commissionData) {
        totalCommission.value = commissionData.reduce((sum, record) => sum + record.total_commission, 0)
      }
    }
  }
}

const fetchRentals = async () => {
  loading.value = true
  try {
    // First get all rental transactions
    const { data, error } = await supabase
      .from('rental_transactions')
      .select(`
        id,
        rental_date,
        return_date,
        total_amount,
        payment_status,
        penalty_per_day,
        user_id,
        customers!inner (
          id,
          user_id,
          email,
          status
        ),
        rental_details!inner (
          id,
          rental_duration,
          late_fee,
          return_date,
          item_id,
          items!inner (
            id,
            brand,
            model,
            status,
            rental_price_perday,
            image
          )
        )
      `)
      .order('rental_date', { ascending: false })

    if (error) {
      console.error('Error fetching rentals:', error)
      throw error
    }
    
    rentals.value = data.map(rental => ({
      ...rental,
      isUpdating: false
    }))
  } catch (error) {
    console.error('Error fetching rentals:', error)
    snackbarMessage.value = 'Error loading rentals'
    snackbar.value = true
  } finally {
    loading.value = false
  }
}

const deleteItem = async (itemId) => {
  try {
    // Instead of deleting, update the item status to 'Archived'
    const { error } = await supabase
      .from('items')
      .update({ status: 'Archived' })
      .eq('id', itemId)

    if (error) throw error

    snackbarMessage.value = 'Item archived successfully'
    snackbar.value = true
    await fetchRentals()
  } catch (error) {
    console.error('Error archiving item:', error)
    snackbarMessage.value = 'Error archiving item'
    snackbar.value = true
  }
}

const calculateLateFee = (rental) => {
  if (!rental.rental_details?.return_date) return 0
  const returnDate = new Date(rental.rental_details.return_date)
  const today = new Date()
  const daysLate = Math.max(0, Math.floor((today - returnDate) / (1000 * 60 * 60 * 24)))
  return daysLate * rental.penalty_per_day
}

const calculateCommission = (totalAmount) => {
  // Calculate 10% commission from total amount
  return totalAmount * 0.10
}

const updateRentalStatus = async (rental, newStatus) => {
  rental.isUpdating = true
  try {
    // Update item status
    const { error: itemError } = await supabase
      .from('items')
      .update({ status: newStatus })
      .eq('id', rental.rental_details.item_id)

    if (itemError) throw itemError

    if (newStatus === 'Returned') {
      // Calculate and update late fee
      const lateFee = calculateLateFee(rental)
      const totalAmount = rental.total_amount + lateFee

      // Calculate and create admin commission
      const commission = calculateCommission(totalAmount)
      const { error: commissionError } = await supabase
        .from('admin_commissions')
        .insert({
          admin_id: currentAdminId.value,
          commission_date: new Date().toISOString(),
          total_commission: commission
        })

      if (commissionError) throw commissionError

      // Update rental details
      const { error: rentalError } = await supabase
        .from('rental_details')
        .update({
          late_fee: lateFee,
          return_date: new Date().toISOString()
        })
        .eq('id', rental.rental_details.id)

      if (rentalError) throw rentalError

      // Update rental transaction
      const { error: transactionError } = await supabase
        .from('rental_transactions')
        .update({
          total_amount: totalAmount,
          payment_status: lateFee > 0 ? 'Late Fee Pending' : 'Completed',
          return_date: new Date().toISOString()
        })
        .eq('id', rental.id)

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

onMounted(async () => {
  await fetchCurrentAdmin()
  await fetchRentals()
})
</script>

<template>
  <AppLayout>
    <template #content>
      <v-container>
        <!-- Admin Stats -->
        <v-row class="mb-4">
          <v-col cols="12" md="4">
            <v-card>
              <v-card-text class="text-center">
                <div class="text-h6 mb-1">Total Commission</div>
                <div class="text-h4">${{ totalCommission.toFixed(2) }}</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="4">
            <v-card>
              <v-card-text class="text-center">
                <div class="text-h6 mb-1">Total Rentals</div>
                <div class="text-h4">{{ rentals.length }}</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="4">
            <v-card>
              <v-card-text class="text-center">
                <div class="text-h6 mb-1">Active Rentals</div>
                <div class="text-h4">
                  {{ rentals.filter(r => r.rental_details?.items?.status === 'Rented').length }}
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

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
            <div v-if="loading" class="text-center pa-4">
              <v-progress-circular indeterminate color="primary"></v-progress-circular>
            </div>
            <div v-else-if="rentals.length === 0" class="text-center pa-4">
              No rentals found
            </div>
            <v-table v-else>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
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
                  <td>{{ rental.customers?.email }}</td>
                  <td>
                    {{ rental.rental_details?.items?.brand }} 
                    {{ rental.rental_details?.items?.model }}
                  </td>
                  <td>{{ new Date(rental.rental_date).toLocaleDateString() }}</td>
                  <td>{{ new Date(rental.return_date).toLocaleDateString() }}</td>
                  <td>{{ rental.rental_details?.rental_duration }} days</td>
                  <td>${{ rental.total_amount.toFixed(2) }}</td>
                  <td>${{ rental.rental_details?.late_fee?.toFixed(2) || '0.00' }}</td>
                  <td>
                    <v-chip
                      :color="
                        rental.rental_details?.items?.status === 'Rented'
                          ? 'warning'
                          : rental.rental_details?.items?.status === 'Returned'
                            ? 'success'
                            : 'error'
                      "
                    >
                      {{ rental.rental_details?.items?.status }}
                    </v-chip>
                  </td>
                  <td>
                    <v-btn-group v-if="rental.rental_details?.items?.status !== 'Returned'">
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
