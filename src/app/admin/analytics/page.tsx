import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { AnalyticsDashboard } from '@/components/admin/analytics/AnalyticsDashboard';
import { AnalyticsKPIStrip } from '@/components/admin/analytics/AnalyticsKPIStrip';
import { AnalyticsDonutGrid } from '@/components/admin/analytics/AnalyticsDonutGrid';
import { calculateAge } from '@/lib/utils';
import type { DistributionEntry } from '@/types/dashboard';

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
    redirect('/auth/login');
  }

  const adminSupabase = createAdminClient();

  const [profilesResult, medicalResult, usersResult, matchesResult] = await Promise.all([
    adminSupabase
      .from('profiles')
      .select('user_id, gender, date_of_birth, current_state'),
    adminSupabase
      .from('medical_credentials')
      .select('user_id, current_status'),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (adminSupabase as any)
      .from('users')
      .select('id, payment_status, membership_status, created_at')
      .eq('role', 'applicant'),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (adminSupabase as any)
      .from('match_presentations')
      .select('id', { count: 'exact', head: true }),
  ]);

  const profiles = profilesResult.data || [];
  const medical = medicalResult.data || [];
  const users = ((usersResult as { data: Array<{ id: string; payment_status: string | null; membership_status: string | null; created_at: string | null }> | null }).data || []);

  // KPI counts
  const totalApplicants = users.length;
  const formComplete = users.filter((u) => u.membership_status === 'onboarding_complete').length;
  const inPool = users.filter((u) => u.payment_status === 'in_pool').length;
  const matchesPresented = matchesResult.count ?? 0;
  const activeMembers = users.filter((u) => u.payment_status === 'active_member').length;

  // "+N this month" — applicants joined since the 1st of the current month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const addedThisMonth = users.filter(
    (u) => u.created_at && new Date(u.created_at) >= startOfMonth
  ).length;

  // Location
  const stateCounts = new Map<string, number>();
  for (const p of profiles) {
    if (p.current_state) {
      const normalized = p.current_state.trim().toLowerCase().replace(/\b\w/g, (c: string) => c.toUpperCase());
      stateCounts.set(normalized, (stateCounts.get(normalized) || 0) + 1);
    }
  }
  const locationData: DistributionEntry[] = [...stateCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([label, count]) => ({ label, count }));

  // Education
  const eduLabels: Record<string, string> = {
    mbbs_student: 'MBBS Student',
    intern: 'Intern',
    mbbs_passed: 'MBBS Passed',
    pursuing_pg: 'Pursuing PG',
    completed_pg: 'Completed PG',
  };
  const eduCounts = new Map<string, number>();
  for (const m of medical) {
    if (m.current_status) {
      eduCounts.set(m.current_status, (eduCounts.get(m.current_status) || 0) + 1);
    }
  }
  const educationData: DistributionEntry[] = [...eduCounts.entries()]
    .map(([key, count]) => ({ label: eduLabels[key] || key, count }))
    .sort((a, b) => b.count - a.count);

  // Age
  const ageBuckets: Record<string, number> = {
    '24-27': 0, '28-30': 0, '31-33': 0, '34-36': 0, '37+': 0,
  };
  for (const p of profiles) {
    const age = calculateAge(p.date_of_birth);
    if (age === null) continue;
    if (age <= 27) ageBuckets['24-27']++;
    else if (age <= 30) ageBuckets['28-30']++;
    else if (age <= 33) ageBuckets['31-33']++;
    else if (age <= 36) ageBuckets['34-36']++;
    else ageBuckets['37+']++;
  }
  const ageData: DistributionEntry[] = Object.entries(ageBuckets).map(([label, count]) => ({ label, count }));

  // Gender
  const genderCounts = new Map<string, number>();
  for (const p of profiles) {
    if (p.gender) {
      const label = p.gender === 'male' ? 'Male' : p.gender === 'female' ? 'Female' : p.gender;
      genderCounts.set(label, (genderCounts.get(label) || 0) + 1);
    }
  }
  const genderData: DistributionEntry[] = [...genderCounts.entries()].map(([label, count]) => ({ label, count }));

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">Platform metrics and applicant funnel.</p>
        </div>
        <p className="text-xs text-muted-foreground">Live data · refreshes on load</p>
      </div>

      <div className="mt-6 space-y-6">
        <AnalyticsKPIStrip
          totalApplicants={totalApplicants}
          formComplete={formComplete}
          inPool={inPool}
          matchesPresented={matchesPresented}
          activeMembers={activeMembers}
          addedThisMonth={addedThisMonth}
        />
        <AnalyticsDonutGrid
          locationData={locationData}
          educationData={educationData}
          ageData={ageData}
          genderData={genderData}
        />
        <AnalyticsDashboard />
      </div>
    </div>
  );
}
