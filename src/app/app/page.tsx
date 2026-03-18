import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { StatusDashboard } from '@/components/app/StatusDashboard';

export interface DashboardData {
  firstName: string | null;
  lastName: string | null;
  currentCity: string | null;
  currentState: string | null;
  specialty: string[] | null;
  currentDesignation: string | null;
  createdAt: string;
  verifiedAt: string | null;
  paidAt: string | null;
  membershipStartDate: string | null;
  membershipEndDate: string | null;
  totalMatches: number;
  pendingMatches: number;
}

export default async function ApplicantHome() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  try {
    // Parallel data fetching for enriched dashboard
    const [usersResult, profileResult, medResult, paymentResult, totalMatchResult, pendingMatchResult] =
      await Promise.all([
        supabase
          .from('users')
          .select('onboarding_section, created_at, verified_at')
          .eq('id', user.id)
          .single(),
        supabase
          .from('profiles')
          .select('first_name, last_name, current_city, current_state')
          .eq('user_id', user.id)
          .single(),
        supabase
          .from('medical_credentials')
          .select('specialty, current_designation')
          .eq('user_id', user.id)
          .single(),
        supabase
          .from('payments')
          .select('paid_at, membership_start_date, membership_expiry_date')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('match_presentations' as never)
          .select('id', { count: 'exact', head: true }),
        supabase
          .from('match_presentations' as never)
          .select('id', { count: 'exact', head: true })
          .eq('status', 'pending'),
      ]);

    const userData = usersResult.data as Record<string, unknown> | null;

    // If onboarding not complete, redirect to form
    if (Number(userData?.onboarding_section) < 13) {
      redirect('/app/onboarding');
    }

    const profile = profileResult.data;
    const medCred = medResult.data as Record<string, unknown> | null;
    const payment = paymentResult.data as Record<string, unknown> | null;

    const dashboardData: DashboardData = {
      firstName: profile?.first_name ?? null,
      lastName: profile?.last_name ?? null,
      currentCity: profile?.current_city ?? null,
      currentState: profile?.current_state ?? null,
      specialty: (medCred?.specialty as string[] | null) ?? null,
      currentDesignation: (medCred?.current_designation as string | null) ?? null,
      createdAt: (userData?.created_at as string) || new Date().toISOString(),
      verifiedAt: (userData?.verified_at as string | null) ?? null,
      paidAt: (payment?.paid_at as string | null) ?? null,
      membershipStartDate: (payment?.membership_start_date as string | null) ?? null,
      membershipEndDate: (payment?.membership_expiry_date as string | null) ?? null,
      totalMatches: totalMatchResult.count ?? 0,
      pendingMatches: pendingMatchResult.count ?? 0,
    };

    return <StatusDashboard data={dashboardData} />;
  } catch (err) {
    console.error('Page load error:', err);
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8" role="alert">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
        <p className="text-gray-500 mb-4">We couldn&apos;t load this page. Please try again.</p>
        <a href="/app" className="text-rose-600 hover:text-rose-700 font-medium">
          Return to home
        </a>
      </div>
    );
  }
}
