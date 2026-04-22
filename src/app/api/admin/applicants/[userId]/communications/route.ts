import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, validateUserId } from '@/lib/admin/auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const result = await requireAdmin();
  if (result.error) return result.error;
  const { admin } = result;

  const { allowed } = checkRateLimit(`comms-read:${admin.id}`, 60, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests. Please try again in a moment.' }, { status: 429 });
  }

  const { userId } = await params;
  const idError = validateUserId(userId);
  if (idError) return idError;

  const adminSupabase = createAdminClient();

  const { data: logs, error } = await adminSupabase
    .from('communication_log' as never)
    .select('*')
    .eq('user_id', userId as never)
    .order('created_at' as never, { ascending: false });

  if (error) {
    console.error('Failed to fetch communication log:', error);
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
  }

  return NextResponse.json({ logs: logs || [] });
}
