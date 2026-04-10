import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import type { DashboardAlert } from '@/types/dashboard';

/**
 * Sync dashboard alerts to admin_tasks rows.
 * Uses ignoreDuplicates: true so manual status changes are never overwritten.
 */
export async function syncAutoTasks(alerts: DashboardAlert[]): Promise<void> {
  try {
    const supabase = createAdminClient();

    const tasksToUpsert = alerts.map((alert) => {
      let taskType = 'manual';
      let taskCategory = 'manual';
      let entityId: string | null = null;

      switch (alert.alertType) {
        case 'payment':
          taskType = 'confirm_payment';
          taskCategory = 'payment';
          entityId = alert.userId;
          break;
        case 'bgv':
          taskType = 'review_bgv';
          taskCategory = 'review';
          entityId = alert.userId;
          break;
        case 'match':
          taskType = 'review_match';
          taskCategory = 'review';
          entityId = alert.id;
          break;
        case 'verification':
          taskType = 'followup_verification';
          taskCategory = 'call';
          entityId = alert.userId;
          break;
        case 'stalled':
          taskType = 'followup_stalled';
          taskCategory = 'call';
          entityId = alert.userId;
          break;
      }

      return {
        task_type: taskType,
        task_category: taskCategory,
        priority: alert.priority === 'high' ? 'high' : 'normal',
        title: alert.message.split(' — ')[0],
        entity_type: entityId === alert.userId ? 'user' : 'match_suggestion',
        entity_id: entityId,
        status: 'open',
        due_date: null,
        notes: alert.message,
        action_href: alert.actionHref || null,
        applicant_name: alert.name || null,
        applicant_phone: null, // phone not available from alerts — populated at creation time
        applicant_email: alert.nudgeEmailTo || null,
        is_auto_generated: true,
      };
    });

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
  } catch (err) {
    console.error('[syncAutoTasks] Unexpected error:', err);
  }
}

/**
 * Create an auto-task for a new waitlist signup.
 * Called from the waitlist POST route.
 */
export async function createWaitlistCallTask(params: {
  name: string;
  phone: string | null;
  email: string | null;
  waitlistId: string;
}): Promise<void> {
  try {
    const supabase = createAdminClient();

    await supabase.from('admin_tasks' as never).insert({
      task_type: 'waitlist_call',
      task_category: 'call',
      priority: 'high',
      title: `Call ${params.name} — explain Samvaya & onboarding`,
      entity_type: 'waitlist',
      entity_id: params.waitlistId,
      status: 'open',
      notes: `New waitlist signup. Explain the platform, the ₹7,080 verification fee, and the onboarding process.`,
      action_href: '/admin/applicants',
      applicant_name: params.name,
      applicant_phone: params.phone,
      applicant_email: params.email,
      is_auto_generated: true,
    } as never);
  } catch (err) {
    console.error('[createWaitlistCallTask] Error:', err);
  }
}

/**
 * Create an auto-task when payment is confirmed for an applicant.
 * Called from the payment confirmation route.
 */
export async function createBgvInitiateTask(params: {
  userId: string;
  name: string;
  phone: string | null;
  email: string | null;
}): Promise<void> {
  try {
    const supabase = createAdminClient();

    await supabase.from('admin_tasks' as never).upsert(
      {
        task_type: 'initiate_bgv',
        task_category: 'bgv',
        priority: 'high',
        title: `Initiate BGV checks for ${params.name}`,
        entity_type: 'user',
        entity_id: params.userId,
        status: 'open',
        notes: `Payment confirmed. Start OnGrid background verification (13 checks).`,
        action_href: `/admin/verification/${params.userId}`,
        applicant_name: params.name,
        applicant_phone: params.phone,
        applicant_email: params.email,
        is_auto_generated: true,
      } as never,
      { onConflict: 'task_type,entity_id', ignoreDuplicates: true }
    );
  } catch (err) {
    console.error('[createBgvInitiateTask] Error:', err);
  }
}
