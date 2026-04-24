import { NextResponse } from 'next/server';
import { timingSafeEqual, createHmac } from 'crypto';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { checkRateLimit } from '@/lib/rate-limit';

// GET /api/admin/snapshots — retrieve last N days of snapshots
export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single();
  if (!userData || (userData.role !== 'admin' && userData.role !== 'super_admin')) {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  }

  const url = new URL(request.url);
  const days = parseInt(url.searchParams.get('days') || '7', 10);

  const admin = createAdminClient();
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const { data, error } = await admin
    .from('daily_snapshots' as never)
    .select('*')
    .gte('snapshot_date', since as never)
    .order('snapshot_date' as never, { ascending: true });

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch snapshots' }, { status: 500 });
  }

  return NextResponse.json({ snapshots: data || [] });
}

// POST /api/admin/snapshots — capture today's snapshot (called by Vercel cron)
export async function POST(request: Request) {
  // Verify cron secret (timing-safe) or admin auth
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  let isCron = false;
  if (authHeader && cronSecret) {
    const key = 'samvaya-cron-verify';
    const a = createHmac('sha256', key).update(authHeader).digest();
    const b = createHmac('sha256', key).update(`Bearer ${cronSecret}`).digest();
    isCron = timingSafeEqual(a, b);
  }

  if (!isCron) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single();
    if (!userData || (userData.role !== 'admin' && userData.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Admin only' }, { status: 403 });
    }

    const { allowed } = await checkRateLimit(`snapshot:${user.id}`, 5, 60 * 60 * 1000);
    if (!allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const admin = createAdminClient();

  // Check if today's snapshot already exists
  const today = new Date().toISOString().split('T')[0];
  const { data: existing } = await admin
    .from('daily_snapshots' as never)
    .select('id')
    .eq('snapshot_date', today as never)
    .maybeSingle();

  // Gather all counts in parallel
  const [
    usersResult,
    waitlistResult,
    paymentsResult,
    presentationsResult,
  ] = await Promise.all([
    admin.from('users').select('id, role, membership_status, payment_status, is_bgv_complete').eq('role', 'applicant' as never),
    admin.from('waitlist').select('id, status'),
    admin.from('payments').select('id', { count: 'exact', head: true }).eq('verification_fee_paid', true as never),
    admin.from('match_presentations' as never).select('id', { count: 'exact', head: true }).eq('status', 'pending' as never),
  ]);

  const users = usersResult.data || [];
  const waitlist = waitlistResult.data || [];

  const snapshot = {
    snapshot_date: today,
    waitlist_total: waitlist.length,
    waitlist_invited: waitlist.filter((w) => w.status === 'invited').length,
    signed_up: users.length,
    form_in_progress: users.filter((u) => u.membership_status === 'onboarding_pending' || u.membership_status === 'onboarding_in_progress').length,
    form_complete: users.filter((u) => u.membership_status === 'onboarding_complete').length,
    payment_verified: paymentsResult.count ?? 0,
    bgv_complete: users.filter((u) => u.is_bgv_complete).length,
    in_pool: users.filter((u) => u.payment_status === 'in_pool').length,
    matches_active: presentationsResult.count ?? 0,
    active_members: users.filter((u) => u.payment_status === 'active_member').length,
  };

  if (existing) {
    // Update today's snapshot
    await admin.from('daily_snapshots' as never).update(snapshot as never).eq('id', (existing as { id: string }).id as never);
  } else {
    // Insert new snapshot
    await admin.from('daily_snapshots' as never).insert(snapshot as never);
  }

  return NextResponse.json({ success: true, snapshot });
}
