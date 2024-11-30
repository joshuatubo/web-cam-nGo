<script setup>
import { ref } from 'vue'

import {
  requiredValidator,
  emailValidator,
  passwordValidator,
  confirmedValidator,
  integerValidator,
} from '@/utilities/validators'

const formDataDefault = {
  firstname: '',
  lastname: '',
  email: '',
  phone: '',
  password: '',
  password_confirmation: '',
}

const formData = ref({
  ...formDataDefault,
})
const refVForm = ref()

const onSubmit = () => {
  alert(formData.value.email)
}

const onFormSubmit = () => {
  refVForm.value?.validate().then(({ valid }) => {
    if (valid) onSubmit()
  })
}

const isPasswordVisible = ref(false)
const isPasswordConfirmVisible = ref(false)

//for eye

const visible = ref(false)
</script>

<template>
  <v-form ref="refVForm" @submit.prevent="onFormSubmit">
    <v-row dense>
      <v-col cols="12" md="6">
        <v-text-field
          clearable
          v-model="formData.firstname"
          label="First Name"
          placeholder="Your First Name"
          persistent-clear
          :rules="[requiredValidator]"
        ></v-text-field>
      </v-col>

      <v-col cols="12" md="6">
        <v-text-field
          v-model="formData.lastname"
          clearable
          label="Last Name"
          placeholder="Your Last Name"
          persistent-clear
          :rules="[requiredValidator]"
        ></v-text-field>
      </v-col>
    </v-row>

    <v-row dense>
      <v-col cols="12" md="6">
        <v-text-field
          prepend-inner-icon="mdi-email-outline"
          v-model="formData.email"
          clearable
          :rules="[requiredValidator, emailValidator]"
          label="Email"
        ></v-text-field>
      </v-col>

      <v-col cols="12" md="6">
        <v-text-field
          prepend-inner-icon="mdi-phone-outline"
          placeholder="+63"
          v-model="formData.phone"
          clearable
          :rules="[requiredValidator, integerValidator]"
          label="Phone Number"
        ></v-text-field>
      </v-col>
    </v-row>

    <v-text-field
      dense
      v-model="formData.password"
      label="Password"
      prepend-inner-icon="mdi-lock-outline"
      :type="isPasswordVisible ? 'text' : 'password'"
      :append-inner-icon="isPasswordVisible ? 'mdi-eye-off' : 'mdi-eye'"
      @click:append-inner="isPasswordVisible = !isPasswordVisible"
      :rules="[requiredValidator, passwordValidator]"
    ></v-text-field>

    <v-text-field
      dense
      v-model="formData.password_confirmation"
      label="Password Confirmation"
      prepend-inner-icon="mdi-lock-outline"
      :type="isPasswordConfirmVisible ? 'text' : 'password'"
      :append-inner-icon="isPasswordConfirmVisible ? 'mdi-eye-off' : 'mdi-eye'"
      @click:append-inner="isPasswordConfirmVisible = !isPasswordConfirmVisible"
      :rules="[
        requiredValidator,
        confirmedValidator(formData.password_confirmation, formData.password),
      ]"
    ></v-text-field>

    <v-btn class="my-4" type="submit" append-icon="mdi-account-plus-outline" block>Register</v-btn>

    <h6 class="my-3 text-center">
      Already have an account?
      <RouterLink to="/" class="text-primary" style="text-decoration: none"
        >Back to Login<v-icon icon="mdi-chevron-right"></v-icon
      ></RouterLink>
    </h6>
  </v-form>
</template>
