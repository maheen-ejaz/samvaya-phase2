import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { MetricCard } from '@/components/admin/MetricCard';
import { PipelineFunnel } from '@/components/admin/dashboard/PipelineFunnel';
import { AlertsList } from '@/components/admin/dashboard/AlertsList';
import { DistributionTabs } from '@/components/admin/dashboard/DistributionTabs';
import { MatchCommandCenter } from '@/components/admin/dashboard/MatchCommandCenter';
import { ActivityFeed } from '@/components/admin/dashboard/ActivityFeed';
import { RecentComms } from '@/components/admin/dashboard/RecentComms';
import { calculateAge, daysSince } from '@/lib/utils';
import type { DashboardAlert, DashboardMatch, DashboardActivityLog, DashboardCommLog, DistributionEntry, MatchStageCounts, PipelineStage } from '@/types/dashboard';

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

  try {
    const adminSupabase = createAdminClient();

    // ================================================================
    // Consolidated data fetching — 9 parallel queries
    // ================================================================
    const [
      usersResult,
      waitlistResult,
      paymentsResult,
      suggestionsResult,
      presentationsResult,
      profilesResult,
      medicalResult,
      activityResult,
      commsResult,
      snapshotsResult,
    ] = await Promise.all([
      // A: All applicant users
      adminSupabase
        .from('users')
        .select('id, membership_status, payment_status, is_bgv_complete, bgv_flagged, is_goocampus_member, updated_at')
        .eq('role', 'applicant' as never),

      // B: Waitlist
      adminSupabase
        .from('waitlist')
        .select('id, status'),

      // C: Payments with verification fee paid
      adminSupabase
        .from('payments')
        .select('id', { count: 'exact', head: true })
        .eq('verification_fee_paid', true as never),

      // D: Match suggestions
      adminSupabase
        .from('match_suggestions' as never)
        .select('id, profile_a_id, profile_b_id, overall_compatibility_score, match_narrative, compatibility_report, admin_status, admin_notes, updated_at'),

      // E: Match presentations
      adminSupabase
        .from('match_presentations' as never)
        .select('id, match_suggestion_id, status, is_mutual_interest, member_a_response, member_b_response, presented_at, expires_at, updated_at'),

      // F: All profiles (for names, gender, DOB, state)
      adminSupabase
        .from('profiles')
        .select('user_id, first_name, last_name, gender, date_of_birth, current_state, current_city'),

      // G: Medical credentials (for education distribution)
      adminSupabase
        .from('medical_credentials')
        .select('user_id, current_status, specialty'),

      // H: Activity log — last 24 hours
      adminSupabase
        .from('activity_log' as never)
        .select('id, actor_id, action, entity_type, entity_id, created_at')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() as never)
        .order('created_at' as never, { ascending: false })
        .limit(20),

      // I: Recent communications
      adminSupabase
        .from('communication_log' as never)
        .select('id, user_id, subject, sent_at, status, channel')
        .order('sent_at' as never, { ascending: false })
        .limit(10),

      // J: Daily snapshots (last 7 days for trends)
      adminSupabase
        .from('daily_snapshots' as never)
        .select('*')
        .gte('snapshot_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] as never)
        .order('snapshot_date' as never, { ascending: true }),
    ]);

    const users = usersResult.data || [];
    const waitlist = waitlistResult.data || [];
    const profiles = profilesResult.data || [];
    const medical = medicalResult.data || [];
    const suggestions = (suggestionsResult.data || []) as Array<{
      id: string; profile_a_id: string; profile_b_id: string;
      overall_compatibility_score: number; match_narrative: string;
      compatibility_report: Record<string, unknown> | null;
      admin_status: string; admin_notes: string | null; updated_at: string;
    }>;
    const presentations = (presentationsResult.data || []) as Array<{
      id: string; match_suggestion_id: string; status: string;
      is_mutual_interest: boolean; member_a_response: string;
      member_b_response: string; presented_at: string;
      expires_at: string; updated_at: string;
    }>;
    const activityLogs = (activityResult.data || []) as Array<{
      id: string; actor_id: string; action: string;
      entity_type: string; entity_id: string; created_at: string;
    }>;
    const commsLogs = (commsResult.data || []) as Array<{
      id: string; user_id: string; subject: string;
      sent_at: string; status: string; channel: string;
    }>;

    // Parse snapshots for trend data
    const snapshots = (snapshotsResult.data || []) as Array<{
      snapshot_date: string;
      waitlist_total: number; waitlist_invited: number; signed_up: number;
      form_in_progress: number; form_complete: number; payment_verified: number;
      bgv_complete: number; in_pool: number; matches_active: number; active_members: number;
    }>;

    // Build trend helper: compares current value vs first snapshot value
    function buildTrend(current: number, snapshotKey: keyof typeof snapshots[0]): {
      trend?: { direction: 'up' | 'down' | 'flat'; percentage: number; label: string };
      sparkline?: number[];
    } {
      if (snapshots.length < 2) return {};
      const values = snapshots.map((s) => Number(s[snapshotKey]) || 0);
      const oldest = values[0];
      const pct = oldest > 0 ? Math.round(((current - oldest) / oldest) * 100) : 0;
      return {
        trend: {
          direction: pct > 0 ? 'up' : pct < 0 ? 'down' : 'flat',
          percentage: Math.abs(pct),
          label: 'vs 7d ago',
        },
        sparkline: [...values, current],
      };
    }

    // ================================================================
    // Build profile name map (used everywhere)
    // ================================================================
    const profileMap = new Map(profiles.map((p) => [p.user_id, p]));
    const medicalMap = new Map(medical.map((m) => [m.user_id, m]));
    const currentUserId = user.id;

    function getName(userId: string): string {
      // Check profiles first (applicants)
      const p = profileMap.get(userId);
      if (p) {
        const name = `${p.first_name || ''} ${p.last_name || ''}`.trim();
        if (name) return name;
      }
      // For admin users: show "You" for the current admin, "Admin" for others
      if (userId === currentUserId) return 'You';
      return 'Admin';
    }

    function getDetails(userId: string): string {
      const p = profileMap.get(userId);
      const m = medicalMap.get(userId);
      const parts: string[] = [];
      if (p?.date_of_birth) {
        const age = calculateAge(p.date_of_birth);
        if (age) parts.push(`${age}y`);
      }
      if (p?.gender) parts.push(p.gender);
      if (m?.current_status) {
        const spec = Array.isArray(m.specialty) ? m.specialty[0] : null;
        if (spec) parts.push(String(spec));
      }
      if (p?.current_city) parts.push(p.current_city);
      if (p?.current_state && !p.current_city) parts.push(p.current_state);
      return parts.join(' · ');
    }

    // ================================================================
    // ROW 1: Pipeline KPI counts
    // ================================================================
    const waitlistTotal = waitlist.length;
    const waitlistInvited = waitlist.filter((w) => w.status === 'invited').length;
    const signedUp = users.length;
    const formInProgress = users.filter((u) => u.membership_status === 'onboarding_pending' || u.membership_status === 'onboarding_in_progress').length;
    const formComplete = users.filter((u) => u.membership_status === 'onboarding_complete').length;
    const paymentVerified = paymentsResult.count ?? 0;
    const bgvComplete = users.filter((u) => u.is_bgv_complete).length;
    const inPool = users.filter((u) => u.payment_status === 'in_pool').length;
    const matchesActive = presentations.filter((p) => p.status === 'pending').length;
    const activeMembers = users.filter((u) => u.payment_status === 'active_member').length;

    // ================================================================
    // ROW 2: Pipeline Funnel with conversion percentages
    // ================================================================
    // Funnel stages with explicit conversion pairs (only show % for meaningful subset transitions)
    const funnelData: PipelineStage[] = [
      { stage: 'Waitlist', count: waitlistTotal, conversionPct: null },
      { stage: 'Invited', count: waitlistInvited, conversionPct: waitlistTotal > 0 ? Math.round((waitlistInvited / waitlistTotal) * 100) : null },
      { stage: 'Signed Up', count: signedUp, conversionPct: null }, // not a subset of invited
      { stage: 'Form In Progress', count: formInProgress, conversionPct: null },
      { stage: 'Form Complete', count: formComplete, conversionPct: signedUp > 0 ? Math.round((formComplete / signedUp) * 100) : null },
      { stage: 'Payment Verified', count: paymentVerified, conversionPct: formComplete > 0 ? Math.round((paymentVerified / formComplete) * 100) : null },
      { stage: 'BGV Complete', count: bgvComplete, conversionPct: paymentVerified > 0 ? Math.round((bgvComplete / paymentVerified) * 100) : null },
      { stage: 'In Pool', count: inPool, conversionPct: bgvComplete > 0 ? Math.round((inPool / bgvComplete) * 100) : null },
      { stage: 'Matches Active', count: matchesActive, conversionPct: inPool > 0 ? Math.round((matchesActive / inPool) * 100) : null },
      { stage: 'Active Members', count: activeMembers, conversionPct: null },
    ];

    // ================================================================
    // ROW 3 LEFT: Alerts & Action Items
    // ================================================================
    const alerts: DashboardAlert[] = [];

    // Unverified applicants who completed the form
    const unverifiedComplete = users.filter(
      (u) => u.membership_status === 'onboarding_complete' && u.payment_status === 'unverified'
    );
    for (const u of unverifiedComplete.slice(0, 10)) {
      const name = getName(u.id);
      const isGooCampus = u.is_goocampus_member;
      alerts.push({
        id: `unverified-${u.id}`,
        userId: u.id,
        name,
        message: isGooCampus ? 'GooCampus member — verify to move to pool' : 'Form complete — awaiting fee confirmation',
        priority: 'high',
        actionLabel: isGooCampus ? 'Verify GooCampus' : 'Mark Fee Paid',
        actionEndpoint: `/api/admin/applicants/${u.id}/status`,
        actionPayload: { action: isGooCampus ? 'mark_goocampus_verified' : 'mark_verification_paid' },
        daysStuck: daysSince(u.updated_at),
      });
    }

    // BGV flagged
    const flagged = users.filter((u) => u.bgv_flagged);
    for (const u of flagged.slice(0, 5)) {
      alerts.push({
        id: `bgv-flagged-${u.id}`,
        userId: u.id,
        name: getName(u.id),
        message: 'BGV check flagged — requires review',
        priority: 'high',
        actionLabel: 'View BGV',
        actionHref: `/admin/verification/${u.id}`,
      });
    }

    // Presentations expiring within 48 hours
    const expiringSoon = presentations.filter((p) => {
      if (p.status !== 'pending' || !p.expires_at) return false;
      const hoursLeft = (new Date(p.expires_at).getTime() - Date.now()) / (60 * 60 * 1000);
      return hoursLeft > 0 && hoursLeft <= 48;
    });
    for (const p of expiringSoon.slice(0, 5)) {
      const suggestion = suggestions.find((s) => s.id === p.match_suggestion_id);
      if (!suggestion) continue;
      alerts.push({
        id: `expiring-${p.id}`,
        userId: suggestion.profile_a_id,
        name: `${getName(suggestion.profile_a_id)} & ${getName(suggestion.profile_b_id)}`,
        message: 'Match presentation expiring soon',
        priority: 'medium',
        actionLabel: 'Record Response',
        actionHref: '/admin/matching/presentations',
      });
    }

    // Stuck > 7 days at verification_pending
    const stuckVerification = users.filter(
      (u) => u.payment_status === 'verification_pending' && daysSince(u.updated_at) > 7
    );
    for (const u of stuckVerification.slice(0, 5)) {
      alerts.push({
        id: `stuck-${u.id}`,
        userId: u.id,
        name: getName(u.id),
        message: 'Stuck in verification for too long',
        priority: 'low',
        actionLabel: 'View Profile',
        actionHref: `/admin/applicants/${u.id}`,
        daysStuck: daysSince(u.updated_at),
      });
    }

    // Sort: high > medium > low
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    alerts.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    // ================================================================
    // ROW 3 RIGHT: Distribution data
    // ================================================================

    // Location: group by current_state (normalize casing)
    const stateCounts = new Map<string, number>();
    for (const p of profiles) {
      if (p.current_state) {
        const normalized = p.current_state.trim().toLowerCase().replace(/\b\w/g, (c: string) => c.toUpperCase());
        stateCounts.set(normalized, (stateCounts.get(normalized) || 0) + 1);
      }
    }
    const locationData: DistributionEntry[] = [...stateCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([label, count]) => ({ label, count }));

    // Education: group by current_status
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

    // Age: bucket from DOB
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

    // ================================================================
    // ROW 4: Match Command Center
    // ================================================================

    // Build presentation lookup by suggestion ID
    const presentationBySuggestion = new Map(
      presentations.map((p) => [p.match_suggestion_id, p])
    );

    // Stage counts
    const stageCounts: MatchStageCounts = {
      pendingReview: suggestions.filter((s) => s.admin_status === 'pending_review').length,
      approvedReady: suggestions.filter((s) => s.admin_status === 'approved' && !presentationBySuggestion.has(s.id)).length,
      presentedPending: presentations.filter((p) => p.status === 'pending').length,
      mutualInterest: presentations.filter((p) => p.is_mutual_interest).length,
    };

    // Build unified match list
    const dashboardMatches: DashboardMatch[] = [];

    for (const s of suggestions) {
      if (s.admin_status === 'rejected' || s.admin_status === 'expired') continue;

      const pres = presentationBySuggestion.get(s.id);
      let currentStage: DashboardMatch['currentStage'];
      let daysInStage: number;
      let nextAction: string;

      if (pres) {
        if (pres.is_mutual_interest) {
          currentStage = 'mutual_interest';
          nextAction = 'Schedule Intro';
        } else {
          currentStage = 'presented';
          nextAction = 'Record Response';
        }
        daysInStage = daysSince(pres.updated_at || pres.presented_at);
      } else if (s.admin_status === 'approved') {
        currentStage = 'approved';
        nextAction = 'Present';
        daysInStage = daysSince(s.updated_at);
      } else {
        currentStage = 'pending_review';
        nextAction = 'Review';
        daysInStage = daysSince(s.updated_at);
      }

      const narrative = s.match_narrative || '';
      dashboardMatches.push({
        suggestionId: s.id,
        presentationId: pres?.id || null,
        personA: { id: s.profile_a_id, name: getName(s.profile_a_id), details: getDetails(s.profile_a_id) },
        personB: { id: s.profile_b_id, name: getName(s.profile_b_id), details: getDetails(s.profile_b_id) },
        compatibilityScore: s.overall_compatibility_score || 0,
        matchReason: narrative.length > 120 ? narrative.slice(0, 120) + '...' : narrative,
        fullNarrative: narrative,
        compatibilityReport: s.compatibility_report || null,
        currentStage,
        daysInStage,
        nextAction,
        adminNotes: s.admin_notes,
      });
    }

    // Sort by score descending by default
    dashboardMatches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    // ================================================================
    // ROW 5 LEFT: Activity feed with resolved names
    // ================================================================
    const activityFeed: DashboardActivityLog[] = activityLogs.map((log) => ({
      id: log.id,
      actorName: getName(log.actor_id),
      action: log.action,
      entityType: log.entity_type,
      entityId: log.entity_id,
      createdAt: log.created_at,
    }));

    // ================================================================
    // ROW 5 RIGHT: Recent communications with resolved names
    // ================================================================
    const recentComms: DashboardCommLog[] = commsLogs.map((c) => ({
      id: c.id,
      recipientName: getName(c.user_id),
      subject: c.subject || '',
      sentAt: c.sent_at,
      status: (c.status || 'sent') as DashboardCommLog['status'],
      channel: c.channel || 'email',
    }));

    // ================================================================
    // RENDER
    // ================================================================
    return (
      <div className="mx-auto max-w-[1600px] space-y-6">
        <h1 className="sr-only">Admin Dashboard</h1>
        {/* Row 1: Pipeline KPIs */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <div className="mt-4 grid grid-cols-5 gap-3">
            <MetricCard label="Waitlist" value={waitlistTotal} {...buildTrend(waitlistTotal, 'waitlist_total')} />
            <MetricCard label="Invited" value={waitlistInvited} {...buildTrend(waitlistInvited, 'waitlist_invited')} />
            <MetricCard label="Signed Up" value={signedUp} {...buildTrend(signedUp, 'signed_up')} />
            <MetricCard label="Form In Progress" value={formInProgress} {...buildTrend(formInProgress, 'form_in_progress')} />
            <MetricCard label="Form Complete" value={formComplete} {...buildTrend(formComplete, 'form_complete')} />
          </div>
          <div className="mt-3 grid grid-cols-5 gap-3">
            <MetricCard label="Payment Verified" value={paymentVerified} {...buildTrend(paymentVerified, 'payment_verified')} />
            <MetricCard label="BGV Complete" value={bgvComplete} {...buildTrend(bgvComplete, 'bgv_complete')} />
            <MetricCard label="In Pool" value={inPool} {...buildTrend(inPool, 'in_pool')} />
            <MetricCard label="Matches Active" value={matchesActive} {...buildTrend(matchesActive, 'matches_active')} />
            <MetricCard label="Active Members" value={activeMembers} {...buildTrend(activeMembers, 'active_members')} />
          </div>
        </div>

        {/* Row 2: Pipeline Funnel */}
        <PipelineFunnel data={funnelData} />

        {/* Row 3: Alerts (1/3) + Distribution (2/3) */}
        <div className="grid grid-cols-3 gap-6">
          <AlertsList alerts={alerts} />
          <div className="col-span-2">
            <DistributionTabs
              locationData={locationData}
              educationData={educationData}
              ageData={ageData}
              genderData={genderData}
            />
          </div>
        </div>

        {/* Row 4: Match Command Center */}
        <MatchCommandCenter
          initialMatches={dashboardMatches}
          stageCounts={stageCounts}
        />

        {/* Row 5: Activity (1/3) + Communications (2/3) */}
        <div className="grid grid-cols-3 gap-6">
          <ActivityFeed logs={activityFeed} />
          <div className="col-span-2">
            <RecentComms communications={recentComms} />
          </div>
        </div>
      </div>
    );
  } catch (err) {
    console.error('Dashboard load error:', err);
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8" role="alert">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to load data</h2>
        <p className="text-gray-500 mb-4">Something went wrong while loading this page.</p>
        <a href="" className="text-rose-600 hover:text-rose-700 font-medium">
          Refresh page
        </a>
      </div>
    );
  }
}
