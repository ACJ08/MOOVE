import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined
// VITE_SUPABASE_PUBLISHABLE_KEY is retained only as a temporary migration path.
const SUPABASE_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) as string | undefined

// Singleton on globalThis so Vite HMR re-evaluations reuse the same
// GoTrueClient instance. A custom storageKey isolates our auth session
// from Figma Make's own Supabase client (same project, different key).
const _g = globalThis as typeof globalThis & { __moove_supabase?: SupabaseClient }
if (!_g.__moove_supabase && SUPABASE_URL && SUPABASE_KEY) {
  _g.__moove_supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { storageKey: 'moove-auth-token' },
  })
}

export const supabase = _g.__moove_supabase

// Database type stubs — extend as tables are created in the MOOVE Project
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string
          role: 'driver' | 'admin'
          driving_goal: string | null
          age: string | null
          vehicle_type: string | null
          avatar_url: string | null
          gender: string | null
          height_cm: number | null
          weight_kg: number | null
          bmi: number | null
          emergency_contact: string | null
          onboarding_complete: boolean
          last_login_at: string | null
          joined_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'joined_at' | 'updated_at' | 'bmi'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          reminder_interval: string | null
          tired_areas: string[] | null
          reminder_style: string | null
          notifications_enabled: boolean
          warmup_pref: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_preferences']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['user_preferences']['Insert']>
      }
      driving_sessions: {
        Row: {
          id: string
          user_id: string
          started_at: string
          ended_at: string | null
          duration_seconds: number
          exercises_completed: number
          exercises_skipped: number
          breaks_taken: number
          avg_sedentary_risk: string | null
          note: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['driving_sessions']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['driving_sessions']['Insert']>
      }
      exercise_history: {
        Row: {
          id: string
          user_id: string
          session_id: string | null
          exercise_id: number
          exercise_name: string
          body_area: string | null
          sets_completed: number
          duration_per_set: number
          rest_between: number
          context: string | null
          completed_at: string
          status: 'completed' | 'skipped'
        }
        Insert: Omit<Database['public']['Tables']['exercise_history']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['exercise_history']['Insert']>
      }
      health_metrics: {
        Row: {
          id: string
          user_id: string
          recorded_at: string
          pain_level: number | null
          energy_level: number | null
          stress_level: number | null
          posture_score: number | null
          wellness_score: number | null
          calories_burned: number | null
        }
        Insert: Omit<Database['public']['Tables']['health_metrics']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['health_metrics']['Insert']>
      }
      feedback_responses: {
        Row: {
          id: string
          user_id: string | null
          setup: Json
          usability: Json
          engagement: Json
          performance: Json
          user_perception: Json
          health_perception: Json
          adoption: Json
          open_feedback: Json
          submitted_at: string
        }
        Insert: Omit<Database['public']['Tables']['feedback_responses']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['feedback_responses']['Insert']>
      }
      // feedback_submissions — UNLEASH TRL4 structured driver feedback
      // SQL to create this table in Supabase:
      //   create table feedback_submissions (
      //     id uuid primary key default gen_random_uuid(),
      //     user_id uuid references auth.users(id),
      //     testing_session_id text,
      //     app_version text,
      //     testing_method text,
      //     overall_rating smallint,
      //     first_impression smallint,
      //     ease_of_navigation smallint,
      //     ease_of_learning smallint,
      //     accomplished_task text,
      //     most_useful_feature text,
      //     needs_improvement text,
      //     confusing_part text,
      //     bug_report text,
      //     would_use_again text,
      //     would_recommend text,
      //     additional_comments text,
      //     feature_request text,
      //     device text,
      //     browser text,
      //     submitted_at timestamptz default now()
      //   );
      //   alter table feedback_submissions enable row level security;
      //   create policy "Users insert own" on feedback_submissions for insert with check (auth.uid() = user_id);
      //   create policy "Admins read all" on feedback_submissions for select using (true);
      feedback_submissions: {
        Row: {
          id: string
          user_id: string | null
          testing_session_id: string | null
          app_version: string | null
          testing_method: string | null
          overall_rating: number | null
          first_impression: number | null
          ease_of_navigation: number | null
          ease_of_learning: number | null
          accomplished_task: string | null
          most_useful_feature: string | null
          needs_improvement: string | null
          confusing_part: string | null
          bug_report: string | null
          would_use_again: string | null
          would_recommend: string | null
          additional_comments: string | null
          feature_request: string | null
          device: string | null
          browser: string | null
          submitted_at: string
        }
        Insert: Omit<Database['public']['Tables']['feedback_submissions']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['feedback_submissions']['Insert']>
      }
    }
  }
}
