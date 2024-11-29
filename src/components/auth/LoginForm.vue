<script>
import { ref } from 'vue'

const visible = ref(false)
</script>
<template>
  <v-form fast-fail @submit.prevent>
    <v-text-field
      clearable
      label="User Name"
      placeholder="Enter your User Name"
      persistent-clear
      prepend-inner-icon="mdi-email-outline"
    ></v-text-field>

    <v-text-field
      label="Password"
      :append-inner-icon="visible ? 'mdi-eye' : 'mdi-eye-off'"
      :type="visible ? 'text' : 'password'"
      placeholder="Enter your password"
      prepend-inner-icon="mdi-lock-outline"
      @click:append-inner="visible = !visible"
    ></v-text-field>

    <v-class class="d-flex justify-space-between">
      <label class="checkbox-container">
        <input class="custom-checkbox" type="checkbox" />
        <span class="checkmark"></span>
        <small>Remember Me</small>
      </label>
      <h6 class="text-right">Forgot Password?</h6>
    </v-class>

    <v-btn class="mt-2" type="Login" prepend-icon="mdi-login" block>Login</v-btn>
  </v-form>
</template>
