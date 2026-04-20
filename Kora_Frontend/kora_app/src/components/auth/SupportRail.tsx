'use client';

import { authConfig } from '@/lib/auth-config';

export function SupportRail() {
  return (
    <div className="hidden lg:flex flex-col justify-center px-12 py-20 pointer-events-none">
      <div className="space-y-8 max-w-[340px] ml-auto">
        {/* Features */}
        {authConfig.features.map((feature, idx) => (
          <div 
            key={idx}
            className="glass-card rounded-2xl p-6 shadow-2xl animate-fade-in" 
            style={{ animationDelay: `${300 + idx * 100}ms` }}
          >
            <h3 className="text-[15px] font-bold text-white mb-2">{feature.title}</h3>
            <p className="text-[13px] text-foreground/80">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
