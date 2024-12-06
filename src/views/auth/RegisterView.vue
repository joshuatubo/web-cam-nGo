<script setup>
//import AppLayout from '@/components/layout/AppLayout.vue'
import '@/assets/login_style.css'
import RegisterForm from '@/components/auth/RegisterForm.vue'
import '@/assets/theme_style.css'

//For pass verification
//import { ref } from 'vue'
</script>

<template>
  <v-responsive>
    <v-container-fluid>
      <v-row style="height: 100vh; margin: 0; padding: 0"
        ><v-col class="container">
          <v-card elevation="24" class="mx-auto rounded-xl bg-grey-darken-4 my-10" width="70%">
            <v-row>
              <v-col>
                <v-card
                  cols="12"
                  sm="10"
                  md="8"
                  height="100%"
                  class="bg-grey-darken-4 custom-card-container"
                  width="100%"
                >
                  <v-card-title>
                    <v-container>
                      <h2 class="font-weight-medium ml-2">Come with us!</h2>
                      <small class="ml-2">Sign up your account</small>
                    </v-container>
                  </v-card-title>

                  <v-sheet class="mx-auto bg-transparent" width="85%">
                    <RegisterForm> </RegisterForm>
                  </v-sheet>

                  <v-sheet class="mx-auto bg-transparent" width="85%">
                    <LoginForm> </LoginForm>
                    <v-divider class="my-4 border-opacity-25"></v-divider>
                    <h6 class="my-3 text-center">
                      Already have an account?
                      <RouterLink to="/" class="text-primary" style="text-decoration: none"
                        >Back to Login<v-icon icon="mdi-chevron-right"></v-icon
                      ></RouterLink>
                    </h6>
                  </v-sheet>

                  <v-footer class="footer-text font-weight-light my-2"
                    >2024 @Copyright. All rights reserved</v-footer
                  >
                </v-card>
              </v-col>

              <v-col style="margin: 0%">
                <v-card-title class="text-center logo-position">
                  <v-img
                    src="/images/logo.png"
                    alt="Logo"
                    :width="mobile ? '75%' : '45%'"
                    class="d-block mx-auto"
                    draggable="false"
                    style="user-select: none"
                  ></v-img>
                  <p id="cam_font" class="text-center">CAM'N GO</p>
                  <small><i>Unleash your wildest angles with Cam’n Go</i></small>
                </v-card-title>
              </v-col>
            </v-row>
          </v-card>
        </v-col></v-row
      >
    </v-container-fluid>
  </v-responsive>
</template>
