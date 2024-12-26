<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/utilities/supabaseClient'
import AppLayout from '@/components/layout/AppLayout.vue'

const rentals = ref([])
const rentalDetails = ref([])
const rentalItems = ref([])
const loading = ref(true)
const snackbar = ref(false)
const snackbarMessage = ref('')
const currentAdminId = ref(null)
const totalCommission = ref(0)

const fetchCurrentAdmin = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) {
    const { data: adminData } = await supabase
      .from('admin_users')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (adminData) {
      currentAdminId.value = adminData.id
      const { data: commissionData, error: commissionError } = await supabase
        .from('admin_commissions')
        .select('total_commission')
        .eq('admin_id', adminData.id)

      if (!commissionError && commissionData) {
        totalCommission.value = commissionData.reduce(
          (sum, record) => sum + record.total_commission,
          0,
        )
      }
    }
  }
}

const fetchRentals = async () => {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('rental_transactions')
      .select(
        `id, rental_date, return_date, total_amount, payment_status, penalty_per_day, feedbacks_id, admin_commissions_id, customer_id`,
      )
      .order('rental_date', { ascending: false })

    if (error) throw error

    rentals.value = data.map((rental) => ({
      ...rental,
      rental_date: new Date(rental.rental_date).toLocaleDateString(),
      return_date: rental.return_date ? new Date(rental.return_date).toLocaleDateString() : null,
    }))
  } catch (error) {
    console.error('Error fetching rentals:', error)
    snackbarMessage.value = 'Error loading rentals'
    snackbar.value = true
  } finally {
    loading.value = false
  }
}

const fetchRentalItems = async () => {
  try {
    const { data, error } = await supabase
      .from('rental_items')
      .select(
        `
        id,
        customer_id,
        item_id,
        rental_transaction_id,
        status,
        created_at,
        items:item_id (
          id,
          brand,
          model,
          status
        ),
        rental_transactions:rental_transaction_id (
          id,
          rental_date,
          return_date,
          total_amount
        )
      `,
      )
      .order('created_at', { ascending: false })

    if (error) throw error
    rentalItems.value = data
  } catch (error) {
    console.error('Error fetching rental items:', error)
    snackbarMessage.value = 'Error loading rental items'
    snackbar.value = true
  }
}

const updatePaymentStatus = async (transactionId, newStatus) => {
  try {
    const { error } = await supabase
      .from('rental_transactions')
      .update({ payment_status: newStatus })
      .eq('id', transactionId)

    if (error) throw error

    if (newStatus === 'Accepted') {
      // Get rental items for this transaction
      const { data: rentalItems, error: rentalError } = await supabase
        .from('rental_items')
        .select('id, item_id')
        .eq('rental_transaction_id', transactionId)

      if (rentalError) throw rentalError

      // Update each item's status to 'Rented'
      for (const item of rentalItems) {
        // Update item status
        const { error: itemError } = await supabase
          .from('items')
          .update({ status: 'Rented' })
          .eq('id', item.item_id)

        if (itemError) throw itemError

        // Update rental_items status
        const { error: rentalItemError } = await supabase
          .from('rental_items')
          .update({ status: 'Rented' })
          .eq('id', item.id)

        if (rentalItemError) throw rentalItemError
      }

      // Handle commission
      const { error: commissionError } = await supabase.from('admin_commissions').insert({
        admin_id: currentAdminId.value,
        total_commission: calculateCommission(transactionId),
      })

      if (commissionError) throw commissionError
    }

    snackbarMessage.value = `Payment status updated to "${newStatus}"`
    snackbar.value = true
    await fetchRentals()
    await fetchRentalItems()
  } catch (error) {
    console.error('Error updating payment status:', error)
    snackbarMessage.value = 'Error updating payment status'
    snackbar.value = true
  }
}

