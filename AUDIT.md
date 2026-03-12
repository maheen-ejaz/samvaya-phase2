# AUDIT.md — Samvaya Phase 2 Audit Log

> This file documents all code reviews, UI/UX audits, and E2E testing performed across each build phase. Referenced from `CLAUDE.md`.

---

## Phase 2A, Part 1 — Onboarding Form (Days 1–12)

| Field | Value |
|-------|-------|
| Commit | `70696c9a` |
| Date | March 12, 2026 |
| Audit type | Code review + Security + Accessibility + UX + Data integrity |
| Agents deployed | 1 (Claude Opus 4.6) |
| Issues found & fixed | **14 total** |

### Breakdown by Category

**Security (3)**
- Exchange count bypass: client-side message count was exploitable; fixed with server-side `chat_state` validation
- `ANTHROPIC_API_KEY` missing fast-fail validation on client init
- JSON extraction: greedy regex replaced with balanced-brace parser

**Data Integrity (2)**
- Q92 enum mismatch: values didn't align with `medical_status_enum`
- Q100 transcript parsing: fragile `lastIndexOf()` replaced with line-start matching

**Race Conditions (1)**
- Auto-save race condition: `resetTimer()` wasn't canceling pending `retryTimer`

**UX / Accessibility (5)**
- Missing `/auth/callback` route for Supabase magic link code exchange
- `SelectInput` radio groups missing `fieldset`/`legend` semantic HTML
- `MultiSelectInput` checkboxes missing `fieldset`/`legend` semantic HTML
- Missing `aria-live` regions for save status and submit button state changes
- Disabled button contrast below WCAG AA (needed `gray-200`/`gray-600`)

**Styling / Consistency (3)**
- Font configuration using incorrect fallback
- Login form using blue theme instead of rose (brand inconsistency)
- Timeline input missing focus management on entry add; dead code (`ChatPlaceholder.tsx`) deleted

---

## Phase 2A, Part 2 — Admin Dashboard

| Field | Value |
|-------|-------|
| Commit | `4734e836` |
| Date | March 12, 2026 |
| Audit type | Security + Data integrity + UX + Role-based access + E2E testing (Playwright) |
| Agents deployed | 1 (Claude Opus 4.6) |
| Issues found & fixed | **20 total** (5 critical, 5 major, 6 moderate, 4 low) |

### Critical (5)
1. Duplicate `payment-status` API route causing route collision
2. BGV consent check not enforced when moving applicants to pool
3. Storage RLS policies not properly restricted for `super_admin`
4. BGV race condition on concurrent upserts — fixed via `ON CONFLICT` upsert
5. HTML injection vulnerability in admin-sent emails — added HTML escaping

### Major (5)
1. UUID validation missing on all `[userId]` API route params
2. `formatEnum` acronym handling producing incorrect display names
3. Social media links not clickable in profile view
4. Sort order instability in applicant list
5. Missing `aria-labels` on interactive elements

### Moderate (6)
1. Email HTML escaping gaps
2. Admin auth role validation inconsistencies
3. Missing error boundaries for admin pages
4. Rate limiting not applied to certain admin actions
5. Action confirmation dialogs not consistent across features
6. UUID path parameter validation incomplete on some routes

### Low (4)
1. Status badge color inconsistencies
2. Focus management missing in modals
3. Table sort stability edge cases
4. Minor accessibility gaps (landmark roles, heading hierarchy)

### Features Audited
- Applicant list (search, filter, sort, pagination)
- Individual profile view (12 data sections)
- BGV tracker (13 OnGrid checks)
- Payment status management with state machine
- Team notes system
- Email communication interface
- Activity logging
- Admin authentication and role-based access control

---

## Phase 2A, Part 3 — Sync + Completion

