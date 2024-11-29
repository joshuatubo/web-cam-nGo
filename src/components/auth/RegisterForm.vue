<script setup>
import { ref } from 'vue'

const rules = {
  required: (value) => !!value || 'Required.',
  min: (v) => v.length >= 8 || 'Min 8 characters',
  emailMatch: () => `The email and password you entered don't match`,
}

const show1 = ref(false)
const show2 = ref(true)
const password = ref('Password')

//for eye

const visible = ref(false)
</script>

<template>
  <v-form fast-fail @submit.prevent>
    <v-row>
      <v-col cols="12" md="6">
        <v-text-field
          clearable
          label="First Name"
          placeholder="Your First Name"
          persistent-clear
        ></v-text-field>
      </v-col>

      <v-col cols="12" md="6">
        <v-text-field
          clearable
          label="Last Name"
          placeholder="Your Last Name"
          persistent-clear
        ></v-text-field>
      </v-col>
    </v-row>

    <v-text-field
      clearable
      v-model="email"
      :rules="emailRules"
      label="E-mail"
      required
    ></v-text-field>

    <v-text-field
      clearable
      label="User Name"
      placeholder="Enter your User Name"
      persistent-clear
      :rules="[rules.required, rules.min]"
      hint="At least 8 characters"
      name="input-10-1"
      counter
      @click:append="show1 = !show1"
    ></v-text-field>

    <v-text-field
      label="Password"
      :append-inner-icon="visible ? 'mdi-eye' : 'mdi-eye-off'"
      :type="visible ? 'text' : 'password'"
      placeholder="Enter your password"
      @click:append-inner="visible = !visible"
      :rules="[rules.required, rules.min]"
      hint="At least 8 characters"
      name="input-10-1"
      counter
      @click:append="show1 = !show1"
    ></v-text-field>

    <v-btn class="my-4" type="Register" append-icon="mdi-account-plus-outline" block
      >Register</v-btn
    >

    <h6 class="my-3 text-center">
      Already have an account?
      <RouterLink to="/" class="text-primary" style="text-decoration: none"
        >Back to Login<v-icon icon="mdi-chevron-right"></v-icon
      ></RouterLink>
    </h6>
  </v-form>
</template>

<script>
export default {
  data: () => ({
    email: '',
    emailRules: [
      (value) => {
        if (value) return true

        return 'E-mail is required.'
      },
      (value) => {
        if (/.+@.+\..+/.test(value)) return true

        return 'E-mail must be valid.'
      },
    ],
  }),
}
</script>
