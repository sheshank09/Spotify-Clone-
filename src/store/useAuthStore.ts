import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { User } from '../types';

interface AuthState {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
  resetPassword: (email: string) => Promise<void>; // Add this line
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  signUp: async (email, password, fullName) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      });

      if (error) throw new Error(error.message);

      if (data?.user) {
        // Don't set the user immediately - wait for email verification
        set({ user: null });
        return {
          success: true,
          message: 'Please check your email to verify your account before logging in.'
        };
      }
    } catch (err: any) {
      console.error('SignUp process failed:', err);
      throw new Error(err.message || 'Failed to create account');
    }
  },

  signIn: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('SignIn error:', error);
        throw new Error(error.message);
      }

      if (data?.user) {
        set({ user: data.user as User });
      }
    } catch (err: any) {
      console.error('SignIn process failed:', err);
      throw new Error(err.message || 'Failed to sign in');
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null });
  },

  setUser: (user) => set({ user, loading: false }),

  resetPassword: async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (err: any) {
      console.error('Password reset failed:', err);
      throw new Error(err.message || 'Failed to send reset password email');
    }
  },
}));

// Initialize auth state
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    console.log('Auth state changed:', event, session?.user);
  }
  useAuthStore.setState({ 
    user: session?.user as User || null,
    loading: false 
  });
});