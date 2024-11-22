<template>
  <v-form fast-fail @submit.prevent>
    <v-text-field label="Firstname" variant="outlined"></v-text-field>
    <v-text-field label="Lastname" variant="outlined"></v-text-field>
    <v-text-field label="Email" variant="outlined"></v-text-field>

    <v-text-field label="Password" type="password" variant="outlined"></v-text-field>
    <v-text-field label="Password Confirmation" type="password" variant="outlined"></v-text-field>
    <v-divider class="my-5"></v-divider>

    <v-btn class="mt-2" type="submit" block color="red-darken-1">Submit</v-btn>
    <v-divider class="my-5"></v-divider>
    <h5 class="text-center">
      Already have account?
      <RouterLink class="text-red-darken-1 font-weight-black" to="/login"
        >Click here to Login</RouterLink
      >
    </h5>
  </v-form>
</template>
