<script setup>
import { ref } from 'vue'

import {
  requiredValidator,
  emailValidator,
  passwordValidator,
  confirmedValidator,
  integerValidator,
} from '@/utilities/validators'

import AlertNotification from '@/components/common/AlertNotification.vue'
import { supabase, formActionDefault } from '@/utilities/supabase.js'

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

const formAction = ref({
  ...formActionDefault,
})

const onSubmit = async () => {
  formAction.value = { ...formActionDefault }
  formAction.value.formProcess = true

  const { data, error } = await supabase.auth.signUp({
    email: formData.value.email,
    password: formData.value.password,
    options: {
      data: {
        firstname: formData.value.firstname,
        lastname: formData.value.lastname,
        email: formData.value.email,
        phone: formData.value.phone,
        password: formData.value.password,
        password_confirmation: formData.value.password_confirmation,
      },
    },
  })

  /*for data*/
  if (error) {
    console.log(error)
    formAction.value.formErrorMessage = error.message
    formAction.value.formStatus = error.status
  } else if (data) {
    console.log(data)
    formAction.value.formSuccessMessage = 'Successfully Registered Account'
    //Add more action
    refVForm.value?.reset()
  }

  formAction.value.formProcess = false
}

const onFormSubmit = () => {
  refVForm.value?.validate().then(({ valid }) => {
    if (valid) onSubmit()
  })
}

const isPasswordVisible = ref(false)
const isPasswordConfirmVisible = ref(false)
const refVForm = ref()

//for eye

const visible = ref(false)
</script>

<template>
  <v-divider class="my-4"></v-divider>
  <AlertNotification
    :formSuccessMessage="formAction.formSuccessMessage"
    :formErrorMessage="formAction.formErrorMessage"
  ></AlertNotification>

  <v-form class="mt-5" ref="refVForm" @submit.prevent="onFormSubmit">
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
          placeholder="e.g 09123445678"
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

    <v-btn
      class="my-4"
      type="submit"
      append-icon="mdi-account-plus-outline"
      block
      :disabled="formAction.formProcess"
      :loading="formAction.formProcess"
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
