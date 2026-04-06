import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { PipelineStrip } from '@/components/admin/dashboard/PipelineStrip';
import { TaskPanel } from '@/components/admin/dashboard/TaskPanel';
import { MatchCommandCenter } from '@/components/admin/dashboard/MatchCommandCenter';
import { ActivityFeed } from '@/components/admin/dashboard/ActivityFeed';
import { RecentComms } from '@/components/admin/dashboard/RecentComms';
import { calculateAge, capitalize, daysSince } from '@/lib/utils';
import { syncAutoTasks } from '@/lib/admin/sync-tasks';
import type { DashboardAlert, DashboardMatch, DashboardActivityLog, DashboardCommLog, MatchStageCounts, PipelineStripStage, AdminTask } from '@/types/dashboard';

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
    // Consolidated data fetching — 11 parallel queries
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
      tasksResult,
    ] = await Promise.all([
      // A: All applicant users
      adminSupabase
        .from('users')
        .select('id, membership_status, payment_status, is_bgv_complete, bgv_flagged, bgv_consent, is_goocampus_member, onboarding_section, updated_at')
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

      // K: Admin tasks
      adminSupabase
        .from('admin_tasks' as never)
        .select('*')
        .order('created_at' as never, { ascending: false }),
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
    const tasksData = (tasksResult.data || []) as Array<{
      id: string; task_type: string; title: string; entity_type: string | null; entity_id: string | null;
      status: string; due_date: string | null; notes: string | null; action_href: string | null;
      created_at: string; resolved_at: string | null; is_auto_generated: boolean;
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

    // Extract trend for pipeline strip (drop sparkline + label)
    function extractTrend(t: ReturnType<typeof buildTrend>): { trend?: { direction: 'up' | 'down' | 'flat'; percentage: number } } {
      if (!t.trend) return {};
      return { trend: { direction: t.trend.direction, percentage: t.trend.percentage } };
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
      if (p?.gender) parts.push(capitalize(p.gender));
      if (m?.current_status) {
        const spec = Array.isArray(m.specialty) ? m.specialty[0] : null;
        if (spec) parts.push(capitalize(String(spec)));
      }
      if (p?.current_city) parts.push(capitalize(p.current_city));
      if (p?.current_state && !p.current_city) parts.push(capitalize(p.current_state));
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
    // ROW 1: Unified Pipeline Strip (replaces old KPI cards + funnel)
    // ================================================================
    const pipelineStages: PipelineStripStage[] = [
      { stage: 'Waitlist', key: 'waitlist', count: waitlistTotal, conversionPct: null, href: '/admin/applicants?stage=waitlist', ...extractTrend(buildTrend(waitlistTotal, 'waitlist_total')) },
      { stage: 'Invited', key: 'invited', count: waitlistInvited, conversionPct: waitlistTotal > 0 ? Math.round((waitlistInvited / waitlistTotal) * 100) : null, href: '/admin/applicants?stage=invited', ...extractTrend(buildTrend(waitlistInvited, 'waitlist_invited')) },
      { stage: 'Signed Up', key: 'signed_up', count: signedUp, conversionPct: null, href: '/admin/applicants?stage=signed_up', ...extractTrend(buildTrend(signedUp, 'signed_up')) },
      { stage: 'Form In Progress', key: 'form_in_progress', count: formInProgress, conversionPct: null, href: '/admin/applicants?stage=form_in_progress', ...extractTrend(buildTrend(formInProgress, 'form_in_progress')) },
      { stage: 'Form Complete', key: 'form_complete', count: formComplete, conversionPct: signedUp > 0 ? Math.round((formComplete / signedUp) * 100) : null, href: '/admin/applicants?stage=form_complete', ...extractTrend(buildTrend(formComplete, 'form_complete')) },
      { stage: 'Payment Verified', key: 'payment_verified', count: paymentVerified, conversionPct: formComplete > 0 ? Math.round((paymentVerified / formComplete) * 100) : null, href: '/admin/applicants?stage=payment_verified', ...extractTrend(buildTrend(paymentVerified, 'payment_verified')) },
      { stage: 'BGV Complete', key: 'bgv_complete', count: bgvComplete, conversionPct: paymentVerified > 0 ? Math.round((bgvComplete / paymentVerified) * 100) : null, href: '/admin/applicants?stage=bgv_complete', ...extractTrend(buildTrend(bgvComplete, 'bgv_complete')) },
      { stage: 'In Pool', key: 'in_pool', count: inPool, conversionPct: bgvComplete > 0 ? Math.round((inPool / bgvComplete) * 100) : null, href: '/admin/applicants?stage=in_pool', ...extractTrend(buildTrend(inPool, 'in_pool')) },
      { stage: 'Matches Active', key: 'matches_active', count: matchesActive, conversionPct: inPool > 0 ? Math.round((matchesActive / inPool) * 100) : null, href: '/admin/matching/presentations', ...extractTrend(buildTrend(matchesActive, 'matches_active')) },
      { stage: 'Active Members', key: 'active_members', count: activeMembers, conversionPct: null, href: '/admin/applicants?stage=active_member', ...extractTrend(buildTrend(activeMembers, 'active_members')) },
    ];

    // ================================================================
    // ROW 2: Alerts & Action Items (enriched)
    // ================================================================
    const alerts: DashboardAlert[] = [];

    // Helper: build profile context fields for an alert
    function alertContext(userId: string) {
      const p = profileMap.get(userId);
      const m = medicalMap.get(userId);
      return {
        age: p?.date_of_birth ? calculateAge(p.date_of_birth) ?? undefined : undefined,
        gender: p?.gender ? capitalize(p.gender) : undefined,
        specialty: m?.specialty ? capitalize(Array.isArray(m.specialty) ? String(m.specialty[0]) : String(m.specialty)) : undefined,
        city: p?.current_city ? capitalize(p.current_city) : p?.current_state ? capitalize(p.current_state) : undefined,
      };
    }

    // 1. Unverified applicants who completed the form (HIGH)
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
        alertType: 'payment',
        actionLabel: isGooCampus ? 'Verify GooCampus' : 'Mark Fee Paid',
        actionEndpoint: `/api/admin/applicants/${u.id}/status`,
        actionPayload: { action: isGooCampus ? 'mark_goocampus_verified' : 'mark_verification_paid' },
        daysStuck: daysSince(u.updated_at),
        secondaryActionLabel: 'View Profile',
        secondaryActionHref: `/admin/applicants/${u.id}`,
        ...alertContext(u.id),
      });
    }

    // 2. BGV flagged (HIGH)
    const flagged = users.filter((u) => u.bgv_flagged);
    for (const u of flagged.slice(0, 5)) {
      alerts.push({
        id: `bgv-flagged-${u.id}`,
        userId: u.id,
        name: getName(u.id),
        message: 'BGV check flagged — requires review',
        priority: 'high',
        alertType: 'bgv',
        actionLabel: 'View BGV',
        actionHref: `/admin/verification/${u.id}`,
        daysStuck: daysSince(u.updated_at),
        ...alertContext(u.id),
      });
    }

    // 3. Presentations expiring within 48 hours (MEDIUM)
    const expiringSoon = presentations.filter((p) => {
      if (p.status !== 'pending' || !p.expires_at) return false;
      const hoursLeft = (new Date(p.expires_at).getTime() - Date.now()) / (60 * 60 * 1000);
      return hoursLeft > 0 && hoursLeft <= 48;
    });
    for (const p of expiringSoon.slice(0, 5)) {
      const suggestion = suggestions.find((s) => s.id === p.match_suggestion_id);
      if (!suggestion) continue;
      const hoursLeft = Math.round((new Date(p.expires_at).getTime() - Date.now()) / (60 * 60 * 1000));
      // Determine who hasn't responded
      const waitingParts: string[] = [];
      if (p.member_a_response === 'pending') waitingParts.push(getName(suggestion.profile_a_id));
      if (p.member_b_response === 'pending') waitingParts.push(getName(suggestion.profile_b_id));
      alerts.push({
        id: `expiring-${p.id}`,
        userId: suggestion.profile_a_id,
        name: `${getName(suggestion.profile_a_id)} & ${getName(suggestion.profile_b_id)}`,
        message: `Match expiring in ${hoursLeft}h`,
        priority: 'medium',
        alertType: 'match',
        actionLabel: 'Record Response',
        actionHref: '/admin/matching/presentations',
        hoursRemaining: hoursLeft,
        waitingOn: waitingParts.length > 0 ? waitingParts.join(', ') : undefined,
        compatibilityScore: suggestion.overall_compatibility_score || undefined,
      });
    }

    // 4. Pending match reviews (MEDIUM)
    const pendingReviews = suggestions.filter((s) => s.admin_status === 'pending_review');
    for (const s of pendingReviews.slice(0, 5)) {
      alerts.push({
        id: `review-${s.id}`,
        userId: s.profile_a_id,
        name: `${getName(s.profile_a_id)} & ${getName(s.profile_b_id)}`,
        message: `New match suggestion — ${s.overall_compatibility_score || 0}% compatible`,
        priority: 'medium',
        alertType: 'match',
        actionLabel: 'Review Match',
        actionHref: '/admin/matching',
        compatibilityScore: s.overall_compatibility_score || undefined,
      });
    }

    // 5. Stuck > 7 days at verification_pending (LOW)
    const stuckVerification = users.filter(
      (u) => u.payment_status === 'verification_pending' && daysSince(u.updated_at) > 7
    );
    for (const u of stuckVerification.slice(0, 5)) {
      // Determine what's blocking
      let blockReason = 'Verification processing';
      if (!u.bgv_consent || u.bgv_consent === 'not_given') blockReason = 'BGV consent not given';
      else if (!u.is_bgv_complete) blockReason = 'BGV in progress';

      const firstName = profileMap.get(u.id)?.first_name || getName(u.id);
      alerts.push({
        id: `stuck-${u.id}`,
        userId: u.id,
        name: getName(u.id),
        message: `Stuck in verification — ${blockReason}`,
        priority: 'low',
        alertType: 'verification',
        actionLabel: 'Send Reminder',
        actionHref: undefined,
        actionEndpoint: undefined,
        daysStuck: daysSince(u.updated_at),
        secondaryActionLabel: 'View Profile',
        secondaryActionHref: `/admin/applicants/${u.id}`,
        nudgeEmailTo: u.id,
        nudgeEmailSubject: `Update on your Samvaya application`,
        nudgeEmailBody: `Hi ${firstName},\n\nWe noticed your verification has been pending for a while. If you need any help or have questions about the process, please don't hesitate to reach out.\n\nWarm regards,\nSamvaya Matrimony Team`,
        ...alertContext(u.id),
      });
    }

    // 6. Stalled forms — in progress > 7 days (LOW)
    const stalledForms = users.filter(
      (u) => (u.membership_status === 'onboarding_pending' || u.membership_status === 'onboarding_in_progress') && daysSince(u.updated_at) > 7
    );
    for (const u of stalledForms.slice(0, 5)) {
      const section = u.onboarding_section || 'A';
      const firstName = profileMap.get(u.id)?.first_name || getName(u.id);
      alerts.push({
        id: `stalled-${u.id}`,
        userId: u.id,
        name: getName(u.id),
        message: `Form stalled at Section ${section}`,
        priority: 'low',
        alertType: 'stalled',
        actionLabel: 'Send Nudge',
        actionEndpoint: undefined,
        daysStuck: daysSince(u.updated_at),
        secondaryActionLabel: 'View Profile',
        secondaryActionHref: `/admin/applicants/${u.id}`,
        nudgeEmailTo: u.id,
        nudgeEmailSubject: `Complete your Samvaya application`,
        nudgeEmailBody: `Hi ${firstName},\n\nWe noticed you started your Samvaya application but haven't completed it yet. Your spot is reserved — pick up where you left off whenever you're ready.\n\nWarm regards,\nSamvaya Matrimony Team`,
        ...alertContext(u.id),
      });
    }

    // Sort: high > medium > low
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    alerts.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    // Fetch photos for alert users (batch)
    const alertUserIds = new Set(alerts.map((a) => a.userId));
    const alertPhotoMap = new Map<string, string>();
    if (alertUserIds.size > 0) {
      const { data: alertPhotos } = await adminSupabase
        .from('photos')
        .select('user_id, storage_path')
        .eq('is_primary', true as never)
        .in('user_id', Array.from(alertUserIds) as never);
      if (alertPhotos && alertPhotos.length > 0) {
        const paths = alertPhotos.map((p) => (p as { user_id: string; storage_path: string }).storage_path);
        const { data: signedData } = await adminSupabase.storage
          .from('photos')
          .createSignedUrls(paths, 3600);
        if (signedData) {
          for (let i = 0; i < alertPhotos.length; i++) {
            const photo = alertPhotos[i] as { user_id: string; storage_path: string };
            const signed = signedData[i];
            if (signed?.signedUrl) {
              alertPhotoMap.set(photo.user_id, signed.signedUrl);
            }
          }
        }
      }
    }
    // Attach photos to alerts
    for (const alert of alerts) {
      const photoUrl = alertPhotoMap.get(alert.userId);
      if (photoUrl) alert.photoUrl = photoUrl;
    }

    // ================================================================
    // Sync auto-generated tasks from alerts (fire-and-forget)
    // ================================================================
    syncAutoTasks(alerts).catch((err) => {
      console.error('[syncAutoTasks] Failed to sync:', err);
    });

    // Convert tasks to AdminTask interface
    const tasks: AdminTask[] = tasksData.map((row) => ({
      id: row.id,
      taskType: row.task_type,
      title: row.title,
      entityType: row.entity_type,
      entityId: row.entity_id,
      status: row.status as 'needs_action' | 'in_progress' | 'done',
      dueDate: row.due_date,
      notes: row.notes,
      actionHref: row.action_href,
      createdAt: row.created_at,
      resolvedAt: row.resolved_at,
      isAutoGenerated: row.is_auto_generated,
    }));

    // ================================================================
    // Match Command Center
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

    // Fetch primary photos for all matched users (batch query + batch sign)
    const matchUserIds = new Set<string>();
    for (const s of suggestions) {
      if (s.admin_status === 'rejected' || s.admin_status === 'expired') continue;
      matchUserIds.add(s.profile_a_id);
      matchUserIds.add(s.profile_b_id);
    }
    const photoUrlMap = new Map<string, string>();
    if (matchUserIds.size > 0) {
      const { data: matchPhotos } = await adminSupabase
        .from('photos')
        .select('user_id, storage_path')
        .eq('is_primary', true as never)
        .in('user_id', Array.from(matchUserIds) as never);
      if (matchPhotos && matchPhotos.length > 0) {
        const paths = matchPhotos.map((p) => (p as { user_id: string; storage_path: string }).storage_path);
        const { data: signedData } = await adminSupabase.storage
          .from('photos')
          .createSignedUrls(paths, 3600);
        if (signedData) {
          for (let i = 0; i < matchPhotos.length; i++) {
            const photo = matchPhotos[i] as { user_id: string; storage_path: string };
            const signed = signedData[i];
            if (signed?.signedUrl) {
              photoUrlMap.set(photo.user_id, signed.signedUrl);
            }
          }
        }
      }
    }

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
        personA: { id: s.profile_a_id, name: getName(s.profile_a_id), details: getDetails(s.profile_a_id), primaryPhotoUrl: photoUrlMap.get(s.profile_a_id), gender: profileMap.get(s.profile_a_id)?.gender || undefined },
        personB: { id: s.profile_b_id, name: getName(s.profile_b_id), details: getDetails(s.profile_b_id), primaryPhotoUrl: photoUrlMap.get(s.profile_b_id), gender: profileMap.get(s.profile_b_id)?.gender || undefined },
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
      userId: c.user_id,
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
      <div className="space-y-6">
        <h1 className="sr-only">Admin Dashboard</h1>

        {/* Page header */}
        <div className="flex items-end justify-between">
          <div>
            <h2 className="type-heading-xl text-gray-900">Dashboard</h2>
            <p className="mt-1 text-sm text-gray-500">Overview of your applicant pipeline and matches</p>
          </div>
        </div>

        {/* Row 1: Unified Pipeline Strip */}
        <PipelineStrip stages={pipelineStages} />

        {/* Row 2: Tasks (2/3) + Activity Feed (1/3) */}
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <TaskPanel initialTasks={tasks} />
          </div>
          <div className="col-span-1">
            <ActivityFeed logs={activityFeed} />
          </div>
        </div>

        {/* Row 3: Match Command Center */}
        <MatchCommandCenter
          initialMatches={dashboardMatches}
          stageCounts={stageCounts}
        />

        {/* Row 4: Recent Communications */}
        <RecentComms communications={recentComms} />
      </div>
    );
  } catch (err) {
    console.error('Dashboard load error:', err);
    throw err;
  }
}
