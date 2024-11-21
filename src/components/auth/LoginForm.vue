<script>
export default {
  data() {
    return {
      drawer: false,
      showLoginDialog: false,
      showSignupDialog: false,
    }
  },
  methods: {
    switchToSignup() {
      this.showLoginDialog = false
      this.showSignupDialog = true
    },
    switchToLogin() {
      this.showSignupDialog = false
      this.showLoginDialog = true
    },
  },
}
</script>
<template>
  <v-form>
    <!-- Login Dialog -->
    <v-dialog v-model="showLoginDialog" max-width="900">
      <v-card>
        <v-row no-gutters>
          <!-- Left Side with Background Image -->
          <v-col
            cols="12"
            md="6"
            class="d-flex align-center justify-center"
            style="
              background: url('img/login-bg.jpg') no-repeat center center;
              background-size: cover;
            "
          >
            <div class="text-white text-center px-4">
              <h2>Welcome Back</h2>
              <p>Please log in using your personal information to stay connected with us.</p>
            </div>
          </v-col>
          <!-- Right Side with Form -->
          <v-col cols="12" md="6" class="py-6 px-8">
            <v-card-title class="justify-center text-center"> <b>LOGIN</b></v-card-title>
            <v-card-text>
              <v-form>
                <v-text-field label="Email" required variant="outlined"></v-text-field>
                <v-text-field
                  label="Password"
                  type="password"
                  required
                  variant="outlined"
                ></v-text-field>
                <h5 class="mb-2">
                  <RouterLink to="/" class="text-primary text-start">Forgot password?</RouterLink>
                </h5>
                <v-btn block color="red-lighten-1">Log In</v-btn>
              </v-form>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <h5 class="text-center">
                Don't have an account?
                <v-btn text @click="switchToSignup">Sign Up</v-btn>
              </h5>
            </v-card-actions>
          </v-col>
        </v-row>
      </v-card>
    </v-dialog>
  </v-form>
</template>
