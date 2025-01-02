<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue'
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
const lostItemPayments = ref([])
const selectedPayment = ref(null)
const paymentDialog = ref(false)
const commissionData = ref(null)

const paymentStatuses = [
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' },
]

// Define allowed rental item statuses
const RENTAL_ITEM_STATUSES = {
  COMPLETED: 'Completed',
  LOST: 'Lost',
  RETURNED: 'Returned',
  PENDING: 'Pending',
}

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
      const { data: commissionDataResult, error: commissionError } = await supabase
        .from('admin_commissions')
        .select('total_commission, commission_date')
        .eq('admin_id', adminData.id)
        .order('commission_date', { ascending: false })

      if (!commissionError && commissionDataResult) {
        totalCommission.value = commissionDataResult.reduce(
          (sum, record) => sum + record.total_commission,
          0,
        )
        commissionData.value = commissionDataResult
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
        `id, rental_date, return_date, total_amount, payment_status, penalty_per_day, 
        feedbacks_id, admin_commissions_id, 
        customer_id, customers (
          id,
          F_name,
          L_name,
          registration_date
        ),
        admin_commissions (
          id,
          total_commission,
          commission_date
        ),
        feedback:feedbacks_id (
          id,
          rating,
          comment,
          feedback_date
        )`,
      )
      .order('rental_date', { ascending: false })

    if (error) throw error

    rentals.value = data.map((rental) => ({
      ...rental,
      rental_date: new Date(rental.rental_date).toLocaleDateString(),
      return_date: rental.return_date ? new Date(rental.return_date).toLocaleDateString() : null,
      commission_info: rental.admin_commissions
        ? {
            amount: rental.admin_commissions.total_commission,
            date: new Date(rental.admin_commissions.commission_date).toLocaleDateString(),
          }
        : null,
      feedback_info: rental.feedback
        ? {
            rating: rental.feedback.rating,
            comment: rental.feedback.comment,
            date: new Date(rental.feedback.feedback_date).toLocaleDateString(),
          }
        : null,
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

const fetchLostItemPayments = async () => {
  try {
    loading.value = true
    console.log('Fetching lost item payments...')

    // First, let's check if there are any payments at all
    const { data: simplePayments, error: simpleError } = await supabase
      .from('lost_item_payments')
      .select('*')

    if (simpleError) {
      console.error('Error in simple payments query:', simpleError)
      throw simpleError
    }

    console.log('Simple payments query result:', simplePayments)

    // Now fetch with all relations
    const { data: payments, error } = await supabase
      .from('lost_item_payments')
      .select(
        `
        *,
        rental_items (
          id,
          status,
          customer_id,
          item_id,
          rental_transactions (
            rental_date,
            return_date
          )
        ),
        customers (
          id,
          F_name,
          L_name,
          email
        ),
        items (
          id,
          brand,
          model,
          rental_price_per_day
        )
      `,
      )
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching payments with relations:', error)
      throw error
    }

    console.log('Full payments data:', payments)

    if (payments && payments.length > 0) {
      lostItemPayments.value = payments.map((payment) => {
        console.log('Processing payment:', payment)
        return {
          ...payment,
          rental_date: payment.rental_items?.rental_transactions?.[0]?.rental_date,
          return_date: payment.rental_items?.rental_transactions?.[0]?.return_date,
        }
      })
    } else {
      console.log('No payments found in database')
      lostItemPayments.value = []
    }

    console.log('Final processed payments:', lostItemPayments.value)
  } catch (error) {
    console.error('Error in fetchLostItemPayments:', error)
    snackbarMessage.value = 'Error loading payments: ' + error.message
    snackbar.value = true
  } finally {
    loading.value = false
  }
}

const checkTableStructure = async () => {
  try {
    console.log('Checking lost_item_payments table structure...')
    const { data, error } = await supabase.from('lost_item_payments').select('*').limit(1)

    if (error) {
      console.error('Error checking table:', error)
    } else {
      console.log('Table structure:', data)
    }
  } catch (error) {
    console.error('Error in checkTableStructure:', error)
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

const updateLostItemPaymentStatus = async (payment, newStatus) => {
  try {
    loading.value = true
    console.log('Updating payment status:', { payment, newStatus })

    // Optimistically update the UI
    const paymentIndex = lostItemPayments.value.findIndex((p) => p.id === payment.id)
    if (paymentIndex !== -1) {
      const updatedPayment = { ...lostItemPayments.value[paymentIndex] }
      updatedPayment.status = newStatus
      lostItemPayments.value[paymentIndex] = updatedPayment
    }

    // Update payment status
    const { data: updatedPayment, error: updateError } = await supabase
      .from('lost_item_payments')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', payment.id)
      .select('*')
      .single()

    if (updateError) {
      console.error('Payment update error:', updateError)
      throw updateError
    }

    // Handle different status updates
    if (newStatus === 'completed') {
      try {
        // Update rental item status to Completed
        const { error: rentalError } = await supabase
          .from('rental_items')
          .update({ status: RENTAL_ITEM_STATUSES.COMPLETED })
          .eq('id', payment.rental_item_id)

        if (rentalError) throw rentalError

        // Create notification for completed payment
        const { error: notificationError } = await supabase.from('notifications').insert({
          customer_id: payment.customer_id,
          title: `Lost Item Payment Processed - ${payment.items.brand} ${payment.items.model}`,
          message: `Dear ${payment.customers.F_name}, your payment for the lost item (${payment.items.brand} ${payment.items.model}) has been processed and marked as paid.`,
          type: 'payment',
          read: false,
          created_at: new Date().toISOString(),
        })

        if (notificationError) throw notificationError

        // Update local state to reflect rental status change
        if (paymentIndex !== -1) {
          lostItemPayments.value[paymentIndex].rental_items.status = RENTAL_ITEM_STATUSES.COMPLETED
        }
      } catch (error) {
        console.error('Error in completed payment updates:', error)
        throw new Error('Failed to complete payment process: ' + error.message)
      }
    } else if (newStatus === 'refunded') {
      try {
        // First update the item status to Available
        const { error: itemError } = await supabase
          .from('items')
          .update({ status: 'Available' })
          .eq('id', payment.item_id)

        if (itemError) throw itemError

        // Then update the rental status to Returned
        const { error: rentalError } = await supabase
          .from('rental_items')
          .update({ status: RENTAL_ITEM_STATUSES.RETURNED })
          .eq('id', payment.rental_item_id)

        if (rentalError) throw rentalError

        // Create notification for refund
        const { error: notificationError } = await supabase.from('notifications').insert({
          customer_id: payment.customer_id,
          title: `Lost Item Payment Refunded - ${payment.items.brand} ${payment.items.model}`,
          message: `Dear ${payment.customers.F_name}, your payment for the lost item (${payment.items.brand} ${payment.items.model}) has been refunded. The item has been returned to our inventory.`,
          type: 'refund',
          read: false,
          created_at: new Date().toISOString(),
        })

        if (notificationError) throw notificationError

        // Update local state to reflect changes
        if (paymentIndex !== -1) {
          lostItemPayments.value[paymentIndex].rental_items.status = RENTAL_ITEM_STATUSES.RETURNED
          lostItemPayments.value[paymentIndex].items.status = 'Available'
        }
      } catch (error) {
        console.error('Error in refund updates:', error)
        throw new Error('Failed to process refund: ' + error.message)
      }
    } else if (newStatus === 'failed') {
      try {
        // Update rental item status back to Lost
        const { error: rentalError } = await supabase
          .from('rental_items')
          .update({ status: RENTAL_ITEM_STATUSES.LOST })
          .eq('id', payment.rental_item_id)

        if (rentalError) throw rentalError

        // Create notification for failed payment
        const { error: notificationError } = await supabase.from('notifications').insert({
          customer_id: payment.customer_id,
          title: `Lost Item Payment Failed - ${payment.items.brand} ${payment.items.model}`,
          message: `Dear ${payment.customers.F_name}, your payment for the lost item (${payment.items.brand} ${payment.items.model}) has failed. Please contact support for assistance.`,
          type: 'payment_failed',
          read: false,
          created_at: new Date().toISOString(),
        })

        if (notificationError) throw notificationError

        // Update local state to reflect rental status change
        if (paymentIndex !== -1) {
          lostItemPayments.value[paymentIndex].rental_items.status = RENTAL_ITEM_STATUSES.LOST
        }
      } catch (error) {
        console.error('Error in failed payment updates:', error)
        throw new Error('Failed to process payment failure: ' + error.message)
      }
    }

    snackbarMessage.value = `Payment status updated to ${newStatus} successfully`
    snackbar.value = true
  } catch (error) {
    console.error('Error in updateLostItemPaymentStatus:', error)

    // Revert optimistic update if there was an error
    if (payment.id) {
      const { data } = await supabase
        .from('lost_item_payments')
        .select(
          `
          *,
          rental_items (
            id,
            status,
            customer_id,
            item_id,
            rental_transactions (
              rental_date,
              return_date
            )
          ),
          customers (
            id,
            F_name,
            L_name,
            email
          ),
          items (
            id,
            brand,
            model,
            rental_price_per_day
          )
        `,
        )
        .eq('id', payment.id)
        .single()

      if (data) {
        const paymentIndex = lostItemPayments.value.findIndex((p) => p.id === payment.id)
        if (paymentIndex !== -1) {
          lostItemPayments.value[paymentIndex] = data
        }
      }
    }

    snackbarMessage.value = 'Error updating status: ' + (error.message || error)
    snackbar.value = true
  } finally {
    loading.value = false
  }
}

const calculateCommission = async (transactionId) => {
  const rental = rentals.value.find((r) => r.id === transactionId)
  if (rental) {
    const commission = rental.total_amount * 0.1 // 10% commission

    try {
      // Insert commission record with date
      const { data: commissionData, error: commissionError } = await supabase
        .from('admin_commissions')
        .insert({
          admin_id: currentAdminId.value,
          total_commission: commission,
          commission_date: new Date().toISOString(),
        })
        .select()
        .single()

      if (commissionError) {
        console.error('Error recording commission:', commissionError)
        throw commissionError
      }

      // Update rental transaction with commission ID
      const { error: updateError } = await supabase
        .from('rental_transactions')
        .update({ admin_commissions_id: commissionData.id })
        .eq('id', transactionId)

      if (updateError) {
        console.error('Error updating rental transaction:', updateError)
        throw updateError
      }

      return commission
    } catch (error) {
      console.error('Error in commission process:', error)
      throw error
    }
  }
  return 0
}

watch(
  lostItemPayments,
  (newValue) => {
    console.log('lostItemPayments changed:', newValue)
  },
  { deep: true },
)

onMounted(async () => {
  await checkTableStructure()
  await Promise.all([
    fetchCurrentAdmin(),
    fetchRentals(),
    fetchRentalItems(),
    fetchLostItemPayments(),
  ])

  // Set up real-time subscription for lost item payments
  const paymentsSubscription = supabase
    .channel('lost_item_payments_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'lost_item_payments',
      },
      (payload) => {
        console.log('Payment change detected:', payload)
        fetchLostItemPayments()
      },
    )
    .subscribe()

  // Clean up subscription on component unmount
  onUnmounted(() => {
    paymentsSubscription.unsubscribe()
  })
})
</script>

<script>
export default {
  data() {
    return {
      activeView: 'transactionDetails', // Default active view
      // Existing data properties...
    }
  },
  methods: {
    // Existing methods...
  },
}
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
                <div class="text-caption text-grey">
                  Last commission on
                  {{
                    commissionData && commissionData[0]?.commission_date
                      ? new Date(commissionData[0].commission_date).toLocaleDateString()
                      : 'No commissions yet'
                  }}
                </div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="4">
            <v-card>
              <v-card-text class="text-center">
                <div class="text-h6 mb-1">Total Rentals</div>
                <div class="text-h4">{{ rentals.length }}</div>
                <br />
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
                <br />
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Filter Buttons -->
        <v-row justify="center" class="my-5" align="center ">
          <v-btn
            color="primary"
            class="mx-2"
            :outlined="activeView !== 'transactionDetails'"
            @click="activeView = 'transactionDetails'"
          >
            Transaction Details
          </v-btn>
          <v-btn
            color="primary"
            class="mx-2"
            :outlined="activeView !== 'lostItems'"
            @click="activeView = 'lostItems'"
          >
            Lost Items Payment
          </v-btn>
          <v-btn
            color="primary"
            class="mx-2"
            :outlined="activeView !== 'rentalItems'"
            @click="activeView = 'rentalItems'"
          >
            Rental Items
          </v-btn>
        </v-row>
        <div v-if="activeView === 'transactionDetails'">
          <!-- Transaction Details -->
          <v-card class="mt-4">
            <v-card-title class="d-flex align-center">
              <v-icon icon="mdi-clipboard-list" class="me-2"></v-icon>
              Manage Transactions
            </v-card-title>
            <v-card-text>
              <div class="table-wrapper">
                <v-table v-if="!loading && rentals.length > 0" fixed-header height="400">
                  <thead>
                    <tr>
                      <th>Transaction ID</th>
                      <th>Customer</th>
                      <th>Registration Date</th>
                      <th>Rental Date</th>
                      <th>Return Date</th>
                      <th>Total Amount</th>
                      <th>Commission</th>
                      <th>Feedback</th>
                      <th>Payment Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="rental in rentals" :key="rental.id">
                      <td>{{ rental.id }}</td>
                      <td>{{ rental.customers?.F_name }} {{ rental.customers?.L_name }}</td>
                      <td>
                        {{
                          rental.customers?.registration_date
                            ? new Date(rental.customers.registration_date).toLocaleDateString()
                            : 'N/A'
                        }}
                      </td>
                      <td>{{ rental.rental_date }}</td>
                      <td>{{ rental.return_date || 'Not returned' }}</td>
                      <td>${{ rental.total_amount?.toFixed(2) }}</td>
                      <td>
                        <v-tooltip v-if="rental.commission_info" location="top">
                          <template v-slot:activator="{ props }">
                            <span v-bind="props"
                              >${{ rental.commission_info.amount?.toFixed(2) }}</span
                            >
                          </template>
                          Recorded on {{ rental.commission_info.date }}
                        </v-tooltip>
                        <span v-else>-</span>
                      </td>
                      <td>
                        <v-tooltip v-if="rental.feedback_info" location="top">
                          <template v-slot:activator="{ props }">
                            <v-rating
                              v-bind="props"
                              :model-value="rental.feedback_info.rating"
                              readonly
                              density="compact"
                              size="small"
                            ></v-rating>
                          </template>
                          {{ rental.feedback_info.comment || 'No comment provided' }}
                          <br />
                          Submitted on {{ rental.feedback_info.date }}
                        </v-tooltip>
                        <span v-else>No feedback</span>
                      </td>
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
              </div>
            </v-card-text>
          </v-card>
        </div>

        <div v-else-if="activeView === 'lostItems'">
          <!-- Lost Items Payment Management -->
          <v-card class="mt-4">
            <v-card-title class="d-flex align-center">
              <v-icon icon="mdi-cash-multiple" class="mr-2"></v-icon>
              Lost Items Payment Management
              <v-spacer></v-spacer>
            </v-card-title>

            <v-divider></v-divider>

            <div class="table-wrapper">
              <v-table fixed-header height="400">
                <thead>
                  <tr>
                    <th>Payment Date</th>
                    <th>Customer</th>
                    <th>Item</th>
                    <th>Amount</th>
                    <th>Payment Method</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="loading">
                    <td colspan="7" class="text-center">
                      <v-progress-circular indeterminate color="primary"></v-progress-circular>
                    </td>
                  </tr>
                  <tr v-else-if="!lostItemPayments.length">
                    <td colspan="7" class="text-center">No lost item payments found</td>
                  </tr>
                  <template v-else>
                    <tr v-for="payment in lostItemPayments" :key="payment.id">
                      <td>{{ new Date(payment.payment_date).toLocaleDateString() }}</td>
                      <td>
                        {{ payment.customers?.F_name || '' }} {{ payment.customers?.L_name || '' }}
                        <div class="text-caption">{{ payment.customers?.email || 'No email' }}</div>
                      </td>
                      <td>
                        {{ payment.items?.brand || '' }} {{ payment.items?.model || '' }}
                        <div class="text-caption">
                          <!-- Rental: {{ payment.rental_date ? new Date(payment.rental_date).toLocaleDateString() : 'N/A' }} -->
                          -
                          {{
                            payment.return_date
                              ? new Date(payment.return_date).toLocaleDateString()
                              : 'Not returned'
                          }}
                        </div>
                      </td>
                      <td>${{ payment.amount.toFixed(2) }}</td>
                      <td>{{ payment.payment_method }}</td>
                      <td>
                        <v-chip
                          :color="
                            payment.status === 'completed'
                              ? 'success'
                              : payment.status === 'pending'
                                ? 'warning'
                                : payment.status === 'failed'
                                  ? 'error'
                                  : 'grey'
                          "
                          size="small"
                        >
                          {{ payment.status }}
                        </v-chip>
                      </td>
                      <td>
                        <v-menu>
                          <template v-slot:activator="{ props }">
                            <v-btn
                              icon="mdi-dots-vertical"
                              variant="text"
                              size="small"
                              v-bind="props"
                            ></v-btn>
                          </template>
                          <v-list>
                            <v-list-item
                              v-for="status in paymentStatuses"
                              :key="status.value"
                              :disabled="payment.status === status.value"
                              @click="updateLostItemPaymentStatus(payment, status.value)"
                            >
                              <v-list-item-title>Mark as {{ status.label }}</v-list-item-title>
                            </v-list-item>
                          </v-list>
                        </v-menu>
                      </td>
                    </tr>
                  </template>
                </tbody>
              </v-table>
            </div>
          </v-card>
        </div>

        <div v-else-if="activeView === 'rentalItems'">
          <!-- Rental Items -->
          <v-card class="mt-4">
            <v-card-title class="d-flex align-center">
              <v-icon icon="mdi-camera" class="me-2"></v-icon>
              Rental Items
            </v-card-title>
            <v-card-text>
              <div class="table-wrapper">
                <v-table v-if="!loading && rentalItems.length > 0" fixed-header height="400">
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
                      <td>
                        {{ new Date(item.rental_transactions.rental_date).toLocaleDateString() }}
                      </td>
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
              </div>
            </v-card-text>
          </v-card>
        </div>

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
.table-wrapper {
  position: relative;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 4px;
  margin: 8px 0;
}

.v-table {
  background: transparent !important;
}

.v-table > .v-table__wrapper > table {
  background: transparent !important;
}

.v-table__wrapper {
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(var(--v-theme-on-surface), 0.12) transparent;
}

.v-table__wrapper::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.v-table__wrapper::-webkit-scrollbar-track {
  background: transparent;
}

.v-table__wrapper::-webkit-scrollbar-thumb {
  background-color: rgba(var(--v-theme-on-surface), 0.12);
  border-radius: 4px;
}

.v-table__wrapper::-webkit-scrollbar-thumb:hover {
  background-color: rgba(var(--v-theme-on-surface), 0.24);
}

.v-table > .v-table__wrapper > table > thead > tr > th {
  background: var(--v-theme-background);
  position: sticky;
  top: 0;
  z-index: 1;
  font-weight: 600;
}

.v-table > .v-table__wrapper > table > tbody > tr:hover {
  background: rgba(var(--v-theme-on-surface), 0.04);
}

/* Add subtle shadow to fixed header */
.v-table > .v-table__wrapper > table > thead > tr > th::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 1px;
  background: rgba(var(--v-border-color), var(--v-border-opacity));
}
</style>