| Field | Value |
|-------|-------|
| Date | March 12, 2026 |
| Audit type | Code review (3 agents) + UI/UX audit (2 agents) + Playwright E2E (16 tests) |
| Agents deployed | **5 total** (3 code review + 2 UI/UX) |
| Code review issues | ~60 found across security, error handling, code quality |
| UI/UX issues | ~27 found across visual consistency and accessibility |
| E2E tests | **16/16 passing** |

### Code Review — Key Fixes

**Security & Error Handling**
- Template PATCH endpoint accepted empty strings for name/subject/body — added `.trim()` validation
- Bulk-send response conflated sent/failed counts — separated `sentCount` and `failedCount`
- Subject line was HTML-escaped (breaking email clients) — plain text substitution for subjects, HTML escaping only for body
- Migration not idempotent — added `IF NOT EXISTS`, `ON CONFLICT DO NOTHING`, `DROP POLICY IF EXISTS`
- Silent error swallowing in 3 components (`CommunicationsHub`, `BulkSendForm`, `BulkSendHistory`) — added error state display with `role="alert"`

**Code Quality**
- Bulk-send history query missing `.limit()` — added `.limit(5000)`
- Consistent error response format enforced across all new API routes
- All mutations verified to call `logActivity()`

### UI/UX Audit — Key Fixes

**Visual Consistency**
- Spinner size inconsistency (`h-8 w-8` → `h-6 w-6`) in analytics dashboard
- Border color mismatch (`border-gray-100` → `border-gray-200`) in pricing display
- Shadow inconsistency (`shadow-xl` → `shadow-md`) on bulk-send confirmation modal

**Accessibility**
- Browser `confirm()` dialogs replaced with accessible `role="dialog"` components with `aria-modal`, `aria-labelledby`
- Added `aria-expanded` on preview toggles in template editor
- Added `aria-labels` on variable insertion buttons
- Added `role="status"` with `aria-live="polite"` on success messages
- Added `role="alert"` on error messages
- Added `disabled:cursor-not-allowed` on all disabled buttons
- Added `scope="col"` on all table header cells (geographic + specialty distribution)

### Playwright E2E Tests (16/16 passing)

| Test Suite | Tests | Status |
|-----------|-------|--------|
| Sidebar Navigation | 1 | Pass |
| Settings Page | 3 (pricing display, feature flag toggle persistence, Airtable sync card) | Pass |
| Activity Log | 3 (page render, filter controls, reset filters) | Pass |
| Analytics Dashboard | 2 (page render + funnel, geographic/specialty distribution) | Pass |
| Communications — Templates | 3 (tabs render, template CRUD lifecycle, preview with variable substitution) | Pass |
| Communications — Bulk Send | 2 (step 1 render, flow navigation) | Pass |
| Communications — History | 1 (history tab render) | Pass |

Migration pushed to remote Supabase successfully. Build passes with zero errors.

---

## Phase 2B — Matching Algorithm

| Field | Value |
|-------|-------|
| Date | March 12, 2026 |
| Audit type | Code review (3 parallel agents): Security & Data Integrity, Error Handling & Edge Cases, Code Quality & Consistency |
| Agents deployed | **3** (parallel code review) |
| Issues found | **~65 total** (Security: 17, Error Handling: 26, Code Quality: 22) |
| Issues fixed | **10 critical/major fixes applied** |

### Audit Agents

1. **Security & Data Integrity Agent** — 17 issues (2 critical, 5 major, 6 moderate, 4 low)
2. **Error Handling & Edge Cases Agent** — 26 issues (5 critical, 10 high, 7 medium, 4 low)
3. **Code Quality & Consistency Agent** — 22 issues (2 critical, 5 high, 10 medium, 5 low)

### Critical/Major Fixes Applied

