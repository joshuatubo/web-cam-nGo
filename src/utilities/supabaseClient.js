// utilities/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

// Replace these values with your Supabase project details
const SUPABASE_URL = 'https://lddxwfeoirdrsgfsrwlx.supabase.co' // Your Supabase URL
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkZHh3ZmVvaXJkcnNnZnNyd2x4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMwMTY4OTQsImV4cCI6MjA0ODU5Mjg5NH0.EFHCHJuaDWxrEs1KT5KHthPW27wJ-5hUCW_XY5kAktw' // Your Supabase anonymous public API key

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
