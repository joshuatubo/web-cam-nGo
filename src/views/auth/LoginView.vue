<!-- <script setup>
import AppLayout from '@/components/layout/AppLayout.vue'
import { RouterLink } from 'vue-router'
</script> -->

<!-- <<template>
  <AppLayout>
    <template #content>
      <v-row class="">
        <v-col cols="12" md="6" class="mx-auto pt-10">
          <v-card class="mx-auto" elevation="24">
            <v-card-text class="text-center">
              <v-img src="/img/logo.png" height="100px"></v-img>
              <h1 class="font-weight-black text-center">Welcome to Cam'n Go</h1>
              <p>Login Form</p>
            </v-card-text>
            <v-card-text class="bg-surface-light pt-4">
              <v-form fast-fail @submit.prevent>
                <v-text-field label="Email" variant="outlined"></v-text-field>

                <v-text-field label="Password" type="password" variant="outlined"></v-text-field>

                <v-btn class="mt-2" type="submit" block>Submit</v-btn>
              </v-form>
              <v-divider class="my-5"></v-divider>
              <h5 class="text-center">
                Don't have account?
                <RouterLink to="/register" class="text-red-lighten-1

">Click here to Register</RouterLink>
              </h5>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </AppLayout>
</template> -->
<script setup>
import { ref } from 'vue'

const theme = ref('light')

function onClick() {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
}
</script>

<script>
export default {
  data() {
    return {
      drawer: false,
      showLoginDialog: false,
      showSignupDialog: false,
    }
  },
  methods: {
    switchToSignup() {
      this.showLoginDialog = false
      this.showSignupDialog = true
    },
    switchToLogin() {
      this.showSignupDialog = false
      this.showLoginDialog = true
    },
  },
}
</script>

<template>
  <v-app :theme="theme">
    <v-container>
      <!-- Navbar -->
      <v-app-bar app>
        <v-btn icon @click="drawer = !drawer">
          <v-icon>mdi-menu</v-icon>
        </v-btn>
        <v-img max-height="40" max-width="40" src="img/logo.png" class="mr-2"></v-img>
        <v-toolbar-title>Cam'n GO</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn
          :prepend-icon="theme === 'light' ? 'mdi-weather-sunny' : 'mdi-weather-night'"
          slim
          @click="onClick"
        ></v-btn>
        <v-btn text @click="showLoginDialog = true">LOG IN</v-btn>
      </v-app-bar>

      <!-- Navigation Drawer -->
      <v-navigation-drawer v-model="drawer" app>
        <v-list>
          <v-list-item href="#">Home</v-list-item>
          <v-list-item href="#">Portfolio</v-list-item>
          <v-list-item href="#">Courses</v-list-item>
          <v-list-item href="#">About us</v-list-item>
          <v-list-item href="#">Contact us</v-list-item>
        </v-list>
      </v-navigation-drawer>

      <!-- Background Blur Overlay -->
      <v-overlay
        v-if="showLoginDialog || showSignupDialog"
        absolute
        :style="{
          backdropFilter: 'blur(100px)' /* Increased blur for strong effect */,
          backgroundColor: 'rgba(0, 0, 0, 0.5)' /* Optional dimming effect */,
        }"
      ></v-overlay>

      <!-- Login Dialog -->
      <v-dialog v-model="showLoginDialog" max-width="900">
        <v-card>
          <v-row no-gutters>
            <!-- Left Side with Background Image -->
            <v-col
              cols="12"
              md="6"
              class="d-flex align-center justify-center"
              style="
                background: url('img/login-bg.jpg') no-repeat center center;
                background-size: cover;
              "
            >
              <div class="text-white text-center px-4">
                <h2>Welcome Back</h2>
                <p>Please log in using your personal information to stay connected with us.</p>
              </div>
            </v-col>
            <!-- Right Side with Form -->
            <v-col cols="12" md="6" class="py-6 px-8">
              <v-card-title class="justify-center text-center"> <b>LOGIN</b></v-card-title>
              <v-card-text>
                <v-form>
                  <v-text-field label="Email" required variant="outlined"></v-text-field>
                  <v-text-field
                    label="Password"
                    type="password"
                    required
                    variant="outlined"
                  ></v-text-field>
                  <h5 class="mb-2">
                    <RouterLink to="/" class="text-primary text-start">Forgot password?</RouterLink>
                  </h5>
                  <v-btn block color="red-lighten-1">Log In</v-btn>
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn text @click="switchToSignup">Sign Up</v-btn>
              </v-card-actions>
            </v-col>
          </v-row>
        </v-card>
      </v-dialog>

      <!-- Signup Dialog -->
      <v-dialog v-model="showSignupDialog" max-width="900">
        <v-card>
          <v-row no-gutters>
            <!-- Left Side with Background Image -->
            <v-col
              cols="12"
              md="6"
              class="d-flex align-center justify-center"
              style="
                background: url('img/signup-bg.jpg') no-repeat center center;
                background-size: cover;
              "
            >
              <div class="text-white text-center px-4">
                <h2>Create Account</h2>
                <p>
                  To become a part of our community, please sign up using your personal information.
                </p>
              </div>
            </v-col>
            <!-- Right Side with Form -->
            <v-col cols="12" md="6" class="py-6 px-8">
              <v-card-title class="justify-center text-center"> <b>SIGN UP</b></v-card-title>
              <v-card-text>
                <v-form>
                  <v-text-field label="Enter your email" required variant="outlined"></v-text-field>
                  <v-text-field
                    label="Create password"
                    type="password"
                    required
                    variant="outlined"
                  ></v-text-field>
                  <v-checkbox label="I agree to the Terms & Conditions" required></v-checkbox>
                  <v-btn
                    block
                    color="red-lighten-1

"
                    >Sign Up</v-btn
                  >
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn text @click="switchToLogin">Login</v-btn>
              </v-card-actions>
            </v-col>
          </v-row>
        </v-card>
      </v-dialog>
    </v-container>
  </v-app>
</template>

<style>
/* Optional styles to remove scrollbar and handle overflow */
html,
body {
  overflow: hidden;
}

.v-dialog__content {
  overflow: hidden !important;
}

.text-white {
  color: white !important;
}
</style>
