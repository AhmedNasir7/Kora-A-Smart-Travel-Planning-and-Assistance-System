'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { signInSchema, type SignInFormData } from '@/lib/validations/auth';
import { authConfig } from '@/lib/auth-config';
import { useAuth } from '@/hooks/useAuth';
import { FormInput } from './FormInput';
import { FormCheckbox } from './FormCheckbox';
import { OAuthButton } from './OAuthButton';

export function SignInForm() {
  const { signIn, isLoading } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: SignInFormData) => {
    setApiError(null);
    const result = await signIn(data.email, data.password);
    if (!result.ok) {
      setApiError(result.error || 'Failed to sign in. Please try again.');
    }
  };

  return (
    <div className="flex h-full flex-col animate-slide-up-md text-[#f5f3eb]">
      <div className="space-y-2.5">
        <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,107,53,0.55)] bg-[rgba(255,107,53,0.1)] px-4 py-2 text-[#ff6b35] shadow-[0_0_24px_rgba(255,107,53,0.12)]">
          <span className="text-sm text-[#ff6b35]">✈</span>
          <span className="text-[11px] font-semibold tracking-[0.14em] text-[#ff6b35]">
            WELCOME TO KORA
          </span>
        </div>
        <div className="space-y-1 text-center">
          <h2 className="text-[31px] font-semibold tracking-[-0.05em] text-[#f5f3eb]">
            Your trips await
          </h2>
          <p className="text-[14px] font-normal text-[#a9a59b]">
            Sign in to continue your journey
          </p>
        </div>
      </div>

      <div className="mt-3 flex border-b border-[#2a3344] text-[13px]">
        <button className="relative px-1 pb-2.5 font-semibold text-[#f5f3eb]">
          {authConfig.labels.signIn}
          <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-[#f5f3eb]" />
        </button>
        <Link
          href="/signup"
          className="ml-6 px-1 pb-2.5 font-semibold text-[#7c808a] transition-colors hover:text-[#f5f3eb]"
        >
          {authConfig.labels.createAccount}
        </Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-3 space-y-2.5">
        {apiError && (
          <div className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400 border border-red-500/20">
            {apiError}
          </div>
        )}

        <FormInput
          label={authConfig.labels.email}
          placeholder={authConfig.placeholders.email}
          error={errors.email?.message}
          {...register('email')}
        />

        <FormInput
          type="password"
          label={authConfig.labels.password}
          placeholder={authConfig.placeholders.password}
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="flex items-center justify-between pt-0">
          <FormCheckbox
            label={authConfig.labels.rememberMe}
            {...register('rememberMe')}
          />
          <Link href="/forgot-password" className="text-xs font-medium text-[#ff6b35] transition-colors hover:text-[#ff8a5b]">
            {authConfig.links.forgotPassword}
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-full bg-[#ff6b35] px-4 py-3 text-[14px] font-semibold tracking-wide text-[#0f1323] shadow-lg shadow-[#ff6b35]/40 transition-all duration-200 hover:bg-[#ff8a5b] hover:shadow-xl hover:shadow-[#ff6b35]/60 disabled:cursor-not-allowed disabled:bg-[#ff6b35]/50"
        >
          {isLoading ? 'Signing in...' : authConfig.labels.signIn}
        </button>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border border-[#2a3344]"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-[#0f1323] px-2 text-[#7c808a] font-medium">
              or continue with
            </span>
          </div>
        </div>

        {/* OAuth Google */}
        <OAuthButton isLoading={isLoading}>
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google
        </OAuthButton>
      </form>

      <p className="mt-3 text-center text-[13px] text-[#7c808a]">
        Don't have an account?
        <Link
          href="/signup"
          className="ml-1 font-semibold text-[#ff6b35] transition-colors hover:text-[#ff8a5b]"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
