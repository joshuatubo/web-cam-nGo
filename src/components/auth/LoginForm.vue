<template>
  <v-form fast-fail @submit.prevent>
    <v-text-field label="User name" variant="outlined"></v-text-field>
    <v-text-field label="Email" variant="outlined"></v-text-field>

    <v-text-field label="Password" type="password" variant="outlined"></v-text-field>

    <v-btn class="mt-2" type="submit" block color="red-darken-1">Submit</v-btn>
    <v-divider class="my-5"></v-divider>
    <h5 class="text-center">
      Don't have account?
      <RouterLink to="/register">Signup</RouterLink>
    </h5>
  </v-form>
</template>
