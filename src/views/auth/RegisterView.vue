<script setup>
import { ref } from 'vue'

const theme = ref('light')

function onClick() {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
}
</script>

<template>
  <v-responsive class="border rounded">
    <v-app :theme="theme">
      <v-app-bar class="px-3" color="grey-lighten-3">
        <v-spacer></v-spacer>

        <v-btn
          :prepend-icon="theme === 'light' ? 'mdi-weather-sunny' : 'mdi-weather-night'"
          text="Toggle Theme"
          slim
          @click="onClick"
        ></v-btn>
      </v-app-bar>

      <v-main>
        <v-container>
          <v-row class="">
            <v-col cols="12" md="6" class="mx-auto">
              <v-card
                class="mx-auto"
                prepend-icon="mdi-account-plus"
                subtitle="The #1 Vue UI Library"
              >
                <template v-slot:title>
                  <span class="font-weight-black">Welcome to Cam'n Go</span>
                </template>

                <v-card-text class="bg-surface-light pt-4">
                  <v-form fast-fail @submit.prevent>
                    <v-text-field label="Firstname" variant="outlined"></v-text-field>
                    <v-text-field label="Lastname" variant="outlined"></v-text-field>
                    <v-text-field label="Email" variant="outlined"></v-text-field>

                    <v-text-field
                      label="Password"
                      type="password"
                      variant="outlined"
                    ></v-text-field>
                    <v-text-field
                      label="Password Confirmation"
                      type="password"
                      variant="outlined"
                    ></v-text-field>
                    <v-divider class="my-5"></v-divider>

                    <v-btn class="mt-2" type="submit" block>Submit</v-btn>
                    <v-divider class="my-5"></v-divider>
                    <h5 class="text-center">
                      Already have account?
                      <RouterLink to="/login">Click here to Login</RouterLink>
                    </h5>
                  </v-form>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-main>

      <v-footer class="d-flex flex-column" app>
        <div class="bg-blue-grey d-flex w-100 align-center px-4">
          <strong>Get connected with us on social networks!</strong>

          <v-spacer></v-spacer>

          <v-btn
            v-for="icon in icons"
            :key="icon"
            :icon="icon"
            class="mx-4"
            size="small"
            variant="plain"
          ></v-btn>
        </div>

        <div class="px-4 py-2 bg-black text-center w-100">
          {{ new Date().getFullYear() }} — <strong> Cam'n Go</strong>
        </div>
      </v-footer>
    </v-app>
  </v-responsive>
</template>
