<script setup>
import AppLayout from '@/components/layout/AppLayout.vue'
import '@/assets/cart_style.css'
import { ref } from 'vue'

// Sample cart data
const cartItems = ref([
  {
    id: 1,
    name: 'Canon EOS R5',
    price: 3000,
    quantity: 1,
    image: '/images/canon-eos-r5.jpg',
  },
  {
    id: 2,
    name: 'Sony Alpha 7 IV',
    price: 2500,
    quantity: 2,
    image: '/images/sony-alpha-7.jpg',
  },
  {
    id: 3,
    name: 'Canon EOS R5',
    price: 3000,
    quantity: 1,
    image: '/images/canon-eos-r5.jpg',
  },
  {
    id: 4,
    name: 'Sony Alpha 7 IV',
    price: 2500,
    quantity: 2,
    image: '/images/sony-alpha-7.jpg',
  },
  {
    id: 5,
    name: 'Canon EOS R5',
    price: 3000,
    quantity: 1,
    image: '/images/canon-eos-r5.jpg',
  },
  {
    id: 6,
    name: 'Sony Alpha 7 IV',
    price: 2500,
    quantity: 2,
    image: '/images/sony-alpha-7.jpg',
  },
  {
    id: 7,
    name: 'Canon EOS R5',
    price: 3000,
    quantity: 1,
    image: '/images/canon-eos-r5.jpg',
  },
  {
    id: 8,
    name: 'Sony Alpha 7 IV',
    price: 2500,
    quantity: 2,
    image: '/images/sony-alpha-7.jpg',
  },
  // Add more items as needed
])

// Total calculation
const calculateTotal = () => {
  return cartItems.value.reduce((total, item) => total + item.price * item.quantity, 0)
}

// Update the quantity of an item in the cart
const updateQuantity = (itemId, newQuantity) => {
  const item = cartItems.value.find((item) => item.id === itemId)
  if (item) {
    item.quantity = newQuantity
  }
}

// Remove an item from the cart
const removeItem = (itemId) => {
  const index = cartItems.value.findIndex((item) => item.id === itemId)
  if (index !== -1) {
    cartItems.value.splice(index, 1)
  }
}

// Proceed to checkout function (to be expanded later with logic)
const proceedToCheckout = () => {
  console.log('Proceeding to checkout')
}
</script>

<template>
  <AppLayout>
    <template #content>
      <!-- Navigation Bar -->
      <nav>
        <v-container>
          <v-row align="center" justify="space-between">
            <!-- Left: Your Cart -->
            <v-col cols="auto">
              <h1>Your Cart</h1>
            </v-col>

            <!-- Right: Total Summary -->
            <v-col cols="auto" class="text-right">
              <h3>Total: ₱{{ calculateTotal() }}</h3>
              <v-btn
                class="checkout-btn"
                @click="proceedToCheckout"
                :disabled="cartItems.length === 0"
              >
                Checkout
              </v-btn>
            </v-col>
          </v-row>
        </v-container>
      </nav>
      <div class="cart">
        <div v-if="cartItems.length > 0" class="cart-items">
          <div v-for="item in cartItems" :key="item.id" class="cart-item">
            <img :src="item.image" :alt="item.name" class="cart-item-image" />
            <div class="cart-item-details">
              <h3>{{ item.name }}</h3>
              <p>Price: ₱{{ item.price }}</p>
              <p>Subtotal: ₱{{ item.price * item.quantity }}</p>

              <div class="quantity-controls">
                <button
                  @click="updateQuantity(item.id, item.quantity - 1)"
                  :disabled="item.quantity <= 1"
                >
                  -
                </button>
                <span>{{ item.quantity }}</span>
                <button @click="updateQuantity(item.id, item.quantity + 1)">+</button>
              </div>

              <button @click="removeItem(item.id)" class="remove-item-btn">Remove</button>
            </div>
          </div>
        </div>

        <div v-else>
          <p>Your cart is empty.</p>
        </div>
      </div>
    </template>
  </AppLayout>
</template>
