import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xjvfuytgejgdbvrxgsku.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqdmZ1eXRnZWpnZGJ2cnhnc2t1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxMDgzMDgsImV4cCI6MjA4MzY4NDMwOH0.tykodsEadGLrkmocY6kaFSzi9kAher69pYVoLyKaPlA'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
