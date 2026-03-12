import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AnalyticsDashboard } from '@/components/admin/analytics/AnalyticsDashboard';

export default async function AnalyticsPage() {
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
    redirect('/app/onboarding');
  }

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
      <p className="mt-1 text-sm text-gray-500">Platform metrics and applicant funnel.</p>

      <div className="mt-6">
        <AnalyticsDashboard />
      </div>
    </div>
  );
}
