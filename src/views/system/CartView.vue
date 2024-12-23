<template>
  <div>
    <v-card flat>
      <v-card-title>My Cart</v-card-title>
      <v-divider></v-divider>
      <v-container>
        <v-row v-if="cartItems.length > 0">
          <v-col v-for="item in cartItems" :key="item.id" cols="12" sm="6" md="4">
            <v-card class="my-2" elevation="2" outlined>
              <v-img :src="item.image" height="200" cover></v-img>
              <v-card-title>
                <div>
                  <h3 class="mb-1">{{ item.brand }} {{ item.model }}</h3>
                  <p class="text-subtitle-2 text-medium-emphasis">
                    {{ item.specification }}
                  </p>
                </div>
              </v-card-title>
              <v-card-text>
                <p class="mb-2">Rental Price: ${{ item.rental_price_per_day.toFixed(2) }}/day</p>
                <v-chip
                  :color="
                    item.status === 'Available'
                      ? 'green'
                      : item.status === 'Rented'
                        ? 'blue'
                        : 'red'
                  "
                  class="text-uppercase"
                  size="small"
                  label
                >
                  {{ item.status }}
                </v-chip>
              </v-card-text>
              <v-card-actions>
                <v-btn color="error" variant="tonal" @click="removeFromCart(item.id)">
                  Remove from Cart
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
        <v-row v-else>
          <v-col cols="12" class="text-center">
            <p class="text-h6">Your cart is empty</p>
          </v-col>
        </v-row>
      </v-container>
    </v-card>
  </div>
</template>

<script setup>
import { useCartStore } from '@/stores/cart'

const cartStore = useCartStore()
const cartItems = cartStore.cartItems

const removeFromCart = (itemId) => {
  cartStore.removeFromCart(itemId)
}
</script>
