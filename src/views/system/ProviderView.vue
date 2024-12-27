<!-- <template>
  <v-container class="provider-view" fluid>
    <v-row justify="space-between" class="mb-4">
      <v-col>
        <h1 class="text-h4 font-weight-bold">Provider Inventory</h1>
      </v-col>
      <v-col class="d-flex justify-end">
        <v-btn color="primary" @click="showModal = true" class="add-button" elevation="2"
          >Add New Item</v-btn
        >
      </v-col>
    </v-row>

    
    <v-dialog v-model="showModal" persistent max-width="800px">
      <v-card class="rounded-card">
        <v-card-title class="headline">Add New Item</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="addItem">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="newItem.brand"
                  label="Brand"
                  required
                  outlined
                  dense
                  class="rounded-input"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="newItem.model"
                  label="Model"
                  required
                  outlined
                  dense
                  class="rounded-input"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="newItem.specification"
                  label="Specification"
                  required
                  outlined
                  dense
                  class="rounded-input"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="newItem.rental_price_per_day"
                  label="Rental Price per Day"
                  type="number"
                  required
                  outlined
                  dense
                  class="rounded-input"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="newItem.status"
                  :items="statusOptions"
                  label="Status"
                  required
                  outlined
                  dense
                  class="rounded-input"
                ></v-select>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="newItem.serial_number"
                  label="Serial Number"
                  required
                  outlined
                  dense
                  class="rounded-input"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="newItem.image"
                  label="Image URL"
                  outlined
                  dense
                  class="rounded-input"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-row>
            <v-col cols="6">
              <v-btn color="secondary" @click="closeModal" block>Cancel</v-btn>
            </v-col>
            <v-col cols="6">
              <v-btn color="primary" @click="addItem" block>Add Item</v-btn>
            </v-col>
          </v-row>
        </v-card-actions>
      </v-card>
    </v-dialog>

    
    <ItemsTable :products="products" :headers="headers" />
  </v-container>
</template>

<script>
import { ref } from 'vue'
import { supabase } from '@/utilities/supabaseClient'
import ItemsTable from '@/components/layout/ItemsTable.vue'

export default {
  name: 'ProviderView',
  components: {
    ItemsTable,
  },
  data() {
    return {
      products: [],
      newItem: {
        brand: '',
        model: '',
        specification: '',
        rental_price_per_day: null,
        status: '',
        serial_number: '',
        image: '',
      },
      statusOptions: ['Available', 'Rented', 'Out of Stock'],
      showModal: false,
      headers: [
        { title: 'Brand', key: 'brand' },
        { title: 'Model', key: 'model' },
        { title: 'Specification', key: 'specification' },
        { title: 'Rental Price per Day', key: 'rental_price_per_day' },
        { title: 'Status', key: 'status' },
        { title: 'Serial Number', key: 'serial_number' },
        { title: 'Image', key: 'image', sortable: false },
        { title: 'Actions', key: 'actions', sortable: false },
      ],
    }
  },
  methods: {
    async addItem() {
      const { brand, model, specification, rental_price_per_day, status, serial_number, image } =
        this.newItem

      if (
        !brand ||
        !model ||
        !specification ||
        !rental_price_per_day ||
        !status ||
        !serial_number
      ) {
        alert('All fields are required!')
        return
      }

      const { data, error } = await supabase.from('items').insert([
        {
          brand,
          model,
          specification,
          rental_price_per_day,
          status,
          serial_number,
          image,
        },
      ])

      if (error) {
        console.error('Error adding item:', error.message)
        alert('Error adding item')
      } else {
        this.clearForm()
        this.fetchProducts()
        this.closeModal()
      }
    },

    clearForm() {
      this.newItem = {
        brand: '',
        model: '',
        specification: '',
        rental_price_per_day: null,
        status: '',
        serial_number: '',
        image: '',
      }
    },

    async fetchProducts() {
      const { data, error } = await supabase.from('items').select('*')
      if (error) {
        console.error('Error fetching products:', error.message)
      } else {
        this.products = data
      }
    },

    closeModal() {
      this.showModal = false
    },
  },
  mounted() {
    this.fetchProducts()
  },
}
</script>

<style scoped>
.provider-view {
  padding: 20px;
}

.add-button {
  padding: 12px 24px;
  font-size: 1rem;
}

.v-dialog .v-card {
  background-color: #f5f5f5;
  border-radius: 12px;
}

.v-text-field {
  margin-bottom: 1rem;
}

.v-btn {
  font-size: 1rem;
  text-transform: none;
}

.v-btn:hover {
  background-color: #0056b3;
}

.rounded-card {
  border-radius: 12px;
  overflow: hidden;
}

.v-col {
  padding: 8px;
}

/* Make the Text Fields Rounded */
.rounded-input .v-input__control {
  border-radius: 15px !important;
}

.rounded-input .v-select__selections {
  border-radius: 15px !important;
}
</style> -->