| # | Issue | Fix |
|---|-------|-----|
| 1 | Pool eligibility included `awaiting_payment`/`active_member` users in pre-filter | Restricted to `in_pool` and `match_presented` only — in RPC function, pre-filter.ts, and getPoolStats |
| 2 | Missing `SET search_path = public` on `SECURITY DEFINER` RPC function | Added `SET search_path = public` to `get_prefiltered_candidates` |
| 3 | `min_score_for_suggestion` config fetched but never enforced | scoreCompatibility now returns `null` suggestion + `belowThreshold: true` for below-threshold scores; batch.ts tracks `skipped_below_threshold` count |
| 4 | Non-atomic approve action (suggestion update + presentation insert could partially fail) | Added rollback logic — if presentation creation fails, suggestion reverts to `pending_review` |
| 5 | `assembleProfilePayload` silently returned null-filled payload for missing profiles | Now throws `Error('Profile not found for user ...')` when profile is missing |
| 6 | `processWithConcurrency` had fragile `splice(indexOf(promise))` pattern | Replaced with worker-pool semaphore pattern (index-based) |
| 7 | `preFilterAllPairs` aborted entire run on single user failure | Added try/catch per user with `console.error` — single-user failure is isolated |
| 8 | Expired presentations still accepted responses | Added expiry check before recording; auto-expires with 410 status |
| 9 | `alert()` used in SuggestionCard for rejection validation | Replaced with inline `validationError` state and `role="alert"` element |
| 10 | Duplicate Anthropic client singleton in scoring.ts | Exported `getClient()` from `src/lib/claude/client.ts`; scoring.ts now reuses it |

### Features Audited

- Pre-filtering SQL engine (Postgres RPC + TypeScript wrappers)
- Claude API compatibility scoring (9 dimensions, weighted overall score)
- Batch scoring with concurrency control and daily limits
- Match suggestion queue (admin UI with pipeline controls)
- Approval workflow with presentation creation
- Presentation tracker with response recording
- Match history and feedback recording
- Introduction scheduling and outcome recording
- 11 API routes, 6 UI components, 4 admin pages

Build passes with zero errors after all fixes.

---

## Phase 2C — User-Facing PWA

| Field | Value |
|-------|-------|
| Date | March 12, 2026 |
| Audit type | Security + UX/UI + Code Quality (3 parallel agents) |
| Agents deployed | **3** (parallel) + 1 plan synthesis agent |
| Issues found | **~30 total** (6 critical, 6 major, 6 UX critical, 9 UX major, ~10 minor) |
| Issues fixed | **All critical and major fixes applied** |

### Audit Agents

1. **Security Agent** — Race conditions, photo security, PII leak prevention, admin client usage
2. **UX/UI Agent** — Accessibility, loading states, empty states, touch targets, navigation
3. **Code Quality Agent** — N+1 queries, hardcoded config, error handling, type safety

### Critical Fixes Applied

| # | Issue | Fix |
|---|-------|-----|
| 1 | Double-response race condition — two concurrent POSTs both succeed | Created `handle_match_response` PostgreSQL RPC with `FOR UPDATE` row lock; entire response + mutual interest flow is atomic |
| 2 | Non-atomic mutual interest — updating presentation, users, payments in separate queries | Consolidated into single RPC function with transactional guarantees |
| 3 | N+1 query in match list — 4 queries per presentation (80 queries for 20 matches) | Batch fetch all profiles, creds, photos in 3 bulk queries + batch signed URLs |
| 4 | Hardcoded WhatsApp number `919876543210` in ContactPaymentCTA and SettingsPage | Moved to `NEXT_PUBLIC_WHATSAPP_NUMBER` env var |
| 5 | Photo path null safety — no fallback if storage_path/blurred_path missing | Added defensive null checks with graceful fallback |
| 6 | Expiry check used JS Date comparison — clock skew risk | RPC uses PostgreSQL `NOW()` for server-side clock consistency |

### Major Fixes Applied

| # | Issue | Fix |
|---|-------|-----|
| 1 | No debounce on response submit button — double-tap race | Buttons disable immediately on click, re-enable on error |
| 2 | Confirmation dialog lacks focus trap, ARIA roles, keyboard support | Added `role="alertdialog"`, `aria-modal`, focus trap, Escape key handler |
| 3 | Profile API returns no error for missing profile | Added 404 response with helpful message |
| 4 | Match detail photo signing was sequential (one per photo) | Switched to `createSignedUrls()` batch API |

