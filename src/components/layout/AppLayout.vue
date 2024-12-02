<script setup>
import ProfileHeader from './ProfileHeader.vue'
import '@/assets/theme_style.css'

//import { useAuthUserStore } from '@/stores/authUser'
import { ref, onMounted } from 'vue'
import { useDisplay } from 'vuetify'
import { isAuthenticated } from '@/utilities/supabase'

// For drawer
//const props = defineProps(['isWithAppBarNavIcon'])

//const emit = defineEmits(['isDrawerVisible', 'theme'])

// Utilize pre-defined vue functions
//const { xs, sm, mobile } = useDisplay()

// Use Pinia Store
//const authStore = useAuthUserStore()

// Load Variables
const isLoggedIn = ref(false)
//const isMobileLogged = ref(false)
//const isDesktop = ref(false)

// Get Authentication status from supabase (needed for loading)
const getLoggedStatus = async () => {
  isLoggedIn.value = await isAuthenticated()
}

//isMobileLogged.value = mobile.value && isLoggedIn.value
//isDesktop.value = !mobile.value && (isLoggedIn.value || !isLoggedIn.value)
//}

// Load Functions during component rendering
//onMounted(() => {
//getLoggedStatus()
//})

// For theme toggle
const theme = ref(localStorage.getItem('theme') ?? 'light')
function onClick() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
  localStorage.setItem('theme', theme.value)
}

onMounted(() => {
  document.body.setAttribute('data-theme', theme.value)
})
</script>

<template>
  <v-responsive>
    <v-card :theme="theme">
      <v-layout>
        <v-navigation-drawer expand-on-hover rail class="d-flex flex-column">
          <v-list>
            <v-list-item
              prepend-avatar="https://discover.therookies.co/content/images/size/w1000/2024/08/11-2.jpg"
              subtitle="isha4jinx@gmail.com"
              title="You're a Jinx!"
            >
              <template v-slot:append>
                <v-btn size="small" icon>
                  <v-icon icon="mdi-menu-down"></v-icon>
                  <v-menu activator="parent" location="bottom end" transition="fade-transition">
                    <v-list density="compact" min-width="250" rounded="lg" slim>
                      <v-list-item prepend-icon="mdi-link" title="Copy link" link></v-list-item>

                      <v-divider class="my-2"></v-divider>

                      <v-list-item min-height="24">
                        <template v-slot:subtitle>
                          <div class="text-caption">Share with Vander + 1 more</div>
                        </template>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </v-btn>
              </template>
            </v-list-item>
          </v-list>

          <v-divider></v-divider>

          <v-list density="compact" nav>
            <v-list-item
              prepend-icon="mdi-bookmark-multiple"
              title="Saved Items"
              value="saved"
            ></v-list-item>
            <v-list-item
              prepend-icon="mdi-account-multiple"
              title="Shared with me"
              value="shared"
            ></v-list-item>
            <v-list-item prepend-icon="mdi-star" title="Starred" value="starred"></v-list-item>
          </v-list>

          <!--Logout Dialog-->
          <v-divider style="margin-top: 61vh"></v-divider>
          <v-list density="compact" nav>
            <v-list-item
              prepend-icon="mdi mdi-theme-light-dark"
              title="Change Theme"
              value="theme"
              :icon="theme === 'light' ? 'mdi-weather-sunny' : 'mdi-weather-night'"
              @click="onClick"
            ></v-list-item>
          </v-list>

          <v-dialog max-width="500" persistent>
            <template v-slot:activator="{ props: activatorProps }">
              <v-list density="comfortable" nav>
                <v-list-item
                  prepend-icon="mdi-account-cog"
                  v-bind="activatorProps"
                  color="surface-variant"
                  text="Login"
                  variant="flat"
                  title="Logout"
                ></v-list-item>
              </v-list>
            </template>

            <!--Logout function-->
            <template v-slot:default="{ isActive }">
              <v-card title="Leaving Now?">
                <v-card-text> Logging out will require you to login again. </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn text="Nevermind" @click="isActive.value = false"></v-btn>
                  <RouterLink to="/"
                    ><v-btn text="Proceed" @click="isActive.value = false"></v-btn
                  ></RouterLink>
                </v-card-actions>
              </v-card>
            </template>
          </v-dialog>
        </v-navigation-drawer>

        <v-main style="height: 100vh">
          <slot name="content"> </slot>
        </v-main>
        <v-footer
          class="text-center d-flex flex-column font-weight-medium"
          :color="theme === 'dark' ? 'grey-darken-5' : 'grey-lighten-1'"
          border
          app
          elevation="24"
          >2024 - Copyright</v-footer
        >
      </v-layout>
    </v-card>
  </v-responsive>
</template>
