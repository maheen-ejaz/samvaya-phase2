import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { ApplicantList, type Applicant } from '@/components/admin/ApplicantList';
import { WaitlistTable, type WaitlistEntry } from '@/components/admin/WaitlistTable';

const STAGE_TITLES: Record<string, string> = {
  waitlist: 'Waitlist',
  invited: 'Invited',
  signed_up: 'Signed Up',
  form_in_progress: 'Form In Progress',
  form_complete: 'Form Complete',
  payment_verified: 'Payment Verified',
  bgv_complete: 'BGV Complete',
  in_pool: 'In Pool',
  active_member: 'Active Members',
};

export default async function ApplicantsPage({
  searchParams,
}: {
  searchParams: Promise<{ stage?: string }>;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Verify admin role
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!userData || (userData.role !== 'admin' && userData.role !== 'super_admin')) {
    redirect('/app');
  }

  const { stage } = await searchParams;

  try {
    const adminSupabase = createAdminClient();

    // Waitlist stages use a different table
    if (stage === 'waitlist' || stage === 'invited') {
      let query = adminSupabase
        .from('waitlist')
        .select('id, full_name, email, phone, specialty, city, status, created_at')
        .order('created_at', { ascending: false });

      if (stage === 'invited') {
        query = query.eq('status', 'invited');
      }

      const { data: waitlistData } = await query;

      const entries: WaitlistEntry[] = (waitlistData || []).map((w) => ({
        id: w.id,
        fullName: w.full_name || '—',
        email: w.email || '—',
        phone: w.phone || '—',
        specialty: w.specialty || '—',
        city: w.city || '—',
        status: w.status || 'pending',
        createdAt: w.created_at || '',
      }));

      return (
        <div className="mx-auto max-w-7xl">
          <Link href="/admin" className="mb-4 inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
            ← Back to Dashboard
          </Link>
          <WaitlistTable entries={entries} title={STAGE_TITLES[stage] || 'Waitlist'} />
        </div>
      );
    }

    // All other stages query the users table with different filters
    let usersQuery = adminSupabase
      .from('users')
      .select('id, payment_status, membership_status, bgv_consent, is_goocampus_member, is_bgv_complete, updated_at')
      .eq('role', 'applicant' as never)
      .order('updated_at', { ascending: false });

    switch (stage) {
      case 'signed_up':
        // All signed-up applicants (no additional filter)
        break;
      case 'form_in_progress':
        usersQuery = usersQuery.in('membership_status', ['onboarding_pending', 'onboarding_in_progress'] as never);
        break;
      case 'payment_verified':
        // Need to cross-reference with payments table — handled below
        break;
      case 'bgv_complete':
        usersQuery = usersQuery.eq('is_bgv_complete', true as never);
        break;
      case 'in_pool':
        usersQuery = usersQuery.eq('payment_status', 'in_pool' as never);
        break;
      case 'active_member':
        usersQuery = usersQuery.eq('payment_status', 'active_member' as never);
        break;
      case 'form_complete':
      default:
        // Default: show completed applicants (original behavior)
        usersQuery = usersQuery.eq('membership_status', 'onboarding_complete' as never);
        break;
    }

    const { data: users } = await usersQuery;
    let filteredUsers = users || [];

    // For payment_verified, cross-reference with payments table
    if (stage === 'payment_verified') {
      const { data: payments } = await adminSupabase
        .from('payments')
        .select('user_id')
        .eq('verification_fee_paid', true as never);

      const paidUserIds = new Set((payments || []).map((p) => p.user_id));
      filteredUsers = filteredUsers.filter((u) => paidUserIds.has(u.id));
    }

    const pageTitle = stage && STAGE_TITLES[stage]
      ? `Pipeline: ${STAGE_TITLES[stage]}`
      : 'Applicants';

    if (filteredUsers.length === 0) {
      return (
        <div className="mx-auto max-w-7xl">
          {stage && (
            <Link href="/admin" className="mb-4 inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
              ← Back to Dashboard
            </Link>
          )}
          <h1 className="type-heading-xl text-gray-900">{pageTitle}</h1>
          <p className="mt-4 text-sm text-gray-500">No applicants found for this stage.</p>
        </div>
      );
    }

    const userIds = filteredUsers.map((u) => u.id);

    const [profilesResult, medicalResult, authUsersResult] = await Promise.all([
      adminSupabase
        .from('profiles')
        .select('user_id, first_name, last_name')
        .in('user_id', userIds),
      adminSupabase
        .from('medical_credentials')
        .select('user_id, specialty')
        .in('user_id', userIds),
      adminSupabase.auth.admin.listUsers({ perPage: 1000 }),
    ]);

    const profileMap = new Map(
      (profilesResult.data || []).map((p) => [p.user_id, p])
    );
    const medicalMap = new Map(
      (medicalResult.data || []).map((m) => [m.user_id, m])
    );
    const emailMap = new Map(
      (authUsersResult.data?.users || []).map((u) => [u.id, u.email || ''])
    );

    const applicants: Applicant[] = filteredUsers.map((u) => {
      const profile = profileMap.get(u.id);
      const medical = medicalMap.get(u.id);
      const rawSpecialty = medical?.specialty;

      return {
        id: u.id,
        firstName: profile?.first_name || 'Unknown',
        lastName: profile?.last_name || '',
        email: emailMap.get(u.id) || '—',
        specialty: Array.isArray(rawSpecialty)
          ? rawSpecialty.join(', ')
          : (rawSpecialty || ''),
        paymentStatus: u.payment_status || 'unverified',
        bgvConsent: u.bgv_consent || 'not_given',
        isGooCampusMember: u.is_goocampus_member || false,
        submittedAt: u.updated_at || '',
      };
    });

    return (
      <div className="mx-auto max-w-7xl">
        {stage && (
          <Link href="/admin" className="mb-4 inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
            ← Back to Dashboard
          </Link>
        )}
        <ApplicantList applicants={applicants} title={pageTitle} />
      </div>
    );
  } catch (err) {
    console.error('Applicants page load error:', err);
    throw err;
  }
}
