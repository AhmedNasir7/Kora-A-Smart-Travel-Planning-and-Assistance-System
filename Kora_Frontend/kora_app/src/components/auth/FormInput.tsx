'use client';

import { useState } from 'react';
import { InputHTMLAttributes } from 'react';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
}

export function FormInput({
  label,
  error,
  icon,
  type = 'text',
  ...props
}: FormInputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isPasswordField = type === 'password';
  const resolvedType = isPasswordField
    ? isPasswordVisible
      ? 'text'
      : 'password'
    : type;

  const baseClasses = 'w-full h-12 rounded-xl border bg-[#171c2b] px-4 text-sm font-medium text-[#f5f3eb] placeholder:text-[#7c808a] transition-all duration-200 focus:outline-none focus:ring-1';
  const iconClasses = icon ? 'pl-10' : '';
  const passwordToggleClasses = isPasswordField ? 'pr-12' : '';
  const errorClasses = error ? 'border-[#ef4444]/60 focus:border-[#ef4444] focus:ring-[#ef4444]/30' : 'border-[#2a3344] hover:border-[#39465d] focus:border-[#ff6b35] focus:ring-[#ff6b35]/30';
  const inputClasses = `${baseClasses} ${iconClasses} ${passwordToggleClasses} ${errorClasses}`;

  return (
    <div className="space-y-1.5">
      <label className="block text-[12px] font-medium text-[#a9a59b]">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7c808a] text-sm">
            {icon}
          </div>
        )}
        <input
          type={resolvedType}
          className={inputClasses}
          {...props}
        />
        {isPasswordField && (
          <button
            type="button"
            onClick={() => setIsPasswordVisible((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#a9a59b] hover:text-[#f5f3eb]"
            aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
            aria-pressed={isPasswordVisible}
          >
            {isPasswordVisible ? 'Hide' : 'Show'}
          </button>
        )}
      </div>
      {error && <p className="mt-0.5 text-xs text-[#ef4444]">{error}</p>}
    </div>
  );
}
