<script setup>
import AppLayout from '@/components/layout/AppLayout.vue'
import { useDisplay } from 'vuetify'
import LoginForm from '@/components/auth/LoginForm.vue'

const { mobile } = useDisplay()
</script>

<template>
  <AppLayout>
    <template #content>
      <v-row class="">
        <v-col cols="12" md="6" class="mx-auto">
          <v-card class="mx-auto" elevation="24">
            <v-card-title class="text-center">
              <v-img class="mx-auto" src="/img/logo.png" :width="mobile ? '75%' : '25%'"></v-img>
              <h3 class="font-weight-black text-center">Welcome to Cam'n Go</h3>
              <p>Login Form</p>
            </v-card-title>

            <v-card-text class="bg-surface-light pt-4">
              <v-divider class="my-5"></v-divider>
              <LoginForm> </LoginForm>
              <v-divider class="my-5"></v-divider>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </AppLayout>
</template>
