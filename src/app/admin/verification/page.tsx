import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { VerificationTable } from '@/components/admin/verification/VerificationTable';

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

  const rows = users.map((u) => {
    const profile = profileMap.get(u.id);
    const dc = docCounts.get(u.id);
    return {
      id: u.id,
      firstName: profile?.first_name ?? null,
      lastName: profile?.last_name ?? null,
      paymentStatus: u.payment_status,
      bgvConsent: u.bgv_consent,
      isBgvComplete: u.is_bgv_complete,
      bgvFlagged: u.bgv_flagged,
      isGooCampusMember: u.is_goocampus_member,
      docsPending: dc?.pending ?? 0,
      docsTotal: dc?.total ?? 0,
    };
  });

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex items-center gap-3">
        <h1 className="type-heading-xl text-gray-900">Verification Queue</h1>
        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-sm font-normal text-gray-600">
          {users.length}
        </span>
      </div>

      {users.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 py-12 text-center">
          <p className="text-sm text-gray-500">No applicants in the verification queue.</p>
        </div>
      ) : (
        <VerificationTable rows={rows} />
      )}
    </div>
  );
}
