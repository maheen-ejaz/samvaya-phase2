import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/app';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Validate redirect path to prevent open redirects
      const redirectTo = next.startsWith('/') ? next : '/app';
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }
  }

  // Auth code exchange failed — redirect to login
  return NextResponse.redirect(new URL('/auth/login', request.url));
}
