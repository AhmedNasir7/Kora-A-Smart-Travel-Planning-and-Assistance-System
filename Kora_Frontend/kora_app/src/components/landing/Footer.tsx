'use client';

import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-[#1a1f2e] bg-[#13151A]">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity group">
            <div className="w-10 h-10 rounded-lg bg-[#FF7B54] flex items-center justify-center group-hover:bg-[#ff8a5b] transition-colors">
              <span className="text-white text-xl">✈</span>
            </div>
            <span className="text-white font-bold text-lg">Kora</span>
          </Link>

          {/* Copyright */}
          <p className="text-[12px] text-[#a9a59b]">
            © 2025 Kora. Travel with clarity.
          </p>

          {/* Links */}
          <div className="flex gap-6">
            <Link href="#" className="text-[12px] text-[#a9a59b] hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="#" className="text-[12px] text-[#a9a59b] hover:text-white transition-colors">
              Terms
            </Link>
            <Link href="#" className="text-[12px] text-[#a9a59b] hover:text-white transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
