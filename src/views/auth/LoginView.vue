<!--Programming naming conventions-->

<script setup>
import AppLayout from '@/components/layout/AppLayout.vue'
import { useDisplay } from 'vuetify'
import '@/assets/login_style.css'
import LoginForm from '@/components/auth/LoginForm.vue'

const { mobile } = useDisplay()

import { ref } from 'vue'

const visible = ref(false)
</script>

<!--/public/images/IMG_20241124_194845_692.PNG-->
<template id="background">
  <AppLayout>
    <template #content>
      <v-container>
        <v-row>
          <v-col cols="12" md="6" class="mx-auto" style="margin-top: 3%">
            <v-card elevation="24" class="mx-auto" width="100%">
              <v-card-title class="text-center">
                <v-img
                  src="/images/logo.png"
                  alt="Logo"
                  :width="mobile ? '75%' : '45%'"
                  class="d-block mx-auto"
                ></v-img>
                <p id="cam_font" class="text-center">CAM'N GO</p>
                <small>Login</small>
              </v-card-title>

              <v-sheet class="mx-auto" width="85%">
                <LoginForm></LoginForm>
                <v-divider class="my-4"></v-divider>
                <h6 class="my-3 text-center">
                  Don't have an account?
                  <RouterLink to="/register" class="text-primary" style="text-decoration: none">
                    Sign up here
                    <v-icon icon="mdi-chevron-right"></v-icon>
                  </RouterLink>
                </h6>
              </v-sheet>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </template>
  </AppLayout>
</template>
