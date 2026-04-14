'use client';

import Link from 'next/link';

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#13151A]/95 backdrop-blur-md border-b border-[#1a1f2e]">
      <div className="w-full px-8 py-5 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity group">
          <div className="w-10 h-10 rounded-lg bg-[#FF7B54] flex items-center justify-center group-hover:bg-[#ff8a5b] transition-colors">
            <span className="text-white text-xl">✈</span>
          </div>
          <span className="text-white font-bold text-lg">Kora</span>
        </Link>

        {/* Navigation - Center */}
        <nav className="hidden lg:flex items-center gap-10 flex-1 justify-center">
          <Link href="#" className="text-[13px] font-medium text-[#a9a59b] hover:text-white transition-colors">
            Dashboard
          </Link>
          <Link href="#" className="text-[13px] font-medium text-[#a9a59b] hover:text-white transition-colors">
            Trips
          </Link>
          <Link href="#" className="text-[13px] font-medium text-[#a9a59b] hover:text-white transition-colors">
            Packing
          </Link>
          <Link href="#" className="text-[13px] font-medium text-[#a9a59b] hover:text-white transition-colors">
            Documents
          </Link>
          <Link href="#" className="text-[13px] font-medium text-[#a9a59b] hover:text-white transition-colors">
            Reminders
          </Link>
        </nav>

        {/* Auth - Right */}
        <div className="flex items-center gap-4">
          <Link href="/signin" className="text-[13px] font-medium text-[#a9a59b] hover:text-white transition-colors">
            Sign In
          </Link>
          <Link href="/signup" className="px-7 py-2.5 bg-[#FF7B54] hover:bg-[#FF9F6F] text-white text-[13px] font-semibold rounded-full transition-all shadow-lg shadow-[#FF7B54]/30 hover:shadow-[#FF7B54]/50 duration-200">
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
