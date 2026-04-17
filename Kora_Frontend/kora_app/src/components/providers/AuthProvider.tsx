'use client';

import { useLayoutEffect } from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { useAuthStore } from '@/stores/authStore';
import { createClient } from '@/lib/supabase/client';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((state) => state.setUser);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  useLayoutEffect(() => {
    const supabase = createClient();

    const syncUser = (user: SupabaseUser | null | undefined) => {
      if (!user) {
        clearAuth();
        return;
      }

      setUser({
        id: user.id,
        email: user.email ?? '',
        fullName: (user.user_metadata?.full_name as string) || '',
        username: (user.user_metadata?.username as string) || '',
        createdAt: user.created_at ?? new Date().toISOString(),
        updatedAt: user.updated_at ?? new Date().toISOString(),
      });
    };

    const initializeAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        syncUser(data.session?.user);
      } catch (error) {
        console.error('Auth initialization error:', error);
        clearAuth();
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      syncUser(session?.user);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, clearAuth]);

  return <>{children}</>;
}
