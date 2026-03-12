import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Log an admin action to the activity_log table.
 */
export async function logActivity(
  actorId: string,
  action: string,
  entityType: string,
  entityId: string,
  metadata?: Record<string, unknown>
): Promise<void> {
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
      console.error('Failed to log activity:', error);
    }
  } catch (err) {
    console.error('Activity logger initialization failed:', err);
    // Don't throw — activity logging should not break the primary action
  }
}
