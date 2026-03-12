import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, validateUserId } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const result = await requireAdmin();
  if (result.error) return result.error;

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
