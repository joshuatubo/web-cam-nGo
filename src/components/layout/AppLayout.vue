<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

// Theme setup
const theme = ref(localStorage.getItem('theme') || 'dark')
const route = useRoute()

function toggleTheme() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
  localStorage.setItem('theme', theme.value)
}

onMounted(() => {
  document.body.setAttribute('data-theme', theme.value)
})

// Check if we are on the login page to prevent layout change
const isLoginPage = route.path === '/auth/login'
</script>

<template>
  <v-responsive>
    <v-app :theme="theme">
      <!-- Navigation Bar -->
      <v-app-bar
        app
        :color="theme === 'dark' ? 'grey-darken-5' : 'grey-lighten-1'"
        flat
        elevate-on-scroll
      >
        <v-toolbar-title class="ml-2">Cam'N Go</v-toolbar-title>

        <!-- Spacer to push right-side icons -->
        <v-spacer></v-spacer>

        <!-- Search Bar -->
        <v-card-text>
          <v-text-field
            :loading="loading"
            append-inner-icon="mdi-magnify"
            density="compact"
            label="Search Camera"
            variant="solo"
            hide-details
            single-line
            @click:append-inner="onClick"
          ></v-text-field>
        </v-card-text>

        <!-- Profile Picture with Dropdown -->
        <v-menu offset-y>
          <template #activator="{ props }">
            <v-avatar v-bind="props" size="32">
              <v-img
                src="/images/logo.png"
                alt="Logo"
                :width="mobile ? '75%' : '45%'"
                class="d-block mx-auto"
              ></v-img>
            </v-avatar>
          </template>
          <v-list>
            <v-list-item>
              <v-list-item-title>Profile</v-list-item-title>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>Settings</v-list-item-title>
            </v-list-item>
            <v-divider></v-divider>
            <v-list-item>
              <v-list-item-title>Logout</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>

        <!-- Theme Toggle -->
        <v-btn
          :icon="theme === 'light' ? 'mdi-weather-sunny' : 'mdi-weather-night'"
          @click="toggleTheme"
        ></v-btn>
      </v-app-bar>

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
          <!-- Home Link -->
          <v-list-item
            prepend-icon="mdi-home"
            title="Home"
            value="shared"
            @click="$router.push('/dashboard')"
          >
          </v-list-item>
          <!-- Other items -->
          <v-list-item
            prepend-icon="mdi-camera"
            title="Browse Cameras"
            value="shared"
            @click="$router.push('/camerasection')"
          >
          </v-list-item>
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

      <!-- Main Content -->
      <v-main>
        <slot name="content"></slot>
      </v-main>

      <!-- Footer -->
      <v-footer
        class="text-center"
        :color="theme === 'dark' ? 'grey-darken-5' : 'grey-lighten-1'"
        app
      >
        2024 - Copyright
      </v-footer>
    </v-app>
  </v-responsive>
</template>
