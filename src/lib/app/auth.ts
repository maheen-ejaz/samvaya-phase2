import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export interface ApplicantUser {
  id: string;
  paymentStatus: string;
  isGoocampusMember: boolean;
}

/**
 * Verify the current request is from an authenticated applicant.
 * Returns the user or a NextResponse error.
 */
export async function requireApplicant(): Promise<
  { user: ApplicantUser; error?: never } | { user?: never; error: NextResponse }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const { data: userData } = await supabase
    .from('users')
    .select('role, payment_status, is_goocampus_member')
    .eq('id', user.id)
    .single();

  if (!userData) {
    return { error: NextResponse.json({ error: 'User not found' }, { status: 404 }) };
  }

  // Admins should not access applicant routes
  if (userData.role === 'admin' || userData.role === 'super_admin') {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }

  return {
    user: {
      id: user.id,
      paymentStatus: userData.payment_status ?? 'unverified',
      isGoocampusMember: userData.is_goocampus_member ?? false,
    },
  };
}
