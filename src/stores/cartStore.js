// src/store/cartStore.js

import { ref } from 'vue'

// Shared cart state as a reactive reference
export const cartStore = ref([])

// Function to add an item to the cart
export const addToCart = (item) => {
  const exists = cartStore.value.find((cartItem) => cartItem.id === item.id)
  if (!exists) {
    cartStore.value.push(item)
    console.log('Item added to cart:', item)
  } else {
    console.log('Item already in the cart')
  }
}

// Function to remove an item from the cart
export const removeFromCart = (index) => {
  cartStore.value.splice(index, 1)
  console.log('Item removed from cart')
}

// Function to rent an item from the cart (also removes it from the cart after rental)
export const rentFromCart = async (item, index) => {
  try {
    // Here you would update the item status in the database (e.g., using API)
    item.status = 'Rented'
    cartStore.value.splice(index, 1) // Remove item from cart after renting
    console.log('Item rented:', item)
  } catch (error) {
    console.error('Error renting item:', error)
  }
}
