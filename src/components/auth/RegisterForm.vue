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
    <!-- Signup Dialog -->
    <v-dialog v-model="showSignupDialog" max-width="900">
      <v-card>
        <v-row no-gutters>
          <!-- Left Side with Background Image -->
          <v-col
            cols="12"
            md="6"
            class="d-flex align-center justify-center"
            style="
              background: url('img/signup-bg.jpg') no-repeat center center;
              background-size: cover;
            "
          >
            <div class="text-white text-center px-4">
              <h2>Create Account</h2>
              <p>
                To become a part of our community, please sign up using your personal information.
              </p>
            </div>
          </v-col>
          <!-- Right Side with Form -->
          <v-col cols="12" md="6" class="py-6 px-8">
            <v-card-title class="justify-center text-center"> <b>SIGN UP</b></v-card-title>
            <v-card-text>
              <v-form>
                <v-text-field label="Enter your email" required variant="outlined"></v-text-field>
                <v-text-field
                  label="Create password"
                  type="password"
                  required
                  variant="outlined"
                ></v-text-field>
                <v-checkbox label="I agree to the Terms & Conditions" required></v-checkbox>
                <v-btn
                  block
                  color="red-lighten-1

"
                  >Sign Up</v-btn
                >
              </v-form>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <h5 class="text-center">
                Already have an account?
                <v-btn text @click="switchToLogin">Login</v-btn>
              </h5>
            </v-card-actions>
          </v-col>
        </v-row>
      </v-card>
    </v-dialog>
  </v-form>
</template>
