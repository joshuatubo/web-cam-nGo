<template>
  <AppLayout>
    <template #content>
      <div>
        <v-card flat>
          <!-- Title and Search -->
          <v-card-title class="d-flex align-center pe-2">
            <v-icon icon="mdi-video-input-component"></v-icon>&nbsp; Browse Section
            <v-spacer></v-spacer>
            <v-text-field
              v-model="search"
              density="compact"
              label="Search"
              prepend-inner-icon="mdi-magnify"
              variant="solo-filled"
              flat
              hide-details
            ></v-text-field>
          </v-card-title>

          <v-divider></v-divider>

          <!-- Filter Buttons -->
          <v-row justify="center" class="my-4" align="center">
            <v-btn :variant="filter === 'All' ? 'tonal' : 'plain'" @click="filter = 'All'"
              >All</v-btn
            >
            <v-btn
              :variant="filter === 'Available' ? 'tonal' : 'plain'"
              @click="filter = 'Available'"
              color="green"
              >Available</v-btn
            >
            <v-btn
              :variant="filter === 'Rented' ? 'tonal' : 'plain'"
              @click="filter = 'Rented'"
              color="blue"
              >Rented</v-btn
            >
            <v-btn
              :variant="filter === 'Out of Stock' ? 'tonal' : 'plain'"
              @click="filter = 'Out of Stock'"
              color="red"
              >Out of Stock</v-btn
            >
          </v-row>

          <!-- Camera Cards -->
          <v-container>
            <v-row>
              <v-col v-for="item in filteredCameras" :key="item.id" cols="12" sm="6" md="4">
                <v-card class="my-2" elevation="2">
                  <v-img :src="item.image" height="200" cover></v-img>
                  <v-card-title class="text-truncate"
                    >{{ item.brand }} {{ item.model }}</v-card-title
                  >
                  <v-card-subtitle class="text-truncate">{{ item.specification }}</v-card-subtitle>
                  <v-card-text>
                    <div class="d-flex align-center mb-2">
                      <span class="text-h6">${{ item.rental_price_per_day.toFixed(2) }}</span>
                      <span class="text-subtitle-1 ms-1">/day</span>
                    </div>
                    <v-chip
                      :color="
                        item.status === 'Available'
                          ? 'success'
                          : item.status === 'Rented'
                            ? 'info'
                            : 'error'
                      "
                      :text="item.status"
                      size="small"
                      variant="tonal"
                    ></v-chip>
                  </v-card-text>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                      :disabled="item.status !== 'Available'"
                      :loading="item.isLoading"
                      color="primary"
                      variant="tonal"
                      @click="saveItem(item)"
                    >
                      <v-icon start>mdi-bookmark</v-icon>
                      Save Item
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-col>
            </v-row>
          </v-container>
        </v-card>
      </div>
    </template>
  </AppLayout>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/utilities/supabaseClient'
import { useSavedItemsStore } from '@/stores/savedItems'
import AppLayout from '@/components/layout/AppLayout.vue'
import '@/assets/theme_style.css'

const savedItemsStore = useSavedItemsStore()
const search = ref('')
const filter = ref('All')
const cameras = ref([])

// Fetch cameras from Supabase
const fetchCameras = async () => {
  try {
    const { data, error } = await supabase.from('items').select('*')
    if (error) throw error

    cameras.value = data.map((item) => ({
      id: item.id,
      brand: item.brand,
      model: item.model,
      specification: item.specification,
      rental_price_per_day: item.rental_price_per_day || 0.0,
      status: item.status || 'Out of Stock',
      image: item.image,
      isLoading: false,
    }))
  } catch (error) {
    console.error('Error fetching cameras:', error)
  }
}

// Filtered cameras based on search and filter
const filteredCameras = computed(() => {
  return cameras.value.filter((camera) => {
    const matchesSearch =
      camera.brand.toLowerCase().includes(search.value.toLowerCase()) ||
      camera.model.toLowerCase().includes(search.value.toLowerCase()) ||
      camera.specification.toLowerCase().includes(search.value.toLowerCase())
    const matchesFilter = filter.value === 'All' || camera.status === filter.value

    return matchesSearch && matchesFilter
  })
})

// Save item for later booking
const saveItem = (item) => {
  item.isLoading = true
  setTimeout(() => {
    savedItemsStore.saveItem({
      id: item.id,
      brand: item.brand,
      model: item.model,
      specification: item.specification,
      rental_price_per_day: item.rental_price_per_day,
      status: item.status,
      image: item.image,
    })
    item.isLoading = false
  }, 500)
}

onMounted(fetchCameras)
</script>
