import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Log an admin action to the activity_log table.
 * Returns true on success, false on failure. Sensitive callers (status,
 * respond, bgv) should check the return value and 500 on false — audit-trail
 * integrity is a hard requirement for admin mutations.
 */
export async function logActivity(
  actorId: string,
  action: string,
  entityType: string,
  entityId: string,
  metadata?: Record<string, unknown>
): Promise<boolean> {
  try {
    const adminSupabase = createAdminClient();

    const { error } = await adminSupabase.from('activity_log' as never).insert({
      actor_id: actorId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      metadata: metadata ?? {},
    } as never);

    if (error) {
      console.error('Failed to log activity:', { action, entityType, entityId, error });
      return false;
    }
    return true;
  } catch (err) {
    console.error('Activity logger initialization failed:', { action, entityType, entityId, err });
    return false;
  }
}
