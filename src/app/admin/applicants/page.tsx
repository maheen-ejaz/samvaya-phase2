import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { ApplicantList, type Applicant } from '@/components/admin/ApplicantList';

export default async function ApplicantsPage() {
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

  try {
    const adminSupabase = createAdminClient();

    // Fetch applicants who completed the form
    const { data: users } = await adminSupabase
      .from('users')
      .select('id, payment_status, bgv_consent, is_goocampus_member, updated_at')
      .eq('membership_status', 'onboarding_complete' as never)
      .order('updated_at', { ascending: false });

    if (!users || users.length === 0) {
      return (
        <div className="mx-auto max-w-7xl">
          <h1 className="text-2xl font-bold text-gray-900">Applicants</h1>
          <p className="mt-4 text-sm text-gray-500">No applicants have completed the form yet.</p>
        </div>
      );
    }

    const userIds = users.map((u) => u.id);

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

    const applicants: Applicant[] = users.map((u) => {
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
        <ApplicantList applicants={applicants} />
      </div>
    );
  } catch (err) {
    console.error('Applicants page load error:', err);
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