const updateItemStatus = async (itemId, rentalItemId, newStatus) => {
  try {
    // Update rental_items status
    const { error: rentalItemError } = await supabase
      .from('rental_items')
      .update({ status: newStatus })
      .eq('id', rentalItemId)

    if (rentalItemError) throw rentalItemError

    // Update items status in product management
    const productStatus =
      newStatus === 'Returned'
        ? 'Available'
        : newStatus === 'Lost'
          ? 'Out of Stock'
          : newStatus === 'Rented'
            ? 'Rented'
            : 'Available'

    const { error: itemError } = await supabase
      .from('items')
      .update({ status: productStatus })
      .eq('id', itemId)

    if (itemError) throw itemError

    snackbarMessage.value = `Item status updated to "${newStatus}"`
    snackbar.value = true

    // Refresh data
    await fetchRentalItems()
    await fetchRentals()
  } catch (error) {
    console.error('Error updating item status:', error)
    snackbarMessage.value = 'Error updating item status'
    snackbar.value = true
  }
}

const calculateCommission = (transactionId) => {
  const rental = rentals.value.find((r) => r.id === transactionId)
  if (rental) {
    return rental.total_amount * 0.1 // 10% commission
  }
  return 0
}

onMounted(async () => {
  await fetchCurrentAdmin()
  await fetchRentals()
  await fetchRentalItems()
})
</script>

<template>
  <AppLayout>
    <template #content>
      <v-container>
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
                  {{ rentalItems.filter((item) => item.status === 'Rented').length }}
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
        <!-- Transaction Details -->
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon icon="mdi-clipboard-list" class="me-2"></v-icon>
            Manage Transactions
          </v-card-title>
          <v-card-text>
            <v-table v-if="!loading && rentals.length > 0">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Rental Date</th>
                  <th>Return Date</th>
                  <th>Total Amount</th>
                  <th>Payment Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="rental in rentals" :key="rental.id">
                  <td>{{ rental.id }}</td>
                  <td>{{ rental.rental_date }}</td>
                  <td>{{ rental.return_date || 'Not Returned' }}</td>
                  <td>${{ rental.total_amount }}</td>
                  <td>
                    <v-select
                      v-model="rental.payment_status"
                      :items="['Pending', 'Accepted', 'Declined']"
                      @change="updatePaymentStatus(rental.id, rental.payment_status)"
                    ></v-select>
                  </td>
                  <td>
                    <v-btn
                      color="primary"
                      @click="updatePaymentStatus(rental.id, rental.payment_status)"
                    >
                      Update Status
                    </v-btn>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>

        <!-- Rental Items -->
        <v-card class="mt-4">
          <v-card-title class="d-flex align-center">
            <v-icon icon="mdi-camera" class="me-2"></v-icon>
            Rental Items
          </v-card-title>
          <v-card-text>
            <v-table v-if="!loading && rentalItems.length > 0">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Current Status</th>
                  <th>Product Status</th>
                  <th>Rental Date</th>
                  <th>Return Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in rentalItems" :key="item.id">
                  <td>{{ item.items.brand }} {{ item.items.model }}</td>
                  <td>{{ item.status }}</td>
                  <td>{{ item.items.status }}</td>
                  <td>{{ new Date(item.rental_transactions.rental_date).toLocaleDateString() }}</td>
                  <td>
                    {{
                      item.rental_transactions.return_date
                        ? new Date(item.rental_transactions.return_date).toLocaleDateString()
                        : 'Not Returned'
                    }}
                  </td>
                  <td>
                    <v-btn
                      v-if="item.status === 'Pending'"
                      color="success"
                      class="me-2"
                      size="small"
                      @click="updateItemStatus(item.items.id, item.id, 'Rented')"
                    >
                      Set as Rented
                    </v-btn>
                    <v-btn
                      v-if="item.status === 'Rented'"
                      color="warning"
                      class="me-2"
                      size="small"
                      @click="updateItemStatus(item.items.id, item.id, 'Returned')"
                    >
                      Set as Returned
                    </v-btn>
                    <v-btn
                      v-if="item.status === 'Rented'"
                      color="error"
                      size="small"
                      @click="updateItemStatus(item.items.id, item.id, 'Lost')"
                    >
                      Mark as Lost
                    </v-btn>
                  </td>
                </tr>
              </tbody>
            </v-table>
            <div v-else-if="loading" class="text-center pa-4">
              <v-progress-circular indeterminate></v-progress-circular>
            </div>
            <div v-else class="text-center pa-4">No rental items found</div>
          </v-card-text>
        </v-card>

        <!-- Snackbar -->
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
