<script setup>
import '@/assets/theme_style.css'

//import { useAuthUserStore } from '@/stores/authUser'
import { ref, onMounted } from 'vue'
//import { useDisplay } from 'vuetify'
//import { isAuthenticated } from '@/utilities/supabase'

// Profile Header section libraries
import { supabase, formActionDefault } from '@/utilities/supabase'
import { getAvatarText } from '@/utilities/helpers'
import { useRouter } from 'vue-router'
const router = useRouter()
//end profile header libraries

// Navigate to a specific route
const navigateTo = (route) => {
  router.push({ name: route }) // Make sure you have the corresponding routes defined in your router
}
// Profile Header section

//load variables
const userData = ref({
  initials: '',
  email: '',
  fullname: '',
})
const formAction = ref({
  ...formActionDefault,
})

//Logout functionality
const onLogout = async () => {
  formAction.value = { ...formActionDefault }
  formAction.value.formProcess = true

  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('Error signing out:', error.message)
    return
  }

  //Rediret to login page
  formAction.value.formProess = false
  router.replace('/')
}

//getting the user information funtionality
const getUser = async () => {
  const {
    data: {
      user: { user_metadata: metadata },
    },
  } = await supabase.auth.getUser()

  userData.value.email = metadata.email
  userData.value.fullname = metadata.firstname + ' ' + metadata.lastname
  userData.value.initials = getAvatarText(userData.value.fullname)
}

// Load funtions during component rendering
onMounted(() => {
  getUser()
})

// End Profile Header section

// For drawer
//const props = defineProps(['isWithAppBarNavIcon'])

//const emit = defineEmits(['isDrawerVisible', 'theme'])

// Utilize pre-defined vue functions
//const { xs, sm, mobile } = useDisplay()

// Use Pinia Store
//const authStore = useAuthUserStore()

// Load Variables
//const isLoggedIn = ref(false)
//const isMobileLogged = ref(false)
//const isDesktop = ref(false)

// Get Authentication status from supabase (needed for loading)
/*
const getLoggedStatus = async () => {
  isLoggedIn.value = await isAuthenticated()
}
*/
//isMobileLogged.value = mobile.value && isLoggedIn.value
//isDesktop.value = !mobile.value && (isLoggedIn.value || !isLoggedIn.value)
//}

// Load Functions during component rendering
//onMounted(() => {
//getLoggedStatus()
//})

// For theme toggle
const theme = ref(localStorage.getItem('theme') ?? 'dark')
function onClick() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
  localStorage.setItem('theme', theme.value)
}

onMounted(() => {
  document.body.setAttribute('data-theme', theme.value)
})

/*For Drawer Expansion animation*/
</script>

<template>
  <v-responsive>
    <v-card :theme="theme">
      <v-layout>
        <!-- Horizontal Navigation Bar -->
        <div class="navbar">
          <div class="logo ml-10" @click="navigateTo('home')">Cam 'n Go</div>
          <input type="text" class="search-bar" placeholder="Search..." />
          <!-- Menu icon for small screens -->
          <v-btn class="menu-icon" @click="isDrawerOpen = !isDrawerOpen" icon>
            <v-icon>mdi-menu</v-icon>
          </v-btn>
        </div>
        <v-navigation-drawer
          expand-on-hover
          rail
          class="d-flex flex-column"
          style="overflow-y: auto"
        >
          <!-- Profile Header -->
          <v-list density="compact" nav>
            <v-list-item
              prepend-icon="mdi-home-outline"
              title="Home"
              value="homepage"
              :to="{ name: 'dashboard' }"
            ></v-list-item>
          </v-list>
          <v-divider></v-divider>
          <v-list density="compact" nav>
            <v-list-item
              prepend-icon="mdi-cart-outline"
              title="Cart"
              value="cart"
              :to="{ name: 'cart' }"
            ></v-list-item>
            <v-list-item
              prepend-icon="mdi-bookmark-multiple"
              title="Saved Items"
              value="saved"
              :to="{ name: 'checkout' }"
            ></v-list-item>
            <!--When declaring a path use this '  :to="{ name: '' }" ' -->
            <!--Instead of using @click, as it will bug the nav drawer-->
            <v-list-item
              prepend-icon="mdi-history"
              title="Rental History"
              value="rental-history"
            ></v-list-item>
            <v-list-item
              prepend-icon="mdi-camera-outline"
              title="Browse Cameras"
              value="browse-cameras"
              :to="{ name: 'browse' }"
            ></v-list-item>
          </v-list>

          <!-- Logout Dialog -->
          <template v-slot:append>
            <div>
              <v-divider></v-divider>
              <!--Theme Toggle-->
              <v-list density="compact" nav>
                <v-list-item
                  prepend-icon="mdi mdi-theme-light-dark"
                  title="Change Theme"
                  value="theme"
                  :icon="theme === 'light' ? 'mdi-weather-sunny' : 'mdi-weather-night'"
                  @click="onClick"
                ></v-list-item>
              </v-list>
              <!--Dialogue Logout-->
              <v-dialog max-width="500" persistent>
                <template v-slot:activator="{ props: activatorProps }">
                  <v-list>
                    <v-list-item
                      prepend-icon="mdi-account-circle-outline"
                      :subtitle="userData.email"
                      :title="userData.fullname"
                    >
                      <template v-slot:append>
                        <v-btn size="small" icon>
                          <v-icon icon="mdi-menu-up"></v-icon>
                          <v-menu
                            activator="parent"
                            location="bottom end"
                            transition="fade-transition"
                          >
                            <v-list density="compact" min-width="250" rounded="lg" slim>
                              <v-list-item
                                :title="userData.fullname"
                                :subtitle="userData.email"
                              ></v-list-item>
                              <v-divider class="my-2"></v-divider>
                              <v-list density="comfortable" nav>
                                <v-list-item
                                  prepend-icon="mdi-account-cog"
                                  v-bind="activatorProps"
                                  color="surface-variant"
                                  text="Logout"
                                  variant="flat"
                                  title="Logout"
                                ></v-list-item>
                              </v-list>
                            </v-list>
                          </v-menu>
                        </v-btn>
                      </template>
                    </v-list-item>
                  </v-list>
                </template>

                <!--Logout function-->
                <template v-slot:default="{ isActive }">
                  <v-card title="Leaving Now?" v-if="isActive.value">
                    <v-card-text>Logging out will require you to login again.</v-card-text>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn text="Nevermind" @click="isActive.value = false"></v-btn>

                      <v-btn
                        text="Proceed"
                        @click="onLogout"
                        :loading="formAction.formProcess"
                        :disabled="formAction.formProcess"
                      ></v-btn>
                    </v-card-actions>
                  </v-card>
                </template>
              </v-dialog>
            </div>
          </template>
        </v-navigation-drawer>

        <v-main class="mt-10">
          <slot name="content"></slot>
        </v-main>
        <!-- <v-footer
          class="text-center d-flex flex-column font-weight-medium"
          :color="theme === 'dark' ? 'grey-darken-5' : 'grey-lighten-1'"
          border
          app
          elevation="24"
          >2024 - Copyright</v-footer
        > -->
      </v-layout>
    </v-card>
  </v-responsive>
</template>
