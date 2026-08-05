// Compatibility exports for Figma Make integrations. Application code uses
// src/lib/supabase.ts, which is the single client construction point.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined

export const projectId = supabaseUrl ? new URL(supabaseUrl).hostname.split('.')[0] : ''
export const publicAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) as string | undefined