### UX Fixes Applied

| # | Issue | Fix |
|---|-------|-----|
| 1 | Spinner-only loading state on match list | Replaced with skeleton UI (3 placeholder cards with pulse animation) |
| 2 | Spinner-only loading state on match detail | Replaced with skeleton UI matching card layout |
| 3 | No back button on match detail page | Added "Back to matches" link with chevron icon |
| 4 | Star rating touch targets too small (32px) | Increased padding from `p-1` to `p-2` (40px+ effective target) |
| 5 | Spider web chart axis labels too small (8px) | Increased to 10px for readability |

### New Migration

- `supabase/migrations/20260327000004_handle_match_response_rpc.sql` — `handle_match_response()` PostgreSQL function with `SECURITY DEFINER`, row-level locking, atomic mutual interest handling

### Features Audited

- Status dashboard (7 payment status states, GooCampus gate)
- Match list with enriched profile data
- Match detail card (7 sections per PRD 6.11B)
- Spider web chart (8-axis SVG radar)
- Response flow with confirmation dialog
- Feedback form
- Profile view (own unblurred photos)
- Settings page
- Bottom navigation
- PWA manifest
- 6 API routes, 15+ UI components, 7 pages

### Playwright E2E Tests (12/12 passing)

| Test Suite | Tests | Status |
|-----------|-------|--------|
| Status Dashboard | 1 (page load + render) | Pass |
| Matches Page | 1 (page load + content/empty/skeleton) | Pass |
| Profile Page | 1 (page load) | Pass |
| Settings Page | 3 (account, support, legal sections) | Pass |
| Bottom Navigation | 2 (4 tabs, active state) | Pass |
| PWA Manifest | 1 (manifest link in head) | Pass |
| API Routes (unauth) | 3 (status/matches/profile → 401) | Pass |

Build passes with zero errors after all fixes.

---

## Phase 2D — PWA Polish + Features

| Field | Value |
|-------|-------|
| Date | March 13, 2026 |
| Audit type | Code review + UX/UI + Integration (3 parallel agents) + Playwright E2E (15 tests) |
| Agents deployed | **5 total** (1 code review + 1 UX/UI + 1 integration + 2 follow-up verification) |
| Issues found | **~25 total** (3 critical, 5 major, 8 UX, 6 minor, + false positives) |
| Issues fixed | **All genuine issues fixed** |

### Audit Agents

1. **Code Review Agent** — Security, error handling, data validation, code quality
2. **UX/UI Agent** — Touch targets, accessibility, optimistic UI, visual consistency
3. **Integration Agent** — Cross-feature data flow, auth consistency, database integration

### Critical Fixes Applied

| # | Issue | Fix | File |
|---|-------|-----|------|
| C1 | `theirResponse` data leak — revealed other party's response before mutual interest resolved | Changed check from `p.status !== 'pending'` to `p.is_mutual_interest !== null` | `matches/[presentationId]/route.ts:196` |
| C2 | Introductions API missing `active_member` payment gate on GET | Added `paymentStatus !== 'active_member'` → 403 check | `introductions/route.ts:73` |
| C3 | Paused users not excluded from matching — RPC, `preFilterAllPairs()`, and `getPoolStats()` all included paused users | New migration `20260327000008` adds `COALESCE(u.is_paused, false) = false`; TypeScript queries add `.or('is_paused.is.null,is_paused.eq.false')` | `pre-filter.ts:40,89` + migration |

### Major Fixes Applied

