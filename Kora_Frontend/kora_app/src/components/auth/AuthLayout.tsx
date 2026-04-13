'use client';

import { ReactNode } from 'react';
import { BrandSection } from './BrandSection';
import { SupportRail } from './SupportRail';

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="h-screen w-full overflow-hidden bg-background">
      {/* Background Glow */}
      <div className="fixed left-0 top-0 h-[700px] w-[700px] -translate-x-1/3 -translate-y-1/4 rounded-full bg-[rgba(255,107,53,0.15)] blur-[140px]" />
      
      <div className="relative z-10 grid h-full w-full lg:grid-cols-[1fr_380px_1.1fr] xl:grid-cols-[1.2fr_400px_1fr]">
        <BrandSection />

        <div className="flex items-center justify-center px-3 overflow-hidden pt-0 pb-0">
          <div className="glass-card w-full max-w-[360px] rounded-[24px] p-7 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] animate-fade-in">
            {children}
          </div>
        </div>

        <SupportRail />
      </div>
    </div>
  );
}
