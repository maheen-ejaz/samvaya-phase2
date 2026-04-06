import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { PaymentStatusBadge, ConsentBadge } from '@/components/admin/StatusBadge';

type VerificationUser = {
  id: string;
  payment_status: string;
  bgv_consent: string | null;
  is_bgv_complete: boolean;
  bgv_flagged: boolean;
  is_goocampus_member: boolean;
};

type ProfileEntry = { user_id: string; first_name: string | null; last_name: string | null };
type DocEntry = { user_id: string; verification_status: string };

async function loadVerificationData() {
  const adminSupabase = createAdminClient();

  const { data: users } = await adminSupabase
    .from('users')
    .select('id, payment_status, bgv_consent, is_bgv_complete, bgv_flagged, is_goocampus_member')
    .eq('membership_status', 'onboarding_complete' as never)
    .in('payment_status', ['verification_pending', 'in_pool'] as never)
    .order('updated_at', { ascending: false });

  const userIds = (users || []).map((u: VerificationUser) => u.id);

  const { data: profiles } = userIds.length > 0
    ? await adminSupabase.from('profiles').select('user_id, first_name, last_name').in('user_id', userIds)
    : { data: [] };

  const profileMap = new Map(
    (profiles || []).map((p: ProfileEntry) => [p.user_id, p])
  );

  const { data: docs } = userIds.length > 0
    ? await adminSupabase
        .from('documents')
        .select('user_id, verification_status')
        .in('user_id', userIds)
    : { data: [] };

  const docCounts = new Map<string, { pending: number; total: number }>();
  (docs || []).forEach((d: DocEntry) => {
    const existing = docCounts.get(d.user_id) || { pending: 0, total: 0 };
    existing.total++;
    if (d.verification_status === 'pending') existing.pending++;
    docCounts.set(d.user_id, existing);
  });

  return { users: (users || []) as VerificationUser[], profileMap, docCounts };
}

export default async function VerificationPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!userData || (userData.role !== 'admin' && userData.role !== 'super_admin')) {
    redirect('/app');
  }

  const { users, profileMap, docCounts } = await loadVerificationData();

  return (
    <div className="mx-auto max-w-7xl">
      <h1 className="type-heading-xl text-gray-900">Verification Queue</h1>
      <p className="mt-1 text-sm text-gray-500">
        Applicants with verification pending or needing BGV
      </p>

      {users.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed border-gray-300 py-12 text-center">
          <p className="text-sm text-gray-500">No applicants in the verification queue.</p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-gray-100">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-white">
              <tr>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400">Name</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400">Status</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400">BGV Consent</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400">BGV</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400">Documents</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {users.map((u) => {
                const profile = profileMap.get(u.id);
                const name = profile ? `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim() : 'Unknown';
                const dc = docCounts.get(u.id);

                return (
                  <tr key={u.id} className="transition-colors hover:bg-gray-50/70">
                    <td className="whitespace-nowrap px-4 py-4 text-sm">
                      <span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-1 text-xs">
                        <Link href={`/admin/applicants/${u.id}`} className="font-medium text-gray-900 transition-colors hover:text-rose-700">
                          {name}
                        </Link>
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm">
                      <PaymentStatusBadge status={u.payment_status} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm">
                      <ConsentBadge consent={u.bgv_consent ?? ''} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm">
                      <span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-1">
                        {u.is_bgv_complete ? (
                          <span className="text-xs text-green-700">Complete</span>
                        ) : u.bgv_flagged ? (
                          <span className="text-xs text-red-600">Flagged</span>
                        ) : (
                          <span className="text-xs text-gray-400">Pending</span>
                        )}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm">
                      <span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
                        {dc ? `${dc.pending} pending / ${dc.total} total` : '0 docs'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm">
                      <Link
                        href={`/admin/verification/${u.id}`}
                        className="rounded-md border border-gray-200 bg-white px-3 py-1 text-xs text-gray-900 hover:border-gray-300 hover:text-black"
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
}
