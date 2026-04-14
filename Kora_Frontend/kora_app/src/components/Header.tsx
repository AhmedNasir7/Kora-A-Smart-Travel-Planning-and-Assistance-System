'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useAuth } from '@/hooks/useAuth';

interface HeaderProps {
  variant?: 'landing' | 'dashboard';
}

export function Header({ variant = 'landing' }: HeaderProps) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const handleDashboardClick = () => {
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      router.push('/signin');
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#13151A]/95 backdrop-blur-md border-b border-[#1a1f2e]">
      <div className="w-full px-8 py-5 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity duration-200 group">
          <div className="w-10 h-10 rounded-lg bg-[#FF7B54] flex items-center justify-center group-hover:bg-[#FF9F6F] transition-all duration-200 shadow-lg shadow-[#FF7B54]/30">
            <span className="text-white text-xl">✈</span>
          </div>
          <span className="text-white font-bold text-lg">Kora</span>
        </Link>

        {/* Navigation - Center */}
        <nav className="hidden lg:flex items-center gap-10 flex-1 justify-center">
          <button
            onClick={handleDashboardClick}
            className="text-[13px] font-medium text-[#a9a59b] hover:text-white transition-colors"
          >
            Dashboard
          </button>
          {isAuthenticated && (
            <>
              <Link
                href="/trips"
                className="text-[13px] font-medium text-[#a9a59b] hover:text-white transition-colors"
              >
                Trips
              </Link>
              <Link
                href="/packing"
                className="text-[13px] font-medium text-[#a9a59b] hover:text-white transition-colors"
              >
                Packing
              </Link>
              <Link
                href="/documents"
                className="text-[13px] font-medium text-[#a9a59b] hover:text-white transition-colors"
              >
                Documents
              </Link>
              <Link
                href="/reminders"
                className="text-[13px] font-medium text-[#a9a59b] hover:text-white transition-colors"
              >
                Reminders
              </Link>
            </>
          )}
        </nav>

        {/* Auth - Right */}
        <div className="flex items-center gap-6">
          {isAuthenticated ? (
            <>
              <span className="text-[13px] text-[#a9a59b]">
                {user?.fullName && `${user.fullName.split(' ')[0]}`}
              </span>
              <button
                onClick={handleSignOut}
                className="px-6 py-2.5 bg-gradient-to-r from-[#FF7B54] to-[#FF9F6F] hover:from-[#FF9F6F] hover:to-[#FFA880] text-white text-[13px] font-semibold rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-[#FF7B54]/50 hover:scale-105 active:scale-95"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/signin"
                className="text-[13px] font-medium text-[#a9a59b] hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-6 py-2.5 bg-[#FF7B54] hover:bg-[#FF9F6F] text-white text-[13px] font-semibold rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-[#FF7B54]/50"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
