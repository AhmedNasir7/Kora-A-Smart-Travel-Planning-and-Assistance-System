import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  if (!code) {
    const fallbackUrl = new URL('/signin', origin);
    fallbackUrl.searchParams.set('error', 'missing_oauth_code');
    return NextResponse.redirect(fallbackUrl);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const fallbackUrl = new URL('/signin', origin);
    fallbackUrl.searchParams.set('error', 'google_auth_failed');
    return NextResponse.redirect(fallbackUrl);
  }

  const next = requestUrl.searchParams.get('next');
  const redirectPath = next && next.startsWith('/') ? next : '/dashboard';
  return NextResponse.redirect(new URL(redirectPath, origin));
}
