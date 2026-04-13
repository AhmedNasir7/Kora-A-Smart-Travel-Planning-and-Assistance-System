'use client';

import { InputHTMLAttributes } from 'react';

interface FormCheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function FormCheckbox({ label, ...props }: FormCheckboxProps) {
  return (
    <div className="flex items-center space-x-2.5">
      <input
        type="checkbox"
        className="h-4 w-4 cursor-pointer rounded-sm border border-[#2a3344] bg-[#171c2b] text-[#ff6b35] transition-all hover:border-[#39465d] focus:ring-2 focus:ring-[rgba(255,107,53,0.55)]"
        {...props}
      />
      <label className="cursor-pointer text-xs font-medium text-[#a9a59b] transition-colors hover:text-[#f5f3eb]\">
        {label}
      </label>
    </div>
  );
}
