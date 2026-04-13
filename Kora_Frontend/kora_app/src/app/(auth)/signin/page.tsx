import { AuthLayout } from '@/components/auth/AuthLayout';
import { SignInForm } from '@/components/auth/SignInForm';

export const metadata = {
  title: 'Sign In - Kora Travel',
  description: 'Sign in to your Kora travel account',
};

export default function SignInPage() {
  return (
    <AuthLayout>
      <SignInForm />
    </AuthLayout>
  );
}
