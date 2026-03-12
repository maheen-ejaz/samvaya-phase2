import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { MetricCard } from '@/components/admin/MetricCard';

export default async function AdminDashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Verify the user has admin role
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!userData || (userData.role !== 'admin' && userData.role !== 'super_admin')) {
    redirect('/app/onboarding');
  }

  const adminSupabase = createAdminClient();

  // Fetch aggregate metrics in parallel
  const [
    totalUsersResult,
    onboardingCompleteResult,
    verificationPendingResult,
    inPoolResult,
    pendingDocsResult,
  ] = await Promise.all([
    adminSupabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'applicant' as never),
    adminSupabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('membership_status', 'onboarding_complete' as never),
    adminSupabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('payment_status', 'verification_pending' as never),
    adminSupabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('payment_status', 'in_pool' as never),
    adminSupabase
      .from('documents')
      .select('id', { count: 'exact', head: true })
      .eq('verification_status', 'pending' as never),
  ]);

  const totalApplicants = totalUsersResult.count ?? 0;
  const formComplete = onboardingCompleteResult.count ?? 0;
  const verificationPending = verificationPendingResult.count ?? 0;
  const inPool = inPoolResult.count ?? 0;
  const pendingDocs = pendingDocsResult.count ?? 0;

  // Fetch recent unverified applicants for action items
  const { data: recentUnverified } = await adminSupabase
    .from('users')
    .select('id, payment_status, is_goocampus_member, updated_at')
    .eq('membership_status', 'onboarding_complete' as never)
    .eq('payment_status', 'unverified' as never)
    .order('updated_at', { ascending: false })
    .limit(5);

  // Get names for action items
  const actionUserIds = (recentUnverified || []).map((u) => u.id);
  const { data: actionProfiles } = actionUserIds.length > 0
    ? await adminSupabase
        .from('profiles')
        .select('user_id, first_name, last_name')
        .in('user_id', actionUserIds)
    : { data: [] };

  const profileMap = new Map(
    (actionProfiles || []).map((p) => [p.user_id, p])
  );

  return (
    <div className="mx-auto max-w-7xl">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* Metrics */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <MetricCard label="Total Applicants" value={totalApplicants} />
        <MetricCard label="Form Complete" value={formComplete} />
        <MetricCard label="Verification Pending" value={verificationPending} />
        <MetricCard label="In Pool" value={inPool} />
        <MetricCard label="Pending Documents" value={pendingDocs} />
      </div>

      {/* Action Items */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900">Action Items</h2>
        {(!recentUnverified || recentUnverified.length === 0) ? (
          <p className="mt-3 text-sm text-gray-500">No pending actions.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {recentUnverified.map((u) => {
              const profile = profileMap.get(u.id);
              const name = profile
                ? `${profile.first_name} ${profile.last_name}`.trim()
                : 'Unknown';
              return (
                <a
                  key={u.id}
                  href={`/admin/applicants/${u.id}`}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm hover:bg-gray-50"
                >
                  <div>
                    <span className="font-medium text-gray-900">{name}</span>
                    <span className="ml-2 text-gray-500">
                      — awaiting {u.is_goocampus_member ? 'GooCampus verification' : 'fee confirmation'}
                    </span>
                  </div>
                  <span className="text-gray-400">&rarr;</span>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
