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
const selectedItem = ref(null)
const detailsDialog = ref(false)

// Fetch cameras from Supabase
const fetchCameras = async () => {
  try {
    const { data, error } = await supabase.from('items').select(`
        *,
        feedback (
          id,
          rating,
          comment,
          feedback_date,
          customer_id
        )
      `)
    if (error) throw error

    cameras.value = data.map((item) => ({
      id: item.id,
      brand: item.brand,
      model: item.model,
      specification: item.specification,
      rental_price_per_day: item.rental_price_per_day || 0.0,
      status: item.status || 'Out of Stock',
      image: item.image,
      feedback: item.feedback || [],
      averageRating:
        item.feedback && item.feedback.length > 0
          ? (item.feedback.reduce((sum, f) => sum + f.rating, 0) / item.feedback.length).toFixed(1)
          : null,
      isLoading: false,
    }))
  } catch (error) {
    console.error('Error fetching cameras:', error)
  }
}

const openDetails = (item) => {
  selectedItem.value = item
  detailsDialog.value = true
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

<template>
  <AppLayout>
    <template #content>
      <div>
        <v-card flat style="height: 1000vh">
          <!-- Title and Search -->
          <v-card-title class="d-flex align-center pe-2">
            <v-icon icon="mdi-video-input-component"></v-icon>&nbsp; Browse Section
            <v-spacer></v-spacer>
            <v-text-field
              v-model="search"
              density="compact"
              label="Search"
              rounded=""
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
                  <v-img :src="item.image" height="200" cover>
                    <template v-slot:placeholder>
                      <v-row class="fill-height ma-0" align="center" justify="center">
                        <v-progress-circular
                          indeterminate
                          color="grey-lighten-5"
                        ></v-progress-circular>
                      </v-row>
                    </template>
                  </v-img>
                  <v-card-title class="text-truncate"
                    >{{ item.brand }} {{ item.model }}</v-card-title
                  >
                  <v-card-subtitle class="text-truncate">{{ item.specification }}</v-card-subtitle>
                  <v-card-text>
                    <div class="d-flex align-center mb-2">
                      <span class="text-h6">${{ item.rental_price_per_day.toFixed(2) }}</span>
                      <span class="text-subtitle-1 ms-1">/day</span>
                      <v-spacer></v-spacer>
                      <div v-if="item.averageRating" class="d-flex align-center">
                        <v-rating
                          :model-value="parseFloat(item.averageRating)"
                          color="warning"
                          density="compact"
                          size="small"
                          half-increments
                          readonly
                        ></v-rating>
                        <span class="text-body-2 ms-1">({{ item.feedback.length }})</span>
                      </div>
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
                    <v-btn
                      v-if="item.feedback && item.feedback.length > 0"
                      variant="text"
                      density="compact"
                      class="ms-2"
                      @click="openDetails(item)"
                    >
                      View Reviews
                    </v-btn>
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

        <!-- Details Dialog with Reviews -->
        <v-dialog v-model="detailsDialog" max-width="600px">
          <v-card v-if="selectedItem">
            <v-card-title class="text-h5 bg-primary text-white pa-4">
              Reviews for {{ selectedItem.brand }} {{ selectedItem.model }}
            </v-card-title>

            <v-card-text class="pa-4">
              <div class="d-flex align-center mb-4">
                <v-rating
                  :model-value="parseFloat(selectedItem.averageRating)"
                  color="warning"
                  half-increments
                  readonly
                ></v-rating>
                <span class="text-h6 ms-2">{{ selectedItem.averageRating }}/5</span>
                <span class="text-body-2 ms-2">({{ selectedItem.feedback.length }} reviews)</span>
              </div>

              <v-divider></v-divider>

              <v-list>
                <v-list-item
                  v-for="feedback in selectedItem.feedback"
                  :key="feedback.id"
                  class="mb-2"
                >
                  <template v-slot:prepend>
                    <v-avatar color="primary" size="36">
                      <v-icon icon="mdi-account" color="white"></v-icon>
                    </v-avatar>
                  </template>
                  <v-list-item-title>
                    <v-rating
                      :model-value="feedback.rating"
                      readonly
                      density="compact"
                      size="small"
                    ></v-rating>
                  </v-list-item-title>
                  <v-list-item-subtitle class="mt-1">
                    {{ feedback.comment || 'No comment provided' }}
                  </v-list-item-subtitle>
                  <v-list-item-subtitle class="text-caption mt-1">
                    {{ new Date(feedback.feedback_date).toLocaleDateString() }}
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-card-text>

            <v-card-actions class="pa-4">
              <v-spacer></v-spacer>
              <v-btn color="grey" variant="text" @click="detailsDialog = false">Close</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </div>
    </template>
  </AppLayout>
</template>

<style scoped>
.v-card {
  transition: transform 0.2s;
}
.v-card:hover {
  transform: translateY(-4px);
}
</style>
