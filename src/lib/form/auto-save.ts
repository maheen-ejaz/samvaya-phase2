import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import type { FormState, QuestionConfig, SectionId } from './types';
import { getQuestion } from './questions';
import { getSectionForQuestion } from './sections';

type SaveStatus = FormState['saveStatus'];

export interface FlushResult {
  /** True if every dirty field made it to Supabase before the deadline. */
  ok: boolean;
  /** Number of dirty table rows still queued (preserved in localStorage). */
  remainingDirty: number;
}

// Per-request network timeout — prevents flushNow() from hanging indefinitely
// on a slow/stalled connection.
const SAVE_TIMEOUT_MS = 12_000;

// Default deadline for flushNow(). Short by default because it's called from
// beforeunload and destroy() paths where we can't block long. The
// user-initiated submit path passes a longer deadline explicitly.
const FLUSH_NOW_DEADLINE_MS = 8_000;

// localStorage key for crash-safe write-through (24h TTL)
const LOCAL_KEY = (userId: string) => `samvaya_ws_${userId}`;
const LOCAL_TTL_MS = 86_400_000;

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    p,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Save timed out after ${ms}ms`)), ms)
    ),
  ]);
}

/**
 * Auto-save engine that batches field changes per table
 * and flushes them with a debounced upsert.
 *
 * Three-layer persistence:
 *  1. Debounced Supabase save (primary, 500 ms)
 *  2. localStorage write-through (crash backup, 24 h TTL)
 *  3. navigator.sendBeacon via buildBeaconPayload() (tab-close backup)
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
  private isOnline: boolean;
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAYS = [1000, 2000, 4000];
  private static readonly ALLOWED_TABLES = new Set([
    'users', 'profiles', 'medical_credentials', 'partner_preferences',
    'photos', 'documents', 'payments', 'compatibility_profiles', 'auth_users',
  ]);

  // Bound listener references so we can remove them on destroy()
  private readonly _handleOnline: () => void;
  private readonly _handleOffline: () => void;
  private readonly _handleVisibility: () => void;

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
    this.isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

    this._handleOnline = () => {
      this.isOnline = true;
      if (this.dirtyFields.size > 0 && !this.inFlight && !this.retryTimer) {
        this.resetTimer();
      }
    };

    this._handleOffline = () => {
      this.isOnline = false;
      // Cancel any pending debounce — pointless to attempt saves while offline.
      // Keep dirty fields intact; they will be saved on reconnect.
      if (this.timer) { clearTimeout(this.timer); this.timer = null; }
    };

    this._handleVisibility = () => {
      if (
        document.visibilityState === 'visible' &&
        this.isOnline &&
        this.dirtyFields.size > 0 &&
        !this.inFlight &&
        !this.retryTimer
      ) {
        this.resetTimer();
      }
    };

    window.addEventListener('online', this._handleOnline);
    window.addEventListener('offline', this._handleOffline);
    document.addEventListener('visibilitychange', this._handleVisibility);
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  markDirty(questionId: string, value: unknown): void {
    const config = getQuestion(questionId);
    if (!config) return;

    // Skip types that handle their own saving. `guided_photo_upload` (Q95) and
    // `file_upload` (Q96-Q98) persist photo/document rows directly via the
    // upload API — attempting to auto-save their array-of-ids value to the
    // single-string target column corrupts the row and triggers Save Failed.
    if (
      config.type === 'file_upload' ||
      config.type === 'guided_photo_upload' ||
      config.type === 'claude_chat'
    ) {
      return;
    }

    // Gate questions (targetTable = 'local') are persisted in users.gate_answers JSONB
    if (config.targetTable === 'local') {
      if (value === null || value === undefined) {
        const updated = { ...this.gateAnswers };
        delete updated[questionId];
        this.gateAnswers = updated;
      } else {
        this.gateAnswers = { ...this.gateAnswers, [questionId]: String(value) };
      }
      const existing = this.dirtyFields.get('users') || {};
      existing['gate_answers'] = this.gateAnswers;
      this.dirtyFields.set('users', existing);
      this.persistToLocal();
      this.resetTimer();
      return;
    }

    const table = config.targetTable;
    const existing = this.dirtyFields.get(table) || {};

    if (config.type === 'range' && config.targetColumn2 && Array.isArray(value)) {
      existing[config.targetColumn] = value[0];
      existing[config.targetColumn2] = value[1];
    } else if (config.type === 'dual_location' && config.targetColumn2 && config.targetColumn3) {
      const loc = value as { states?: string[]; countries?: string[]; noPreference?: boolean } | null;
      existing[config.targetColumn] = loc?.states ?? [];
      existing[config.targetColumn2] = loc?.countries ?? [];
      existing[config.targetColumn3] = loc?.noPreference ?? false;
    } else if (config.type === 'international_location' && config.targetColumn2) {
      const loc = value as { city?: string; country?: string } | null;
      existing[config.targetColumn] = loc?.city ?? '';
      existing[config.targetColumn2] = loc?.country ?? '';
    } else {
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

      const currentEntry = entries.find((e) => e.is_current);
      existing['current_designation'] = currentEntry?.designation || null;

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
          continue;
        }
        totalMonths += Math.max(0, endMonths - startMonths);
      }
      existing['total_experience_months'] = totalMonths;
    }

    this.dirtyFields.set(table, existing);
    this.persistToLocal();
    this.resetTimer();
  }

  markPosition(currentQuestionId: string): void {
    const config = getQuestion(currentQuestionId);
    if (!config) return;

    const section = getSectionForQuestion(config.questionNumber);
    const sectionIdx = section ? 'ABCDEFGHIJKLMN'.indexOf(section.id) : -1;
    const sectionNumber = sectionIdx >= 0 ? sectionIdx + 1 : 1;

    const existing = this.dirtyFields.get('users') || {};
    existing['onboarding_section'] = sectionNumber;
    existing['onboarding_last_question'] = config.questionNumber;
    this.dirtyFields.set('users', existing);
    this.persistToLocal();
    this.resetTimer();
  }

  /**
   * Advance `users.onboarding_section` to the given section without requiring
   * a specific question id. Used by the section-by-section "Continue" flow so
   * the server-side unlock gate can fast-path the next section via
   * `targetIdx <= resumeIdx` even before the user has navigated into any of
   * its questions.
   */
  markPositionBySection(sectionId: SectionId): void {
    const sectionIdx = 'ABCDEFGHIJKLMN'.indexOf(sectionId);
    if (sectionIdx < 0) return;
    const existing = this.dirtyFields.get('users') || {};
    existing['onboarding_section'] = sectionIdx + 1;
    this.dirtyFields.set('users', existing);
    this.persistToLocal();
    this.resetTimer();
  }

  /**
   * Force an immediate flush. Returns a result indicating whether all dirty
   * fields reached Supabase before the deadline. Dirty state is preserved in
   * localStorage and recovered on the next page load if the flush doesn't
   * complete.
   *
   * The submit-continue path passes a larger `deadlineMs` because it's
   * user-initiated and we *want* to wait for confirmation — unlike the
   * beforeunload / destroy paths where the default short deadline applies.
   */
  async flushNow(opts: { deadlineMs?: number } = {}): Promise<FlushResult> {
    if (this.timer) { clearTimeout(this.timer); this.timer = null; }
    if (this.retryTimer) { clearTimeout(this.retryTimer); this.retryTimer = null; }

    const deadline = Date.now() + (opts.deadlineMs ?? FLUSH_NOW_DEADLINE_MS);
    const startDirtyTables = Array.from(this.dirtyFields.keys());
    const isOnlineAtStart = this.isOnline;

    for (let i = 0; i < 10; i++) {
      while (this.inFlight) {
        if (Date.now() >= deadline) {
          console.warn('[auto-save] flushNow deadline hit while inFlight', {
            startDirtyTables,
            remainingDirty: this.dirtyFields.size,
            isOnline: this.isOnline,
          });
          return { ok: this.dirtyFields.size === 0, remainingDirty: this.dirtyFields.size };
        }
        await new Promise((resolve) => setTimeout(resolve, 20));
      }
      if (this.dirtyFields.size === 0) return { ok: true, remainingDirty: 0 };
      if (Date.now() >= deadline) {
        console.warn('[auto-save] flushNow deadline hit before flush', {
          startDirtyTables,
          currentDirtyTables: Array.from(this.dirtyFields.keys()),
          remainingDirty: this.dirtyFields.size,
          isOnline: this.isOnline,
          isOnlineAtStart,
        });
        return { ok: false, remainingDirty: this.dirtyFields.size };
      }
      await this.flush();
    }
    console.warn('[auto-save] flushNow gave up after 10 iterations', {
      remainingDirty: this.dirtyFields.size,
      dirtyTables: Array.from(this.dirtyFields.keys()),
    });
    return { ok: this.dirtyFields.size === 0, remainingDirty: this.dirtyFields.size };
  }

  destroy(): void {
    if (this.timer) { clearTimeout(this.timer); this.timer = null; }
    if (this.retryTimer) { clearTimeout(this.retryTimer); this.retryTimer = null; }
    window.removeEventListener('online', this._handleOnline);
    window.removeEventListener('offline', this._handleOffline);
    document.removeEventListener('visibilitychange', this._handleVisibility);
  }

  /**
   * Synchronously writes the current dirty state to localStorage.
   * Call this in a `beforeunload` handler where async operations cannot complete.
   */
  persistDirtyState(): void {
    this.persistToLocal();
  }

  /**
   * Returns a JSON string suitable for navigator.sendBeacon(), or null if there
   * is nothing dirty to send.
   */
  buildBeaconPayload(): string | null {
    if (this.dirtyFields.size === 0) return null;
    return JSON.stringify({ dirty: Object.fromEntries(this.dirtyFields) });
  }

  // ---------------------------------------------------------------------------
  // Static helpers for cross-session recovery
  // ---------------------------------------------------------------------------

  static getPersistedState(userId: string): {
    dirty: Record<string, Record<string, unknown>>;
    gateAnswers: Record<string, string>;
  } | null {
    try {
      const raw = localStorage.getItem(LOCAL_KEY(userId));
      if (!raw) return null;
      const parsed = JSON.parse(raw) as {
        ts: number;
        dirty: Record<string, Record<string, unknown>>;
        gateAnswers: Record<string, string>;
      };
      if (!parsed.ts || Date.now() - parsed.ts > LOCAL_TTL_MS) {
        localStorage.removeItem(LOCAL_KEY(userId));
        return null;
      }
      return { dirty: parsed.dirty ?? {}, gateAnswers: parsed.gateAnswers ?? {} };
    } catch {
      return null;
    }
  }

  /**
   * Merges recovered dirty state into the engine's queue. Existing dirty fields
   * (from the current session) take precedence over recovered ones.
   */
  loadPersistedState(
    dirty: Record<string, Record<string, unknown>>,
    gateAnswers: Record<string, string>
  ): void {
    // Only load tables we're allowed to write
    for (const [table, fields] of Object.entries(dirty)) {
      if (!AutoSaveEngine.ALLOWED_TABLES.has(table)) continue;
      const existing = this.dirtyFields.get(table) || {};
      // Recovered data fills in missing fields; current session's data wins
      this.dirtyFields.set(table, { ...fields, ...existing });
    }
    // Merge gate answers similarly (current session wins)
    this.gateAnswers = { ...gateAnswers, ...this.gateAnswers };

    if (this.dirtyFields.size > 0 && this.isOnline) {
      this.resetTimer();
    }
  }

  // ---------------------------------------------------------------------------
  // Private
  // ---------------------------------------------------------------------------

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

    // Don't attempt saves while offline — preserve retries for when we're back.
    if (!this.isOnline) return;

    if (this.inFlight) {
      this.pendingFlush = true;
      return;
    }

    this.inFlight = true;
    this.onStatusChange('saving');

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

        // Inline timeout via Promise.race — PostgrestFilterBuilder is PromiseLike,
        // not a true Promise, so a generic withTimeout<T> won't satisfy TypeScript.
        // Using Promise.race directly lets tsc infer the result type correctly.
        const timeout = () => new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Save timed out')), SAVE_TIMEOUT_MS)
        );

        if (table === 'auth_users') {
          promises.push(
            withTimeout(
              this.supabase.auth.updateUser(fields as { phone?: string }),
              SAVE_TIMEOUT_MS
            )
          );
        } else if (table === 'users') {
          const updatePromise = async () => {
            const result = await Promise.race([
              this.supabase.from('users').update(fields as never).eq('id', this.userId),
              timeout(),
            ]);
            if (result.error) throw result.error;
            return result;
          };
          promises.push(updatePromise());
        } else {
          const upsertPromise = async () => {
            const result = await Promise.race([
              this.supabase
                .from(table as keyof Database['public']['Tables'])
                .upsert(
                  { user_id: this.userId, ...fields } as never,
                  { onConflict: 'user_id' }
                ),
              timeout(),
            ]);
            if (result.error) throw result.error;
            return result;
          };
          promises.push(upsertPromise());
        }
      }

      const results = await Promise.allSettled(promises);

      const failures: Array<[string, Record<string, unknown>]> = [];
      let firstError = '';
      let isAuthError = false;

      results.forEach((result, i) => {
        if (result.status === 'rejected') {
          failures.push(tableEntries[i]);
          const reasonMsg = result.reason instanceof Error
            ? result.reason.message
            : (result.reason as { message?: string })?.message
              ?? (result.reason as { details?: string })?.details
              ?? JSON.stringify(result.reason);
          console.error('[auto-save] save failed', {
            table: tableEntries[i][0],
            fields: Object.keys(tableEntries[i][1]),
            reason: reasonMsg,
          });
          if (!firstError) {
            firstError = reasonMsg;
            // Detect auth/JWT failures — retrying won't help, user needs to reload
            const msg = firstError.toLowerCase();
            if (msg.includes('jwt') || msg.includes('401') || msg.includes('invalid claim') || msg.includes('token')) {
              isAuthError = true;
            }
          }
        }
      });

      if (failures.length === 0) {
        this.onStatusChange('saved');
        this.retryCount = 0;
        this.clearLocal(); // all dirty data is now in DB
        return;
      }

      // Put only the failed fields back for retry
      for (const [table, fields] of failures) {
        const existing = this.dirtyFields.get(table) || {};
        this.dirtyFields.set(table, { ...fields, ...existing });
      }
      this.persistToLocal(); // keep localStorage in sync with updated dirty fields

      // Auth errors: skip retries — the Supabase client can't recover without a reload
      if (isAuthError || this.retryCount >= AutoSaveEngine.MAX_RETRIES) {
        this.retryCount = 0;
        const errorMsg = isAuthError
          ? 'Session expired — please refresh the page to continue saving.'
          : firstError;
        this.onStatusChange('error', errorMsg);
        return;
      }

      const delay = AutoSaveEngine.RETRY_DELAYS[this.retryCount] ?? 4000;
      this.retryCount++;
      this.onStatusChange('saving');
      this.retryTimer = setTimeout(() => {
        this.retryTimer = null;
        void this.flush();
      }, delay);
    } finally {
      this.inFlight = false;
      if (this.pendingFlush) {
        this.pendingFlush = false;
        this.resetTimer();
      }
    }
  }

  private persistToLocal(): void {
    try {
      const payload = JSON.stringify({
        ts: Date.now(),
        dirty: Object.fromEntries(this.dirtyFields),
        gateAnswers: this.gateAnswers,
      });
      localStorage.setItem(LOCAL_KEY(this.userId), payload);
    } catch {
      // localStorage may be full or unavailable (private browsing) — not critical
    }
  }

  private clearLocal(): void {
    try {
      localStorage.removeItem(LOCAL_KEY(this.userId));
    } catch { /* ignore */ }
  }

  /**
   * Coerce string values to their DB-appropriate types.
   * Only converts "true"/"false" to booleans for select questions with
   * exactly two options: "true" and "false" (i.e., yes/no boolean selects).
   *
   * NOTE: We intentionally do NOT coerce "yes"/"no" string pairs here.
   * Current questions.ts usage: the only selects with exactly two yes/no
   * options (Q19, Q24) store to `targetTable: 'local'` (users.gate_answers
   * JSONB), which bypasses this path entirely. Selects that include "yes"/"no"
   * AND target a real DB column (Q49, Q70, Q72) have three or more options
   * and write to TEXT/enum columns, not booleans. Adding a generic yes/no →
   * boolean coercion here would risk writing booleans into text columns
   * without a way to introspect DB types at runtime. If a future question
   * needs yes/no → boolean, extend this with an explicit per-question
   * allowlist.
   */
  private coerceValue(value: unknown, config: QuestionConfig): unknown {
    if (config.type === 'select' && config.options) {
      const vals = config.options.map((o) => o.value);
      if (vals.length === 2 && vals.includes('true') && vals.includes('false')) {
        if (value === 'true') return true;
        if (value === 'false') return false;
      }
    }
    if (config.type === 'multi_select') {
      return Array.isArray(value) ? value : [];
    }
    return value;
  }
}
