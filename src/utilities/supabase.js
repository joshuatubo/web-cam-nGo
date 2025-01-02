import { createClient } from '@supabase/supabase-js'

// Create a single supabase client for interacting with your database
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY,
)

//Form Action Utils
export const formActionDefault = {
  formProcess: false,
  formStatus: 200,
  formErrorMessage: '',
  formSuccessMessage: '',
}

//Check if the session exists and is valid; Return false if there's an error
export const isAuthenticated = async () => {
  const { data, error } = await supabase.auth.getSession()

  if (error) {
    console.error('Error getting session:', error.message)
    return false
  }

  return !!data.session
}

//Retrieve User Information
export const getUserInformation = async () => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return null

    // Get admin status from admin_users table
    const { data: adminData } = await supabase
      .from('admin_users')
      .select('is_admin')
      .eq('user_id', user.id)
      .single()

    return {
      ...user.user_metadata,
      id: user.id,
      isAdmin: adminData?.is_admin || false,
    }
  } catch (error) {
    console.error('Error getting user information:', error)
    return null
  }
}

// Check if user is admin
export const isAdmin = async () => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return false

    const { data: adminData } = await supabase
      .from('admin_users')
      .select('is_admin')
      .eq('user_id', user.id)
      .single()

    return adminData?.is_admin || false
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}
