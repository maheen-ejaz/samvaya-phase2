import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  const result = await requireAdmin();
  if (result.error) return result.error;

  try {
    const supabase = createAdminClient();

    const [activeResult, pausedResult, notVerifiedResult] = await Promise.all([
      supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .eq('is_bgv_complete', true)
        .in('payment_status', ['in_pool', 'match_presented'])
        .eq('is_paused', false),
      supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .eq('is_bgv_complete', true)
        .eq('is_paused', true),
      supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .eq('is_bgv_complete', false)
        .eq('role', 'applicant'),
    ]);

    if (activeResult.error) {
      throw new Error(`Failed to count active pool: ${activeResult.error.message}`);
    }

    return NextResponse.json({
      active_pool: activeResult.count ?? 0,
      paused: pausedResult.count ?? 0,
      not_verified: notVerifiedResult.count ?? 0,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Pool health check error:', message);
    return NextResponse.json(
      { error: `Pool health check failed: ${message}` },
      { status: 500 }
    );
  }
}
