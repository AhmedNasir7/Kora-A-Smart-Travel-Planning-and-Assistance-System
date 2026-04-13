'use client';

import { authConfig } from '@/lib/auth-config';

export function SupportRail() {
  return (
    <div className="hidden lg:flex flex-col justify-center px-12 py-20 pointer-events-none">
      <div className="space-y-8 max-w-[340px] ml-auto">
        {/* Testimonial */}
        <div className="glass-card rounded-2xl p-6 shadow-2xl animate-fade-in" style={{ animationDelay: '300ms' }}>
          <p className="text-[15px] italic leading-relaxed text-foreground/80">
            "Kora completely changed how I travel. Everything in one place — it's
            like having a personal assistant."
          </p>
          <div className="mt-6 flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-[0_0_20px_rgba(255,107,53,0.3)]">
              S
            </div>
            <div>
              <p className="text-[14px] font-bold text-white">Sarah M.</p>
              <p className="text-[12px] text-[#7c7a70]">Frequent traveler</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 animate-fade-in" style={{ animationDelay: '400ms' }}>
          {[
            { value: '50k+', label: 'Travelers' },
            { value: '200k', label: 'Trips planned' },
            { value: '4.6★', label: 'App rating' },
            { value: '98%', label: 'Satisfied' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="glass-card rounded-2xl px-5 py-6 shadow-xl"
            >
              <p className="text-[28px] font-bold tracking-tight text-primary leading-none">
                {stat.value}
              </p>
              <p className="mt-2 text-[12px] font-medium text-[#7c7a70]">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
