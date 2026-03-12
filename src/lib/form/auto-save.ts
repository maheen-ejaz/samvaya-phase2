import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import type { FormState, QuestionConfig } from './types';
import { getQuestion } from './questions';
import { getSectionForQuestion } from './sections';

type SaveStatus = FormState['saveStatus'];

/**
 * Auto-save engine that batches field changes per table
 * and flushes them with a debounced upsert.
 */
export class AutoSaveEngine {
  private dirtyFields: Map<string, Record<string, unknown>> = new Map();
  private timer: ReturnType<typeof setTimeout> | null = null;
  private inFlight = false;
  private pendingFlush = false;
  private supabase: SupabaseClient<Database>;
  private userId: string;
  private debounceMs: number;
  private onStatusChange: (status: SaveStatus, error?: string) => void;
  private gateAnswers: Record<string, string> = {};
  private retryCount = 0;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAYS = [1000, 2000, 4000]; // exponential backoff
  private static readonly ALLOWED_TABLES = new Set([
    'users', 'profiles', 'medical_credentials', 'partner_preferences',
    'photos', 'documents', 'payments', 'compatibility_profiles', 'auth_users',
  ]);

  constructor(
    supabase: SupabaseClient<Database>,
    userId: string,
    onStatusChange: (status: SaveStatus, error?: string) => void,
    debounceMs = 500,
    initialGateAnswers: Record<string, string> = {}
  ) {
    this.supabase = supabase;
    this.userId = userId;
    this.onStatusChange = onStatusChange;
    this.debounceMs = debounceMs;
    this.gateAnswers = { ...initialGateAnswers };
  }

  /**
   * Mark a question's value as dirty (needs saving).
   * Looks up the target table/column from the question registry.
   */
  markDirty(questionId: string, value: unknown): void {
    const config = getQuestion(questionId);
    if (!config) return;

    // Skip types that handle their own saving
    if (config.type === 'file_upload' || config.type === 'claude_chat') return;

    // Gate questions (targetTable = 'local') are persisted in users.gate_answers JSONB
    if (config.targetTable === 'local') {
      if (value === null || value === undefined) {
        // Clear gate answer when dependent field clearing removes it
        const updated = { ...this.gateAnswers };
        delete updated[questionId];
        this.gateAnswers = updated;
      } else {
        this.gateAnswers = { ...this.gateAnswers, [questionId]: String(value) };
      }
      const existing = this.dirtyFields.get('users') || {};
      existing['gate_answers'] = this.gateAnswers;
      this.dirtyFields.set('users', existing);
      this.resetTimer();
      return;
    }

    const table = config.targetTable;
    const existing = this.dirtyFields.get(table) || {};

    if (config.type === 'range' && config.targetColumn2 && Array.isArray(value)) {
      // Range inputs produce [min, max]
      existing[config.targetColumn] = value[0];
      existing[config.targetColumn2] = value[1];
    } else if (config.type === 'dual_location' && config.targetColumn2 && config.targetColumn3) {
      // Dual location inputs produce {states, countries, noPreference}
      const loc = value as { states?: string[]; countries?: string[]; noPreference?: boolean } | null;
      existing[config.targetColumn] = loc?.states ?? [];
      existing[config.targetColumn2] = loc?.countries ?? [];
      existing[config.targetColumn3] = loc?.noPreference ?? false;
    } else {
      // Convert string booleans to actual booleans for DB columns
      existing[config.targetColumn] = this.coerceValue(value, config);
    }

    // Q62: derive current_designation and total_experience_months from work_experience
    if (questionId === 'Q62' && Array.isArray(value)) {
      const entries = value as Array<{
        designation?: string;
        start_month?: number;
        start_year?: number;
        end_month?: number;
        end_year?: number;
        is_current?: boolean;
      }>;

      // Extract designation from most recent is_current entry
      const currentEntry = entries.find((e) => e.is_current);
      existing['current_designation'] = currentEntry?.designation || null;

      // Calculate total experience in months across all entries
      const now = new Date();
      let totalMonths = 0;
      for (const entry of entries) {
        if (!entry.start_year || !entry.start_month) continue;
        const startMonths = entry.start_year * 12 + entry.start_month;
        let endMonths: number;
        if (entry.is_current) {
          endMonths = now.getFullYear() * 12 + (now.getMonth() + 1);
        } else if (entry.end_year && entry.end_month) {
          endMonths = entry.end_year * 12 + entry.end_month;
        } else {
          continue; // incomplete entry, skip
        }
        totalMonths += Math.max(0, endMonths - startMonths);
      }
      existing['total_experience_months'] = totalMonths;
    }

    this.dirtyFields.set(table, existing);
    this.resetTimer();
  }

