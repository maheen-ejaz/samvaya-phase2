import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  const result = await requireAdmin();
  if (result.error) return result.error;
  const { admin } = result;

  const { allowed } = await checkRateLimit(`activity:${admin.id}`, 60, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests. Please try again in a moment.' }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const actor = searchParams.get('actor');
  const entityType = searchParams.get('entity_type');
  const entityId = searchParams.get('entity_id');
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const perPage = Math.min(100, Math.max(1, parseInt(searchParams.get('per_page') || '50', 10)));
  const offset = (page - 1) * perPage;

  const adminSupabase = createAdminClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query: any = adminSupabase
    .from('activity_log' as never)
    .select('*', { count: 'exact' });

  if (action) query = query.eq('action', action);
  if (actor) query = query.eq('actor_id', actor);
  if (entityType) query = query.eq('entity_type', entityType);
  if (entityId) query = query.eq('entity_id', entityId);
  if (from) query = query.gte('created_at', from);
  if (to) query = query.lte('created_at', `${to}T23:59:59.999Z`);

  query = query.order('created_at', { ascending: false }).range(offset, offset + perPage - 1);

  const { data: logs, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch activity log' }, { status: 500 });
  }

  // Resolve actor names
  const actorIds = [...new Set((logs || []).map((l: Record<string, string>) => l.actor_id))];
  let actorMap: Record<string, string> = {};

  if (actorIds.length > 0) {
    const { data: profiles } = await adminSupabase
      .from('profiles')
      .select('user_id, first_name, last_name')
      .in('user_id', actorIds as string[]);

    actorMap = Object.fromEntries(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (profiles || []).map((p: any) => [
        p.user_id,
        `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Admin',
      ])
    );
  }

  const enrichedLogs = (logs || []).map((log: Record<string, unknown>) => ({
    ...log,
    actor_name: actorMap[log.actor_id as string] || 'Unknown',
  }));

  // Fetch distinct actions for filter dropdown
  const { data: allActions } = await adminSupabase
    .from('activity_log' as never)
    .select('action' as never);

  const uniqueActions = [...new Set((allActions || []).map((d: Record<string, string>) => d.action))].sort();

  return NextResponse.json({
    logs: enrichedLogs,
    total: count ?? 0,
    page,
    per_page: perPage,
    actions: uniqueActions,
  });
}
