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
import { useRouter } from 'vue-router'

//load pre-defined functions
const router = useRouter()

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

//Register Function
const onSubmit = async () => {
  //Reset form Action Units
  formAction.value = { ...formActionDefault }
  //Turn On Processing
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
        is_admin: false, //make sure to turn off after signing up as an admin
        //or you can use role based
        //role: 'Administrator'
      },
    },
  })

  //for data
  if (error) {
    //to add error message and status code
    console.log(error)
    formAction.value.formErrorMessage = error.message
    formAction.value.formStatus = error.status
  } else if (data) {
    console.log(data)
    //Add success message
    formAction.value.formSuccessMessage = 'Successfully Registered Account'
    //Add more action
    router.replace('system/dashboard')
  }
  //Reset Form
  refVForm.value?.reset()
  //Turn Off Processing
  formAction.value.formProcess = false
}

//This is to Trigger Validators
const onFormSubmit = () => {
  refVForm.value?.validate().then(({ valid }) => {
    if (valid) onSubmit()
  })
}
const refVForm = ref(null)

const show1 = ref(false)
const show2 = ref(false)

//for eye
</script>

<template>
  <AlertNotification
    :formSuccessMessage="formAction.formSuccessMessage"
    :formErrorMessage="formAction.formErrorMessage"
  ></AlertNotification>

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
          variant="outlined"
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
          variant="outlined"
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
          variant="outlined"
        ></v-text-field>
      </v-col>

      <v-col cols="12" md="6">
        <v-text-field
          prepend-inner-icon="mdi-phone-outline"
          placeholder="e.g 09123445678"
          v-model="formData.phone"
          clearable
          :rules="[requiredValidator, integerValidator]"
          label="Phone"
          variant="outlined"
        ></v-text-field>
      </v-col>
    </v-row>

    <v-text-field
      prepend-inner-icon="mdi-lock-outline"
      dense
      v-model="formData.password"
      :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
      :rules="[requiredValidator, passwordValidator]"
      :type="show1 ? 'text' : 'password'"
      label="Password"
      @click:append="show1 = !show1"
      variant="outlined"
    ></v-text-field>

    <v-text-field
      prepend-inner-icon="mdi-lock-outline"
      dense
      v-model="formData.password_confirmation"
      :append-icon="show2 ? 'mdi-eye' : 'mdi-eye-off'"
      :rules="[
        requiredValidator,
        confirmedValidator(formData.password_confirmation, formData.password),
      ]"
      :type="show2 ? 'text' : 'password'"
      label="Password Confirmation"
      @click:append="show2 = !show2"
      variant="outlined"
    ></v-text-field>

    <v-btn
      class="my-4 bg-grey-darken-1"
      type="submit"
      append-icon="mdi-account-plus-outline"
      block
      :disabled="formAction.formProcess"
      :loading="formAction.formProcess"
      >Register</v-btn
    >
  </v-form>
</template>
