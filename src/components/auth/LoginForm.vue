<script setup>
import AlertNotification from '@/components/common/AlertNotification.vue'

import { formActionDefault, supabase } from '@/utilities/supabase'
import { requiredValidator, emailValidator } from '@/utilities/validators'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

// Utilize pre-defined vue functions
const router = useRouter()

// Load Variables
const formDataDefault = {
  email: '',
  password: '',
}
const formData = ref({
  ...formDataDefault,
})
const formAction = ref({
  ...formActionDefault,
})
const visible = ref(false)
const refVForm = ref()

const onSubmit = async () => {
  // Reset Form Action utils; Turn on processing at the same time
  formAction.value = { ...formActionDefault, formProcess: true }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: formData.value.email,
    password: formData.value.password,
  })

  if (error) {
    // Add Error Message and Status Code
    formAction.value.formErrorMessage = error.message
    formAction.value.formStatus = error.status
  } else if (data) {
    // Add Success Message
    formAction.value.formSuccessMessage = 'Successfully Logged Account.'
    // Redirect Acct to Dashboard
    router.replace('system/dashboard')
  }

  // Reset Form
  refVForm.value?.reset()
  // Turn off processing
  formAction.value.formProcess = false
}

const onFormSubmit = () => {
  refVForm.value?.validate().then(({ valid }) => {
    if (valid) onSubmit()
  })
}
</script>
<template>
  <v-divider class="my-3 border-opacity-25"></v-divider>
  <AlertNotification
    :formSuccessMessage="formAction.formSuccessMessage"
    :formErrorMessage="formAction.formErrorMessage"
  ></AlertNotification>
  <v-form class="mt-5" ref="refVForm" @submit.prevent="onFormSubmit">
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
