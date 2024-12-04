<script setup>
import AppLayout from '@/components/layout/AppLayout.vue'
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
      <div class="cart">
        <h1>Your Cart</h1>

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

        <div class="cart-summary">
          <h3>Total: ₱{{ calculateTotal() }}</h3>
          <button
            @click="proceedToCheckout"
            class="checkout-btn"
            :disabled="cartItems.length === 0"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </template>
  </AppLayout>
</template>

<style scoped>
.cart {
  padding: 20px;
  font-family: Arial, sans-serif;
}

.cart h1 {
  font-size: 24px;
  margin-bottom: 20px;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cart-item {
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.cart-item-image {
  max-width: 100px;
  height: auto;
  margin-right: 20px;
  border-radius: 8px;
}

.cart-item-details {
  flex: 1;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 10px 0;
}

.quantity-controls button {
  padding: 5px 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.quantity-controls button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.remove-item-btn {
  margin-top: 10px;
  padding: 8px 12px;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.remove-item-btn:hover {
  background-color: #c0392b;
}

.cart-summary {
  margin-top: 30px;
  text-align: right;
}

.checkout-btn {
  padding: 10px 20px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.checkout-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>
