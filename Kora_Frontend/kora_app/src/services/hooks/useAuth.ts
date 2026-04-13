import { useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { authAPI } from '../api/auth';
import { useAuthStore } from '@/stores/authStore';
import { SignInDto, SignUpDto } from '@/types/auth';

export function useSignIn() {
  const setUser = useAuthStore((state) => state.setUser);
  const setError = useAuthStore((state) => state.setError);

  return useMutation({
    mutationFn: (data: SignInDto) => authAPI.signIn(data),
    onSuccess: (data) => {
      // Store token
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', data.token);
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken);
        }
      }
      setUser(data.user);
      setError(null);
    },
    onError: (error: Error) => {
      setError({
        code: 'SIGNIN_ERROR',
        message: error.message,
        statusCode: 401,
      });
    },
  });
}

export function useSignUp() {
  const setUser = useAuthStore((state) => state.setUser);
  const setError = useAuthStore((state) => state.setError);

  return useMutation({
    mutationFn: (data: SignUpDto) => authAPI.signUp(data),
    onSuccess: (data) => {
      // Store token
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', data.token);
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken);
        }
      }
      setUser(data.user);
      setError(null);
    },
    onError: (error: Error) => {
      setError({
        code: 'SIGNUP_ERROR',
        message: error.message,
        statusCode: 400,
      });
    },
  });
}

export function useSignOut() {
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return useCallback(async () => {
    try {
      await authAPI.signOut();
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      }
      clearAuth();
    }
  }, [clearAuth]);
}
