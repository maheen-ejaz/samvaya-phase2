/**
 * Preference-aware notification email sender.
 * Checks the user's notification_preferences before sending.
 * Fire-and-forget — never throws, never blocks the caller.
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from './client';

type NotificationType = 'new_match' | 'match_response' | 'status_update';

const PREF_COLUMN_MAP: Record<NotificationType, string> = {
  new_match: 'email_new_match',
  match_response: 'email_match_response',
  status_update: 'email_status_update',
};

/**
 * Send a notification email if the user's preferences allow it.
 *
 * @param userId - The user to notify
 * @param type - Notification type (maps to a preference toggle)
 * @param templateFn - Function returning { subject, html } for the email
 */
export async function sendNotificationEmail(
  userId: string,
  type: NotificationType,
  templateFn: () => { subject: string; html: string }
): Promise<void> {
  try {
    const supabase = createAdminClient();

    // Check user's notification preferences
    const prefColumn = PREF_COLUMN_MAP[type];
    const { data: prefs } = await supabase
      .from('notification_preferences' as never)
      .select(prefColumn)
      .eq('user_id', userId)
      .single();

    // If prefs exist and the specific toggle is off, skip
    if (prefs && (prefs as Record<string, boolean>)[prefColumn] === false) {
      return;
    }

    // Fetch user email from auth
    const { data: authData, error: authError } = await supabase.auth.admin.getUserById(userId);
    if (authError || !authData?.user?.email) {
      console.error(`[notifications] Could not fetch email for user ${userId}:`, authError?.message);
      return;
    }

    const { subject, html } = templateFn();
    await sendEmail(authData.user.email, subject, html);
  } catch (err) {
    // Never throw — notification failures must not break the calling flow
    console.error(`[notifications] Failed to send ${type} email to user ${userId}:`, err);
  }
}
