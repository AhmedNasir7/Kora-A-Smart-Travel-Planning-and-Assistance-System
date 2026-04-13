'use client';

import { authConfig } from '@/lib/auth-config';

export function BrandSection() {
  return (
    <div className="hidden lg:flex flex-col justify-center px-12 xl:px-16 py-12 pointer-events-none">
      <div className="space-y-8 max-w-[450px]">
        {/* Badge */}
        <div className="animate-slide-up-sm">
          <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,107,53,0.4)] bg-[rgba(255,107,53,0.08)] px-4 py-2 shadow-[0_8px_16px_-4px_rgba(255,107,53,0.1)]">
            <span className="text-[#ff6b35] text-sm">✦</span>
            <span className="text-[10px] font-bold tracking-[0.15em] text-[#ff6b35] uppercase">
              Travel Companion
            </span>
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-4 animate-slide-up-md">
          <h1 className="text-[56px] lg:text-[62px] font-bold leading-[1.1] tracking-[-0.03em] text-white">
            Plan every
            <br />
            journey with
            <br />
            <span className="text-[#ff6b35]">clarity</span>
          </h1>
          <p className="max-w-[360px] text-[15px] leading-[1.6] text-[#8b8980]">
            Kora keeps your trips, packing lists, and travel documents in one beautifully organized place.
          </p>
        </div>

        {/* Features list */}
        <div className="space-y-6 animate-slide-up-md" style={{ animationDelay: '200ms' }}>
          {[
            { title: 'Smart Trip Planning', desc: 'Organize all your travel details effortlessly' },
            { title: 'Packing Lists', desc: 'Never forget what matters most' },
            { title: 'Document Vault', desc: 'Passports, visas — safely stored' },
          ].map((feature, idx) => (
            <div key={idx} className="space-y-1">
              <h3 className="text-[15px] font-semibold text-white leading-snug">
                {feature.title}
              </h3>
              <p className="text-[13px] text-[#7a7870] leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
