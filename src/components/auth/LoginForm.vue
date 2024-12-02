<script setup>
import { requiredValidator, emailValidator } from '@/utilities/validators'

import { ref } from 'vue'

const visible = ref(false)
const refVForm = ref()

const onLogin = () => {
  //alert(formData.value.email)
  alert('gi ayo pa nako oi')
}

const onFormSubmit = () => {
  refVForm.value?.validate().then(({ valid }) => {
    if (valid) onLogin()
  })
}

const formDataDefault = {
  email: '',
  password: '',
}

const formData = ref({
  ...formDataDefault,
})
</script>
<template>
  <v-form ref="refVForm" @submit.prevent="onFormSubmit">
    <v-text-field
      v-model="formData.email"
      clearable
      label="User Name"
      placeholder="Enter your User Name"
      persistent-clear
      prepend-inner-icon="mdi-email-outline"
      :rules="[requiredValidator, emailValidator]"
      variant="outlined"
    ></v-text-field>

    <v-text-field
      v-model="formData.password"
      label="Password"
      :append-inner-icon="visible ? 'mdi-eye' : 'mdi-eye-off'"
      :type="visible ? 'text' : 'password'"
      placeholder="Enter your password"
      prepend-inner-icon="mdi-lock-outline"
      @click:append-inner="visible = !visible"
      :rules="[requiredValidator]"
      variant="outlined"
    ></v-text-field>

    <v-class class="d-flex justify-space-between">
      <label class="checkbox-container">
        <input class="custom-checkbox" type="checkbox" />
        <span class="checkmark"></span>
        <small>Remember Me</small>
      </label>
      <h6 class="text-right">Forgot Password?</h6>
    </v-class>

    <v-btn class="mt-2 bg-grey-darken-1" type="submit" prepend-icon="mdi-login" block>Login</v-btn>
  </v-form>
</template>
