import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSavedItemsStore = defineStore('savedItems', {
  state: () => ({
    savedItems: [],
  }),
  actions: {
    saveItem(item) {
      if (!this.savedItems.some((savedItem) => savedItem.id === item.id)) {
        this.savedItems.push(item)
      }
    },
    removeItem(itemId) {
      const index = this.savedItems.findIndex((item) => item.id === itemId)
      if (index !== -1) {
        this.savedItems.splice(index, 1)
      }
    },
  },
  persist: true,
})
