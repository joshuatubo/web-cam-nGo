<script setup>
import { supabase, formActionDefault } from '@/utilities/supabase'
import { getAvatarText } from '@/utilities/helpers'
import { useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'
//utilize pre-defined vue functions
const router = useRouter()

//load variables
const userData = ref({
  initials: '',
  email: '',
  fullname: '',
})
const formAction = ref({
  ...formActionDefault,
})

//Logout functionality
const onLogout = async () => {
  formAction.value = { ...formActionDefault }
  formAction.value.formProcess = true

  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('Error signing out:', error.message)
    return
  }

  //Rediret to login page
  formAction.value.formProess = false
  router.replace('/')
}

//getting the user information funtionality
const getUser = async () => {
  const {
    data: {
      user: { user_metadata: metadata },
    },
  } = await supabase.auth.getUser()

  userData.value.email = metadata.email
  userData.value.fullname = metadata.firstname + ' ' + metadata.lastname
  userData.value.initials = getAvatarText(userData.value.fullname)
}

// Load funtions during component rendering
onMounted(() => {
  getUser()
})
</script>

<template>
  <v-menu min-width="200px" rounded>
    <template v-slot:activator="{ props }">
      <v-btn icon v-bind="props">
        <v-avatar color="brown" size="large">
          <span class="text-h5">{{ userData.initials }}</span>
        </v-avatar>
      </v-btn>
      <v-class
        ><v-list density="compact" nav>
          <span class="text-h7">{{ userData.fullname }}</span></v-list
        ></v-class
      >
    </template>
    <v-card>
      <v-card-text>
        <v-list>
          <v-list-item :subtitle="userData.email" :title="userData.fullname">
            <template #prepend>
              <v-avatar color="brown" size="large">
                <span class="text-h5">{{ userData.initials }}</span>
              </v-avatar>
            </template>
          </v-list-item>
        </v-list>
        <v-divider class="my-3"></v-divider>
        <v-btn variant="plain" prepend-icon="mdi-account"> Account Settings </v-btn>
        <v-divider class="my-3"></v-divider>
        <v-btn
          prepend-icon="mdi-logout"
          variant="plain"
          @click="onLogout"
          :loading="formAction.formProcess"
          :disabled="formAction.formProcess"
        >
          Logout
        </v-btn>
      </v-card-text>
    </v-card>
  </v-menu>
</template>
