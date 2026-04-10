import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  const result = await requireAdmin();
  if (result.error) return result.error;
  const { admin } = result;

  const { allowed } = checkRateLimit(`analytics:${admin.id}`, 30, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests. Please try again in a moment.' }, { status: 429 });
  }

  const adminSupabase = createAdminClient();

  // Run all queries in parallel
  const [
    registeredResult,
    formCompleteResult,
    verificationPaidResult,
    bgvCompleteResult,
    inPoolResult,
    matchedResult,
    introducedResult,
    geoResult,
    specialtyResult,
    stageTimingResult,
  ] = await Promise.all([
    // Registered applicants
    adminSupabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'applicant' as never),

    // Form complete
    adminSupabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('membership_status', 'onboarding_complete' as never),

    // Verification paid (any status past unverified)
    adminSupabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'applicant' as never)
      .in('payment_status', [
        'verification_pending',
        'in_pool',
        'match_presented',
        'awaiting_payment',
        'active_member',
      ] as never),

    // BGV complete
    adminSupabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('is_bgv_complete', true as never),

    // In pool
    adminSupabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'applicant' as never)
      .in('payment_status', [
        'in_pool',
        'match_presented',
        'awaiting_payment',
        'active_member',
      ] as never),

    // Matched: presentations where both parties expressed mutual interest
    adminSupabase
      .from('match_presentations' as never)
      .select('id', { count: 'exact', head: true })
      .eq('is_mutual_interest', true as never),

    // Introduced: video introductions that are scheduled or completed
    adminSupabase
      .from('introductions' as never)
      .select('id', { count: 'exact', head: true })
      .in('status', ['scheduled', 'completed'] as never),

    // Geographic distribution via RPC
    adminSupabase.rpc('get_geographic_distribution' as never),

    // Specialty distribution via RPC
    adminSupabase.rpc('get_specialty_distribution' as never),

    // Stage timing: get relevant activity log entries
    adminSupabase
      .from('activity_log' as never)
      .select('action, entity_id, created_at' as never)
      .in('action' as never, [
        'marked_verification_paid',
        'marked_goocampus_verified',
        'moved_to_pool',
      ] as never)
      .order('created_at' as never, { ascending: true }),
  ]);

  // Build funnel data
  const funnel = [
    { stage: 'Registered', count: registeredResult.count ?? 0 },
    { stage: 'Form Complete', count: formCompleteResult.count ?? 0 },
    { stage: 'Verification Paid', count: verificationPaidResult.count ?? 0 },
    { stage: 'BGV Complete', count: bgvCompleteResult.count ?? 0 },
    { stage: 'In Pool', count: inPoolResult.count ?? 0 },
    { stage: 'Matched', count: matchedResult.count ?? 0 },
    { stage: 'Introduced', count: introducedResult.count ?? 0 },
  ];

  // Calculate conversion rates (capped at 100% — GooCampus members can skip stages)
  const conversions = [];
  for (let i = 1; i < funnel.length; i++) {
    const prev = funnel[i - 1].count;
    const curr = funnel[i].count;
    conversions.push({
      from: funnel[i - 1].stage,
      to: funnel[i].stage,
      rate: prev > 0 ? Math.min(100, Math.round((curr / prev) * 100)) : 0,
      fromCount: prev,
      toCount: curr,
    });
  }

  // Calculate average stage durations from activity log
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const timingLogs = (stageTimingResult.data || []) as any[];
  const userTimestamps: Record<string, Record<string, string>> = {};

  for (const log of timingLogs) {
    if (!userTimestamps[log.entity_id]) userTimestamps[log.entity_id] = {};
    userTimestamps[log.entity_id][log.action] = log.created_at;
  }

  // Get user creation dates for timing calculation
  const userIds = Object.keys(userTimestamps);
  let userCreationMap: Record<string, string> = {};
  if (userIds.length > 0) {
    const { data: users } = await adminSupabase
      .from('users')
      .select('id, created_at')
      .in('id', userIds);

    userCreationMap = Object.fromEntries(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (users || []).map((u: any) => [u.id, u.created_at])
    );
  }

  // Average time from registration to verification paid
  const verificationTimes: number[] = [];
  const poolTimes: number[] = [];

  for (const [userId, actions] of Object.entries(userTimestamps)) {
    const created = userCreationMap[userId];
    if (!created) continue;

    const createdTime = new Date(created).getTime();
    const paidAction = actions['marked_verification_paid'] || actions['marked_goocampus_verified'];
    if (paidAction) {
      verificationTimes.push(new Date(paidAction).getTime() - createdTime);
    }

    const poolAction = actions['moved_to_pool'] || actions['marked_goocampus_verified'];
    if (poolAction) {
      poolTimes.push(new Date(poolAction).getTime() - createdTime);
    }
  }

  const avgMs = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : null;
  const msToDays = (ms: number | null) => ms !== null ? Math.round(ms / (1000 * 60 * 60 * 24) * 10) / 10 : null;

  const stageTiming = [
    { stage: 'Registration → Verification Paid', avg_days: msToDays(avgMs(verificationTimes)), sample_size: verificationTimes.length },
    { stage: 'Registration → In Pool', avg_days: msToDays(avgMs(poolTimes)), sample_size: poolTimes.length },
  ];

  return NextResponse.json({
    funnel,
    conversions,
    geographic: geoResult.data || [],
    specialties: specialtyResult.data || [],
    stage_timing: stageTiming,
  });
}
