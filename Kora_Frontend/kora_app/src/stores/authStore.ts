import { create } from 'zustand';
import { User, ApiError } from '@/types/auth';

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  error: ApiError | null;
  isAuthenticated: boolean;

  // Actions
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: ApiError | null) => void;
  setAuthenticated: (authenticated: boolean) => void;
  clearAuth: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,

  setUser: (user: User) => {
    set({ user, isAuthenticated: true, error: null });
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

  clearAuth: () => {
    set({
      user: null,
      isAuthenticated: false,
      error: null,
      isLoading: false,
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
