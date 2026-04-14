import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import dynamic from 'next/dynamic';

const ActivityLogViewer = dynamic(
  () => import('@/components/admin/activity/ActivityLogViewer').then((m) => m.ActivityLogViewer),
  {
    loading: () => (
      <div className="space-y-3" role="status" aria-label="Loading activity log">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-100" />
        ))}
      </div>
    ),
  }
);

export default async function ActivityLogPage() {
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
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Activity Log</h1>
      <p className="mt-1 text-sm text-gray-500">Audit trail of all admin actions.</p>

      <div className="mt-6">
        <ActivityLogViewer />
      </div>
    </div>
  );
}