  /**
   * Update the user's onboarding position (section + question number).
   * Called on navigation, debounced with the same timer.
   */
  markPosition(currentQuestionId: string): void {
    const config = getQuestion(currentQuestionId);
    if (!config) return;

    const section = getSectionForQuestion(config.questionNumber);
    const sectionNumber = section
      ? 'ABCDEFGHIJKLM'.indexOf(section.id) + 1
      : 1;

    const existing = this.dirtyFields.get('users') || {};
    existing['onboarding_section'] = sectionNumber;
    existing['onboarding_last_question'] = config.questionNumber;
    this.dirtyFields.set('users', existing);
    this.resetTimer();
  }

  /**
   * Force an immediate flush of all dirty fields.
   * Useful when the user navigates away or submits the form.
   */
  async flushNow(): Promise<void> {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    await this.flush();
  }

  /**
   * Clean up timers on unmount.
   */
  destroy(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
  }

  private resetTimer(): void {
    if (this.timer) clearTimeout(this.timer);
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
      this.retryCount = 0;
    }
    this.timer = setTimeout(() => this.flush(), this.debounceMs);
  }

  private async flush(): Promise<void> {
    if (this.dirtyFields.size === 0) return;

    // If a save is already in flight, queue another flush
    if (this.inFlight) {
      this.pendingFlush = true;
      return;
    }

    this.inFlight = true;
    this.onStatusChange('saving');

    // Snapshot and clear dirty fields
    const snapshot = new Map(this.dirtyFields);
    this.dirtyFields.clear();

    try {
      const tableEntries: Array<[string, Record<string, unknown>]> = [];
      const promises: Promise<unknown>[] = [];

      for (const [table, fields] of snapshot) {
        if (!AutoSaveEngine.ALLOWED_TABLES.has(table)) {
          console.error(`[auto-save] Blocked save to unknown table: ${table}`);
          continue;
        }
        tableEntries.push([table, fields]);

        if (table === 'auth_users') {
          // Special case: update auth.users (e.g., phone number)
          promises.push(this.supabase.auth.updateUser(fields as { phone?: string }));
        } else if (table === 'users') {
          // Users table PK is `id` (not user_id), and the row already exists
          // (created by handle_new_user trigger). Use update instead of upsert
          // because applicants don't have INSERT RLS permission on users.
          const updatePromise = async () => {
            const result = await this.supabase
              .from('users')
              .update(fields as never)
              .eq('id', this.userId);
            if (result.error) throw result.error;
            return result;
          };
          promises.push(updatePromise());
        } else {
          // Standard upsert with user_id as conflict key
          const upsertPromise = async () => {
            const result = await this.supabase
              .from(table as keyof Database['public']['Tables'])
              .upsert(
                { user_id: this.userId, ...fields } as never,
                { onConflict: 'user_id' }
              );
            if (result.error) throw result.error;
            return result;
          };
          promises.push(upsertPromise());
        }
      }

      const results = await Promise.allSettled(promises);

      // Check for any failures and only retry those tables
      const failures: Array<[string, Record<string, unknown>]> = [];
      let firstError = '';
      results.forEach((result, i) => {
        if (result.status === 'rejected') {
          failures.push(tableEntries[i]);
          if (!firstError) {
            firstError = result.reason instanceof Error ? result.reason.message : String(result.reason);
          }
        }
      });

      if (failures.length === 0) {
        this.onStatusChange('saved');
        this.retryCount = 0;
        return;
      }

      // Put only failed fields back for retry
      for (const [table, fields] of failures) {
        const existing = this.dirtyFields.get(table) || {};
        this.dirtyFields.set(table, { ...fields, ...existing });
      }

      const errorMsg = firstError;

      if (this.retryCount < AutoSaveEngine.MAX_RETRIES) {
        // Schedule retry with exponential backoff
        const delay = AutoSaveEngine.RETRY_DELAYS[this.retryCount] ?? 4000;
        this.retryCount++;
        this.onStatusChange('saving'); // Keep showing "saving" during retry
        this.retryTimer = setTimeout(() => {
          this.retryTimer = null;
          this.flush();
        }, delay);
      } else {
        // Max retries exceeded — show error, reset counter for next user action
        this.retryCount = 0;
        this.onStatusChange('error', errorMsg);
      }
    } finally {
      this.inFlight = false;

      // If more changes came in during the flush, flush again
      if (this.pendingFlush) {
        this.pendingFlush = false;
        this.resetTimer();
      }
    }
  }

  /**
   * Coerce string values to their DB-appropriate types.
   * Only converts "true"/"false" to booleans for select questions with
   * exactly two options: "true" and "false" (i.e., yes/no boolean selects).
   */
  private coerceValue(value: unknown, config: QuestionConfig): unknown {
    if (config.type === 'select' && config.options) {
      const vals = config.options.map((o) => o.value);
      if (vals.length === 2 && vals.includes('true') && vals.includes('false')) {
        if (value === 'true') return true;
        if (value === 'false') return false;
      }
    }
    return value;
  }
}