| # | Issue | Fix | File |
|---|-------|-----|------|
| M1 | Slot validation missing on POST `/api/app/introductions` — accepted any date/timeSlot values | Added `VALID_TIME_SLOTS` set, `MAX_SLOTS = 42`, date regex validation, and individual field checks | `introductions/route.ts:99-115` |
| M2 | `request.json()` could throw on malformed body in 4 API routes | Added try-catch wrapper on all `request.json()` calls | `introductions/route.ts`, `settings/route.ts`, `profile/route.ts`, `push-subscription/route.ts` |
| M3 | Profile API leaked Supabase error messages to client | `console.error()` internally + generic error message in response | `profile/route.ts` |
| M4 | Profile API PATCH accepted arbitrary fields | Added string max-length (200) validation and hobbies array filtering | `profile/route.ts` |
| M5 | `data.slots` not guarded before `.map()` in ScheduleIntroduction | Added `Array.isArray(data.slots)` guard with empty array fallback | `ScheduleIntroduction.tsx:50` |

### UX/UI Fixes Applied

| # | Issue | Fix | File |
|---|-------|-----|------|
| U1 | Spinner color used Tailwind default instead of brand color | Changed `border-t-rose-600` → `border-t-samvaya-red` | `ProfileView.tsx:45` |
| U2 | Settings pause/notification toggles had no rollback on API failure | Added optimistic update with rollback pattern (`setIsPaused(previous)` on error) | `SettingsPage.tsx` |
| U3 | Notification toggle touch targets too small (h-5/w-9) | Increased to h-6/w-11 | `SettingsPage.tsx` |
| U4 | Edit profile back button too small for touch | Increased to h-10/w-10 + added `aria-label="Back to profile"` | `EditProfileForm.tsx` |
| U5 | No unsaved changes warning on edit profile | Added `hasChanges` state with `beforeunload` handler | `EditProfileForm.tsx` |
| U6 | ProfileReveal contact links missing visual affordance | Added arrow SVGs to email/phone links | `ProfileReveal.tsx` |
| U7 | Decorative heart SVGs not hidden from screen readers | Added `aria-hidden="true"` | `ProfileReveal.tsx` |
| U8 | Match detail loading skeleton missing ARIA | Added `role="status" aria-label="Loading match details"` | `MatchCardView.tsx` |

### Minor Fixes Applied

| # | Issue | Fix | File |
|---|-------|-----|------|
| m1 | Unused `TIME_SLOT_LABELS` constant | Removed | `ScheduleIntroduction.tsx` |
| m2 | Date generation in ScheduleIntroduction recalculated every render | Wrapped in `useMemo` | `ScheduleIntroduction.tsx` |
| m3 | `subscribeToPush` didn't check `res.ok` after server save | Added `res.ok` check; unsubscribes browser-side if server save fails | `use-service-worker.ts` |
| m4 | `unsubscribeFromPush` called server DELETE before browser unsubscribe | Reordered: browser `unsubscribe()` first, then server DELETE | `use-service-worker.ts` |
| m5 | `/app` was pre-cached as static asset in service worker | Removed from `STATIC_ASSETS` array; added offline fallback HTML response | `public/sw.js` |
| m6 | WhatsApp links rendered broken `wa.me/` when env var empty | Added guard: show email fallback when `WHATSAPP_NUMBER` is empty | `SettingsPage.tsx` |

### New Migrations

| Migration | Purpose |
|-----------|---------|
| `20260327000005_add_pause_and_notification_prefs.sql` | `is_paused`, `paused_at` columns on users; `notification_preferences` table |
| `20260327000006_create_push_subscriptions.sql` | `push_subscriptions` table with FK, unique constraint, RLS |
| `20260327000007_create_introduction_availability.sql` | `introduction_availability` table with FK, unique constraint, RLS |
| `20260327000008_exclude_paused_from_matching.sql` | Updated `get_prefiltered_candidates` RPC to exclude paused users |

### Playwright E2E Tests (15/15 passing)

