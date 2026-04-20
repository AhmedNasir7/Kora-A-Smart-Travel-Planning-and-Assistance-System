import { create } from 'zustand';
import { User, ApiError } from '@/types/auth';

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  error: ApiError | null;
  isAuthenticated: boolean;
  isInitialized: boolean;

  // Actions
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: ApiError | null) => void;
  setAuthenticated: (authenticated: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  clearAuth: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
  isInitialized: false,

  setUser: (user: User) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('kora_user_id', user.id);
      localStorage.setItem('kora_auth', JSON.stringify({ authenticated: true, userId: user.id }));
    }
    set({ user, isAuthenticated: true, error: null, isInitialized: true });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setError: (error: ApiError | null) => {
    set({ error });
  },

  setAuthenticated: (authenticated: boolean) => {
    set({ isAuthenticated: authenticated });
  },

  setInitialized: (initialized: boolean) => {
    set({ isInitialized: initialized });
  },

  clearAuth: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('kora_user_id');
      localStorage.removeItem('kora_auth');
    }
    set({
      user: null,
      isAuthenticated: false,
      error: null,
      isLoading: false,
      isInitialized: true,
    });
  },

  hydrate: () => {
    // Load user data from localStorage on app initialization
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      // If token exists, user is authenticated (you might want to validate with backend)
      if (token) {
        set({ isAuthenticated: true });
      }
    }
  },
}));
