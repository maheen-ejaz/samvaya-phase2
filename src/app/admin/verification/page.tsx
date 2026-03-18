import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { PaymentStatusBadge, ConsentBadge } from '@/components/admin/StatusBadge';

export default async function VerificationPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  // Verify admin role
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!userData || (userData.role !== 'admin' && userData.role !== 'super_admin')) {
    redirect('/app');
  }

  try {
    const adminSupabase = createAdminClient();

    // Fetch applicants who need verification:
    // - Form complete
    // - Payment status is verification_pending (fee paid, BGV not yet complete)
    // - Or unverified with pending documents
    const { data: users } = await adminSupabase
      .from('users')
      .select('id, payment_status, bgv_consent, is_bgv_complete, bgv_flagged, is_goocampus_member')
      .eq('membership_status', 'onboarding_complete' as never)
      .in('payment_status', ['verification_pending', 'in_pool'] as never)
      .order('updated_at', { ascending: false });

    const userIds = (users || []).map((u) => u.id);

    // Fetch names
    const { data: profiles } = userIds.length > 0
      ? await adminSupabase.from('profiles').select('user_id, first_name, last_name').in('user_id', userIds)
      : { data: [] };

    const profileMap = new Map(
      (profiles || []).map((p) => [p.user_id, p])
    );

    // Fetch document counts per user
    const { data: docs } = userIds.length > 0
      ? await adminSupabase
          .from('documents')
          .select('user_id, verification_status')
          .in('user_id', userIds)
      : { data: [] };

    const docCounts = new Map<string, { pending: number; total: number }>();
    (docs || []).forEach((d) => {
      const existing = docCounts.get(d.user_id) || { pending: 0, total: 0 };
      existing.total++;
      if (d.verification_status === 'pending') existing.pending++;
      docCounts.set(d.user_id, existing);
    });

    return (
      <div className="mx-auto max-w-7xl">
        <h1 className="text-2xl font-bold text-gray-900">Verification Queue</h1>
        <p className="mt-1 text-sm text-gray-500">
          Applicants with verification pending or needing BGV
        </p>

        {(!users || users.length === 0) ? (
          <div className="mt-6 rounded-lg border border-dashed border-gray-300 py-12 text-center">
            <p className="text-sm text-gray-500">No applicants in the verification queue.</p>
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">BGV Consent</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">BGV</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Documents</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {users.map((u) => {
                  const profile = profileMap.get(u.id);
                  const name = profile ? `${profile.first_name} ${profile.last_name}`.trim() : 'Unknown';
                  const dc = docCounts.get(u.id);

                  return (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                        <Link href={`/admin/applicants/${u.id}`} className="text-rose-700 hover:underline">
                          {name}
                        </Link>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm">
                        <PaymentStatusBadge status={u.payment_status} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm">
                        <ConsentBadge consent={u.bgv_consent} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm">
                        {u.is_bgv_complete ? (
                          <span className="text-green-700">Complete</span>
                        ) : u.bgv_flagged ? (
                          <span className="text-red-600">Flagged</span>
                        ) : (
                          <span className="text-gray-400">Pending</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                        {dc ? `${dc.pending} pending / ${dc.total} total` : '0 docs'}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm">
                        <Link
                          href={`/admin/verification/${u.id}`}
                          className="rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200"
                        >
                          BGV Tracker
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  } catch (err) {
    console.error('Verification page load error:', err);
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8" role="alert">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to load data</h2>
        <p className="text-gray-500 mb-4">Something went wrong while loading this page.</p>
        <a href="/admin" className="text-rose-600 hover:text-rose-700 font-medium">
          Return to dashboard
        </a>
      </div>
    );
  }
}
