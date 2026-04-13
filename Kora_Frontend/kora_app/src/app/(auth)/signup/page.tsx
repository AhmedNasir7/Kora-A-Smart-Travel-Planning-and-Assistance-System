import { AuthLayout } from '@/components/auth/AuthLayout';
import { SignUpForm } from '@/components/auth/SignUpForm';

export const metadata = {
  title: 'Sign Up - Kora Travel',
  description: 'Create a new Kora travel account',
};

export default function SignUpPage() {
  return (
    <AuthLayout>
      <SignUpForm />
    </AuthLayout>
  );
}
