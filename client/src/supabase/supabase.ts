import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Указываем TypeScript, что эти переменные точно будут строками
const SUPABASE_URL = 'https://bqezaqgwkajiuqvwsuye.supabase.co'  // Organization slug + URL
const SUPABASE_ANON_KEY: string = 'sb_publishable_HOYS1Ez-mJq-_0sgqvQRHQ_BnsNu5By' 

// Переменная supabase получит строгий тип SupabaseClient автоматически
export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
