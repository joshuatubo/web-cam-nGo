<script setup>
import AppLayout from '@/components/layout/AppLayout.vue'
import '@/assets/login_style.css'
import RegisterForm from '@/components/auth/RegisterForm.vue'
//For pass verification
import { ref } from 'vue'
</script>

<template>
  <AppLayout>
    <template #content>
      <v-row>
        <v-col cols="12" md="6" class="mx-auto">
          <v-card class="mx-auto" width="100%" elevation="24" style="margin-top: 3%">
            <v-card-title class="text-center">
              <v-img
                src="/images/logo.png"
                alt="Logo"
                :width="mobile ? '75%' : '45%'"
                class="d-block mx-auto"
              ></v-img>
              <p id="cam_font" class="text-center">CAM'N GO</p>
              <small>Register Form</small>
            </v-card-title>

            <v-sheet class="mx-auto" width="85%">
              <RegisterForm> </RegisterForm>
            </v-sheet>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </AppLayout>
</template>
