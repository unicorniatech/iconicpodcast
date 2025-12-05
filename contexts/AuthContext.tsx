/**
 * Authentication Context
 * 
 * Provides authentication state and methods throughout the app.
 * Uses Supabase Auth for user management.
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured, signIn, signUp, signOut } from '../services/supabaseClient';
import { logError, createAppError } from '../services/errorService';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  register: (email: string, password: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  checkAdminStatus: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Fallback admin emails to keep CRM accessible even if admin_users is not yet populated
const ADMIN_EMAILS_FALLBACK = ['zuzzi.husarova@gmail.com', 'ceo@vistadev.mx'];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isAdmin: false,
    isAuthenticated: false
  });

  const checkAdminStatus = useCallback(async (): Promise<boolean> => {
    if (!state.user) return false;

    // Email-based fallback so key accounts always see CRM
    if (state.user.email && ADMIN_EMAILS_FALLBACK.includes(state.user.email)) {
      return true;
    }

    if (!isSupabaseConfigured()) return false;

    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('role')
        .eq('user_id', state.user.id)
        .single();

      if (error || !data) return false;
      return true;
    } catch (error) {
      logError(createAppError(error, 'SUPABASE_ERROR', { action: 'checkAdminStatus' }));
      return false;
    }
  }, [state.user]);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setState(prev => ({
        ...prev,
        session,
        user: session?.user ?? null,
        isAuthenticated: !!session?.user,
        isLoading: false
      }));

      // Ensure isAdmin is correctly set on page reload for existing sessions
      if (session?.user) {
        const isAdminFlag = await checkAdminStatus();
        setState(prev => ({ ...prev, isAdmin: isAdminFlag }));
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setState(prev => ({
          ...prev,
          session,
          user: session?.user ?? null,
          isAuthenticated: !!session?.user
        }));

        // Check admin status on sign in
        if (event === 'SIGNED_IN' && session?.user) {
          const isAdmin = await checkAdminStatus();
          setState(prev => ({ ...prev, isAdmin }));
        } else if (event === 'SIGNED_OUT') {
          setState(prev => ({ ...prev, isAdmin: false }));
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [checkAdminStatus]);

  const login = async (email: string, password: string): Promise<{ error: string | null }> => {
    try {
      if (!isSupabaseConfigured()) {
        const appError = createAppError(
          new Error('Supabase is not configured'),
          'SUPABASE_NOT_CONFIGURED',
          { action: 'login' }
        );
        logError(appError);
        return { error: appError.message };
      }
      await signIn(email, password);
      return { error: null };
    } catch (error) {
      const appError = createAppError(error, 'AUTH_ERROR', { action: 'login' });
      logError(appError);
      return { error: appError.message };
    }
  };

  const register = async (email: string, password: string): Promise<{ error: string | null }> => {
    try {
      if (!isSupabaseConfigured()) {
        const appError = createAppError(
          new Error('Supabase is not configured'),
          'SUPABASE_NOT_CONFIGURED',
          { action: 'register' }
        );
        logError(appError);
        return { error: appError.message };
      }
      await signUp(email, password);
      return { error: null };
    } catch (error) {
      const appError = createAppError(error, 'AUTH_ERROR', { action: 'register' });
      logError(appError);
      return { error: appError.message };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      if (isSupabaseConfigured()) {
        await signOut();
      }
    } catch (error) {
      logError(createAppError(error, 'AUTH_ERROR', { action: 'logout' }));
    } finally {
      // Always clear local auth state so the UI reliably logs out
      setState(prev => ({
        ...prev,
        user: null,
        session: null,
        isAuthenticated: false,
        isAdmin: false
      }));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        checkAdminStatus
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
