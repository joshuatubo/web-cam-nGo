import { defineStore } from 'pinia'
import { supabase } from '@/utilities/supabaseClient'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isAdmin: false,
    loading: false
  }),

  actions: {
    async initialize() {
      this.loading = true
      try {
        // Get current session
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          this.user = user
          
          // Check if user is admin by querying a custom field or role table
          const { data: adminData, error } = await supabase
            .from('admin_users')  // Create this table in Supabase
            .select('is_admin')
            .eq('user_id', user.id)
            .single()

          if (!error && adminData) {
            this.isAdmin = adminData.is_admin
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
      } finally {
        this.loading = false
      }
    },

    async signOut() {
      const { error } = await supabase.auth.signOut()
      if (!error) {
        this.user = null
        this.isAdmin = false
      }
    }
  },

  persist: true
})
