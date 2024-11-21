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
import LoginForm from '@/components/auth/LoginForm.vue'
import Registerform from '@/components/auth/registerform.vue'
import AppLayout from '@/components/layout/AppLayout.vue'
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
  <Applayout>
    <template #content>
      <v-app :theme="theme">
        <v-container>
          <!-- Background Blur Overlay -->
          <v-overlay
            v-if="showLoginDialog || showSignupDialog"
            absolute
            :style="{
              backdropFilter: 'blur(100px)' /* Increased blur for strong effect */,
              backgroundColor: 'rgba(0, 0, 0, 0.5)' /* Optional dimming effect */,
            }"
          ></v-overlay>

          <Registerform> </Registerform>

          <LoginForm> </LoginForm>
        </v-container>
      </v-app>
    </template>
  </Applayout>
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
