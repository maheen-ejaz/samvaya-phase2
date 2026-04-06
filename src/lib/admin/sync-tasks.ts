import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { DashboardAlert } from '@/types/dashboard';

export async function syncAutoTasks(alerts: DashboardAlert[]): Promise<void> {
  try {
    const supabase = await createClient();

    // Map alerts to auto-task rows
    const tasksToUpsert = alerts.map((alert) => {
      let taskType = 'manual';
      let entityId: string | null = null;

      switch (alert.alertType) {
        case 'payment':
          taskType = 'confirm_payment';
          entityId = alert.userId;
          break;
        case 'bgv':
          taskType = 'review_bgv';
          entityId = alert.userId;
          break;
        case 'match':
          taskType = 'review_match';
          entityId = alert.id; // match_suggestion_id
          break;
        case 'verification':
          taskType = 'followup_verification';
          entityId = alert.userId;
          break;
        case 'stalled':
          taskType = 'followup_stalled';
          entityId = alert.userId;
          break;
      }

      return {
        task_type: taskType,
        title: alert.message.split(' — ')[0], // Use first part of message as title
        entity_type: entityId === alert.userId ? 'user' : 'match_suggestion',
        entity_id: entityId,
        status: 'needs_action',
        due_date: null,
        notes: alert.message,
        action_href: alert.actionHref || null,
        is_auto_generated: true,
      };
    });

    // Upsert tasks — ON CONFLICT DO NOTHING to preserve manual status changes
    if (tasksToUpsert.length > 0) {
      const result = await supabase.from('admin_tasks' as never).upsert(tasksToUpsert as never, {
        onConflict: 'task_type,entity_id',
        ignoreDuplicates: true,
      });

      const { error } = result as any;
      if (error) {
        console.error('[syncAutoTasks] Upsert error:', error);
      }
    }

    // Mark auto-tasks as 'done' when their alert condition has cleared
    // For now, skip this logic to avoid complex filtering
    // In production, would query existing auto-tasks and mark cleared ones as done
  } catch (err) {
    console.error('[syncAutoTasks] Unexpected error:', err);
    // Don't crash the dashboard if sync fails
  }
}
