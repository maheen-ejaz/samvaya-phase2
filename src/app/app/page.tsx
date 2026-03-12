import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { StatusDashboard } from '@/components/app/StatusDashboard';

export default async function ApplicantHome() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const { data: userDataRaw } = await supabase
    .from('users')
    .select('onboarding_section')
    .eq('id', user.id)
    .single();
  const userData = userDataRaw as Record<string, unknown> | null;

  // If onboarding not complete, redirect to form
  if (userData?.onboarding_section !== 'completed') {
    redirect('/app/onboarding');
  }

  return <StatusDashboard />;
}
