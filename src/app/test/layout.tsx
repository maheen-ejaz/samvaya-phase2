import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

/**
 * Test pages are development-only. In production, only admins can access them.
 * This layout gate prevents public access to /test/* routes.
 */
export default async function TestLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!userData || (userData.role !== 'admin' && userData.role !== 'super_admin')) {
    redirect('/app');
  }

  return <>{children}</>;
}
