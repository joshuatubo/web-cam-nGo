import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCartStore = defineStore('cart', () => {
  const cartItems = ref([])

  const addToCart = (item) => {
    if (!cartItems.value.some((cartItem) => cartItem.id === item.id)) {
      cartItems.value.push(item)
    }
  }

  const removeFromCart = (itemId) => {
    const index = cartItems.value.findIndex((item) => item.id === itemId)
    if (index !== -1) {
      cartItems.value.splice(index, 1)
    }
  }

  return {
    cartItems,
    addToCart,
    removeFromCart
  }
})
