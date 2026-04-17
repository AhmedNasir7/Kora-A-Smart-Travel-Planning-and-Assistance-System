'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { apiService } from '@/lib/api';

function isEmailRateLimitError(message: string): boolean {
  return /email rate limit|rate limit/i.test(message);
}

function isFetchFailure(message: string): boolean {
  return /failed to fetch|fetch failed|networkerror/i.test(message);
}

type AuthActionResult = {
  ok: boolean;
  error?: string;
};

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { setUser, setError: setAuthError, clearAuth } = useAuthStore();
  const supabase = createClient();

  const navigateToDashboard = async () => {
    // Ensure the latest auth state is available before route middleware checks.
    await supabase.auth.getSession();
    router.replace('/dashboard');
    router.refresh();
  };

  const signUp = async (
    email: string,
    password: string,
    username: string,
  ): Promise<AuthActionResult> => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: username,
            username,
          },
        },
      });

      if (signUpError) {
        if (!isEmailRateLimitError(signUpError.message)) {
          throw signUpError;
        }

        // If the account already exists from a recent attempt, this recovers immediately.
        const { data: existingSession, error: existingSignInError } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          });

        if (!existingSignInError && existingSession.user) {
          setUser({
            id: existingSession.user.id,
            email: existingSession.user.email ?? email,
            fullName:
              (existingSession.user.user_metadata?.full_name as string) ||
              username,
            username:
              (existingSession.user.user_metadata?.username as string) ||
              username,
            createdAt: existingSession.user.created_at,
            updatedAt:
              existingSession.user.updated_at ?? existingSession.user.created_at,
          });

          await navigateToDashboard();
          return { ok: true };
        }

        // Fallback for providers that throttle confirmation emails.
        await apiService.signup(email, password, username);

        const { data: signInData, error: signInError } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          });

        if (signInError) {
          throw new Error(
            'Account created, but automatic sign in failed. Please sign in manually.',
          );
        }

        if (signInData.user) {
          setUser({
            id: signInData.user.id,
            email: signInData.user.email ?? email,
            fullName:
              (signInData.user.user_metadata?.full_name as string) || username,
            username:
              (signInData.user.user_metadata?.username as string) || username,
            createdAt: signInData.user.created_at,
            updatedAt: signInData.user.updated_at ?? signInData.user.created_at,
          });
        }

        await navigateToDashboard();
        return { ok: true };
      }

      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email ?? email,
          fullName: (data.user.user_metadata?.full_name as string) || username,
          username: (data.user.user_metadata?.username as string) || username,
          createdAt: data.user.created_at,
          updatedAt: data.user.updated_at ?? data.user.created_at,
        });
      }

      await navigateToDashboard();
      return { ok: true };
    } catch (err) {
      const rawMessage = err instanceof Error ? err.message : 'Sign up failed';
      const message = isFetchFailure(rawMessage)
        ? 'Could not reach the backend service. Start the backend server and try again, or use Sign In if the account was already created.'
        : isEmailRateLimitError(rawMessage)
          ? 'Too many signup attempts in a short time. Please wait a few minutes and try again, or sign in if you already created an account.'
          : rawMessage;
      setError(message);
      setAuthError({ code: 'SIGNUP_ERROR', message, statusCode: 400 });
      return { ok: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (
    email: string,
    password: string,
  ): Promise<AuthActionResult> => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw signInError;
      }

      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email ?? email,
          fullName: (data.user.user_metadata?.full_name as string) || '',
          createdAt: data.user.created_at,
          updatedAt: data.user.updated_at ?? data.user.created_at,
        });
      }

      await navigateToDashboard();
      return { ok: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign in failed';
      setError(message);
      setAuthError({ code: 'SIGNIN_ERROR', message, statusCode: 401 });
      return { ok: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async (): Promise<AuthActionResult> => {
    setIsLoading(true);
    setError(null);
    try {
      const redirectTo =
        typeof window !== 'undefined'
          ? `${window.location.origin}/auth/callback`
          : undefined;

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
        },
      });

      if (oauthError) {
        throw oauthError;
      }

      return { ok: true };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Google sign in failed';
      setError(message);
      setAuthError({ code: 'GOOGLE_SIGNIN_ERROR', message, statusCode: 401 });
      return { ok: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } finally {
      clearAuth();
      router.replace('/');
      router.refresh();
      if (typeof window !== 'undefined') {
        window.location.assign('/');
      }
    }
  };

  return { signUp, signIn, signInWithGoogle, signOut, isLoading, error };
}
