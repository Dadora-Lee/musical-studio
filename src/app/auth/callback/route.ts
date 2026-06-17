import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const providerError = url.searchParams.get('error') ?? url.searchParams.get('error_code');
  const next = url.searchParams.get('next') ?? '/work';
  const redirectUrl = new URL(next, url.origin);

  if (providerError) {
    redirectUrl.searchParams.set('auth_error', providerError);
    return NextResponse.redirect(redirectUrl);
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      redirectUrl.searchParams.set('auth_error', error.message);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.redirect(redirectUrl);
}
