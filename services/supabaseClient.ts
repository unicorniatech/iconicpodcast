/**
 * Supabase Client Configuration
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create a Supabase project at https://supabase.com
 * 2. Set the following environment variables:
 *    - VITE_SUPABASE_URL: Your Supabase project URL
 *    - VITE_SUPABASE_ANON_KEY: Your Supabase anon/public key
 * 3. Run the SQL migrations in supabase/migrations/ to create tables
 */

import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';
import type { Database } from '../types/database';
import { createAppError } from './errorService';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase is properly configured
export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseAnonKey);
};

if (!isSupabaseConfigured()) {
  console.warn(
    'Supabase credentials not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.'
  );
}

// Create Supabase client only when configured
export const supabase: SupabaseClient<Database> = isSupabaseConfigured()
  ? createClient<Database>(supabaseUrl as string, supabaseAnonKey as string, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  // In development without configuration, this will be guarded by isSupabaseConfigured checks
  : ({} as SupabaseClient<Database>);

// Internal helper to enforce configuration for auth operations
const ensureSupabaseConfigured = (action: string) => {
  if (!isSupabaseConfigured()) {
    throw createAppError(
      new Error('Supabase is not configured'),
      'SUPABASE_NOT_CONFIGURED',
      { action }
    );
  }
};

// Auth helpers
export const signUp = async (email: string, password: string) => {
  ensureSupabaseConfigured('signUp');
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
};

export const signIn = async (email: string, password: string) => {
  ensureSupabaseConfigured('signIn');
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  ensureSupabaseConfigured('signOut');
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async (): Promise<User | null> => {
  ensureSupabaseConfigured('getCurrentUser');
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const getCurrentSession = async (): Promise<Session | null> => {
  ensureSupabaseConfigured('getCurrentSession');
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

// Subscribe to auth state changes
export const onAuthStateChange = (callback: (event: string, session: Session | null) => void) => {
  ensureSupabaseConfigured('onAuthStateChange');
  return supabase.auth.onAuthStateChange(callback);
};

export default supabase;
