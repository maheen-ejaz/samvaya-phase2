import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Validate that a string is a valid UUID v4. Returns a NextResponse error if invalid, or null if valid.
 */
export function validateUserId(userId: string): NextResponse | null {
  if (!userId || !UUID_REGEX.test(userId)) {
    return NextResponse.json({ error: 'Invalid user ID format' }, { status: 400 });
  }
  return null;
}

export interface AdminUser {
  id: string;
  role: 'admin' | 'super_admin';
}

/**
 * Verify the current request is from an authenticated admin user.
 * Returns the admin user or a NextResponse error.
 */
export async function requireAdmin(): Promise<
  { admin: AdminUser; error?: never } | { admin?: never; error: NextResponse }
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
    .select('role')
    .eq('id', user.id)
    .single();

  if (!userData || (userData.role !== 'admin' && userData.role !== 'super_admin')) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }

  return {
    admin: {
      id: user.id,
      role: userData.role as 'admin' | 'super_admin',
    },
  };
}
