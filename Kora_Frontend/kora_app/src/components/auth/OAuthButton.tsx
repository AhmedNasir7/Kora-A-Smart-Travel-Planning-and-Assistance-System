'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';

interface OAuthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode;
  children: ReactNode;
  isLoading?: boolean;
}

export function OAuthButton({
  icon,
  children,
  isLoading = false,
  ...props
}: OAuthButtonProps) {
  return (
    <button
      className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#2a3344] bg-[#171c2b] px-4 py-3 text-sm font-semibold text-[#f5f3eb] transition-all duration-200 hover:border-[#39465d] hover:bg-[#1f2436] focus:outline-none focus:ring-2 focus:ring-[rgba(255,107,53,0.55)] disabled:cursor-not-allowed disabled:opacity-50"
      disabled={isLoading}
      {...props}
    >
      {!isLoading ? (
        <>
          {icon ? <span className="text-base flex items-center justify-center">{icon}</span> : null}
          {children}
        </>
      ) : (
        'Loading...'
      )}
    </button>
  );
}
