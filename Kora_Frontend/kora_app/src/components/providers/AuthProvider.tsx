'use client';

import { useLayoutEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { createClient } from '@/lib/supabase/client';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((state) => state.setUser);
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);

  useLayoutEffect(() => {
    const initializeAuth = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getSession();

        if (data.session?.user) {
          const user = data.session.user;
          setUser({
            id: user.id,
            email: user.email ?? '',
            fullName: (user.user_metadata?.full_name as string) || '',
            username: (user.user_metadata?.username as string) || '',
            createdAt: user.created_at ?? new Date().toISOString(),
            updatedAt: user.updated_at ?? new Date().toISOString(),
          });
        } else {
          setAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setAuthenticated(false);
      }
    };

    initializeAuth();
  }, [setUser, setAuthenticated]);

  return <>{children}</>;
}
