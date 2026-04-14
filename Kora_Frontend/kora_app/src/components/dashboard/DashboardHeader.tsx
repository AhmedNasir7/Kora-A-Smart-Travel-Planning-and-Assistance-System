'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export function DashboardHeader() {
  const router = useRouter();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const navItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Trips', href: '/trips' },
    { label: 'Packing', href: '/packing' },
    { label: 'Documents', href: '/documents' },
    { label: 'Reminders', href: '/reminders' },
  ];

  return (
    <header className="bg-[#13151A] border-b border-[#2A2D35]">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo and Nav */}
        <div className="flex items-center gap-12">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#FF7B54] to-[#FF9F6F] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">K</span>
            </div>
            <span className="text-white font-semibold text-lg">Kora</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-[#A0A5B8] hover:text-white transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleSignOut}
            className="text-sm text-[#A0A5B8] hover:text-white transition-colors"
          >
            Log out
          </button>
          <button className="px-4 py-2 bg-[#FF7B54] hover:bg-[#FF9F6F] text-white text-sm font-medium rounded-lg transition-colors">
            Get Started
          </button>
        </div>
      </div>
    </header>
  );
}