| Test Suite | Tests | Status |
|-----------|-------|--------|
| Edit Profile | 3 (page load, back button, sections) | Pass |
| Settings — Pause | 1 (pause toggle visible) | Pass |
| Settings — Notifications | 1 (email/push sections visible) | Pass |
| Settings — Delete | 1 (delete account option) | Pass |
| Legal Pages | 2 (privacy, terms) | Pass |
| Login Page | 1 (email input) | Pass |
| Service Worker | 1 (sw.js served) | Pass |
| API Protections | 3 (settings 401, introductions 401, manifest 200) | Pass |
| Auth Redirect | 1 (/app redirect) | Pass |
| Security Headers | 1 (response headers) | Pass |

### False Positives from Audit Agents

> **Important for future audits:** The following issues were flagged by audit agents but were already fixed in prior audit cycles or are not actual issues. Do not re-flag these.

| # | Flagged Issue | Why It's a False Positive |
|---|---------------|--------------------------|
| FP1 | "theirResponse leak — `p.status !== 'pending'` check is wrong" | **Already fixed.** Code uses `p.is_mutual_interest !== null` (line 196). Agent read stale code. |
| FP2 | "No slot validation in POST `/api/app/introductions`" | **Already fixed.** Lines 99-115 have full validation: `VALID_TIME_SLOTS` set, `MAX_SLOTS = 42`, date regex `^\d{4}-\d{2}-\d{2}$`, individual field presence checks. |
| FP3 | "Missing `active_member` payment gate on introductions POST" | **Already fixed.** Line 77-78 checks `paymentStatus !== 'active_member'` → 403. |
| FP4 | "Introductions API missing slot validation — no limit on array size (DoS)" | **Already fixed.** `MAX_SLOTS = 42` enforced at line 101-103. |
| FP5 | "useUserStatus() may throw if provider missing" | **Not an issue.** The provider is in `src/app/app/layout.tsx` which wraps all `/app/*` pages. SettingsPage can never render without it. |
| FP6 | "Push subscription onConflict uses column names instead of constraint name" | **Not an issue.** Supabase `upsert()` accepts column names for `onConflict` — this is the documented API. Composite `(user_id, endpoint)` unique constraint works correctly with column-name syntax. |
| FP7 | "Notification prefs PATCH without GET first may violate NOT NULL constraints" | **Not an issue.** The PATCH endpoint uses `upsert` with all boolean fields defaulted in the SQL migration (`DEFAULT true`/`DEFAULT false`). Missing fields get their column defaults. |
| FP8 | "Service worker may serve stale data" | **By design.** Network-first strategy ensures fresh data when online; cache fallback is an intentional offline UX choice, not a bug. |
| FP9 | "Timezone issue with `new Date(date + 'T00:00:00')`" | **Low risk.** All Samvaya users are in India (IST). The date is used only for display and slot selection, not for server-side scheduling. Server stores the date string as-is. |
| FP10 | "ProfileReveal unsafe rendering of firstName" | **Not an issue.** Audit agent itself noted the early return on line 53 guards against null `revealData`. The `|| 'Your Match'` fallback is defense-in-depth. |

Build passes with zero errors after all fixes. 27/27 total Playwright tests passing (12 Phase 2C + 15 Phase 2D).

---

## Summary Across All Phases

| Metric | Part 1 | Part 2 | Part 3 | Phase 2B | Phase 2C | Phase 2D | Total |
|--------|--------|--------|--------|----------|----------|----------|-------|
| Agents deployed | 1 | 1 | 5 | 3 | 4 | 5 | 19 |
| Issues found | 14 | 20 | ~87 | ~65 | ~30 | ~25 | ~241 |
| Critical issues | 0 | 5 | — | ~9 | 6 | 3 | 23+ |
| Major issues | 0 | 5 | — | ~10 | 6 | 5 | 26+ |
| E2E tests | — | Validated | 16/16 | — | 12/12 | 15/15 | 43+ |
| Audit types | Code, Security, A11y | Code, Security, A11y, E2E | Code (3), UI/UX (2), E2E | Security, Error, Quality (3) | Security, UX/UI, Quality (3) | Code, UX/UI, Integration (3) + E2E | All |
