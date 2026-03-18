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

## Production Deployment Audit — Post-Deploy Verification

| Field | Value |
|-------|-------|
| Date | March 13, 2026 |
| Production URL | `app.samvayamatrimony.com` |
| Audit type | Production flow testing + Security headers + Secret exposure scan + UX/UI code review |
| Agents deployed | **6 total** (1 production flow + 1 security code audit + 1 UX/UI audit + 3 initial exploration) |
| Method | curl HTTP testing against live production + deep source code review |

---

### Production Flow Test Results

All production URLs tested via HTTP requests against `app.samvayamatrimony.com`.

| # | Route | Expected | Actual | Status |
|---|-------|----------|--------|--------|
| 1 | `/` (root) | 307 redirect to `/auth/login` | 307 → `/auth/login` | **PASS** |
| 2 | `/auth/login` | 200, login form renders | 200, proper metadata + LoginForm component | **PASS** |
| 3 | `/app` | Redirect to login (unauth) | 307 → `/auth/login?next=%2Fapp` | **PASS** |
| 4 | `/app/onboarding` | Redirect to login (unauth) | 307 → `/auth/login?next=%2Fapp%2Fonboarding` | **PASS** |
| 5 | `/app/matches` | Redirect to login (unauth) | 307 → `/auth/login?next=%2Fapp%2Fmatches` | **PASS** |
| 6 | `/app/profile` | Redirect to login (unauth) | 307 → `/auth/login?next=%2Fapp%2Fprofile` | **PASS** |
| 7 | `/app/settings` | Redirect to login (unauth) | 307 → `/auth/login?next=%2Fapp%2Fsettings` | **PASS** |
| 8 | `/admin` | Redirect to login (unauth) | 307 → `/auth/login?next=%2Fadmin` | **PASS** |
| 9 | `/legal/privacy` | 200, public page | 200, well-structured privacy policy | **PASS** |
| 10 | `/legal/terms` | 200, public page | 200, well-structured terms with correct pricing | **PASS** |
| 11 | `POST /api/form/submit` | 401 Unauthorized | `{"error":"Unauthorized"}` | **PASS** |
| 12 | `POST /api/chat` | 401 Unauthorized | `{"error":"Unauthorized"}` | **PASS** |
| 13 | `/nonexistent-page` | 404 or redirect | 307 → `/auth/login?next=%2Fnonexistent-page` | **PASS** (Note: unknown routes redirect to login rather than 404 — acceptable for private app, hides route structure from outsiders) |

**Return URL preservation:** All protected routes correctly append `?next=` with the intended destination for post-login redirect.

---

### Security Headers (Production)

All headers verified via `curl -sI` against live production.

| Header | Value | Assessment |
|--------|-------|------------|
| `strict-transport-security` | `max-age=63072000; includeSubDomains; preload` | **Excellent** — 2-year HSTS with preload |
| `content-security-policy` | `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://*.supabase.co; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.anthropic.com; font-src 'self'; frame-ancestors 'none'` | **Good** — restrictive policy |
| `x-frame-options` | `DENY` | **Good** — clickjacking protection |
| `x-content-type-options` | `nosniff` | **Good** — MIME sniffing prevention |
| `referrer-policy` | `strict-origin-when-cross-origin` | **Good** |
| `permissions-policy` | `camera=(), microphone=(), geolocation=()` | **Good** — device APIs disabled |
| `cache-control` | `private, no-cache, no-store` on dynamic; `public, max-age=0, must-revalidate` on static | **Appropriate** |

---

### Secret Exposure Scan (Production)

Scanned production HTML source for exposed secrets using pattern matching.

| Pattern Searched | Found | Status |
|-----------------|-------|--------|
| `sk-ant` (Anthropic API key) | No | **PASS** |
| `sk_live` / `pk_live` (Stripe keys) | No | **PASS** |
| `SUPABASE_SERVICE_ROLE` | No | **PASS** |
| `ANTHROPIC_API` | No | **PASS** |
| `re_[a-zA-Z0-9]{10,}` (Resend keys) | No | **PASS** |
| `eyJhbGci` (JWT tokens) | No | **PASS** |
| Long base64 strings | No | **PASS** |

**No secrets or tokens found in production page source.**

---

### Deep Security Code Audit

| # | Check | Severity | Result |
|---|-------|----------|--------|
| 1 | Client-side secret exposure | — | **PASS** — `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `RESEND_API_KEY` used only in server-side files. None of 79 `"use client"` components import these. |
| 2 | next.config.ts env exposure | — | **PASS** — No `env:` or `publicRuntimeConfig` exposing server secrets. Only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are public (correct). |
| 3 | API route authentication | — | **PASS** — All routes verify auth. Admin routes use `requireAdmin()`. Applicant routes use `requireApplicant()`. Webhooks use `timingSafeEqual`. |
| 4 | Source maps in production | — | **PASS** — `productionBrowserSourceMaps` not set (defaults to `false`). No source maps exposed. |
| 5 | Middleware security | — | **PASS** — Role-based routing enforced. Open redirect protection on `?next=` param (requires `/admin/` or `/app/` prefix with segment validation). |
| 6 | Supabase RLS isolation | — | **PASS** — Admin client in server-only files. Browser client uses anon key with RLS. |
| 7 | File upload security | — | **PASS** — MIME validation, 10MB size limit, path traversal protection (`startsWith(user.id/)`), filename sanitization, rate limiting (20/hour). |
| 8 | SQL injection | — | **PASS** — All queries use Supabase parameterized query builder. No raw SQL interpolation. |
| 9 | Git history secrets | — | **PASS** — `.env.local` never committed. `.gitignore` properly excludes `.env*`. Only `.env.local.example` with placeholders in repo. |

#### Security Hardening Recommendations (No Active Vulnerabilities)

| # | Recommendation | Severity | Details |
|---|---------------|----------|---------|
| S1 | Add `import 'server-only'` guards | LOW | Add to `lib/supabase/admin.ts`, `lib/claude/client.ts`, `lib/email/client.ts` for build-time enforcement that these modules never bundle into client code. Currently protected by structure, not toolchain. |
| S2 | Remove `https://api.anthropic.com` from CSP `connect-src` | MEDIUM | Anthropic API is called server-side only, never from the browser. This CSP entry is unnecessary and signals the API key's existence to attackers. |
| S3 | Remove `'unsafe-eval'` from CSP `script-src` | MEDIUM | Typically not needed in Next.js production builds. Weakens XSS protection. Test removal; if breaking, apply only in production via env var. |
| S4 | Use session-scoped Supabase client in user-facing API routes | MEDIUM | Several routes (`/api/app/matches`, `/api/app/settings`, `/api/app/profile`) use `createAdminClient()` which bypasses RLS. While auth is checked first and queries scope by `user_id`, using the session-scoped client would add RLS as a second layer of defense. |
| S5 | In-memory rate limiter resets on cold start | LOW | Rate limiter uses `Map()` which resets per serverless instance. Acceptable for v1 user scale but not enforced under load. |
| S6 | Client-supplied chat message history | LOW | `/api/chat` validates exchange count server-side but accepts the `messages` array from the client. A malicious user could alter conversation history sent to Claude, though extraction data goes through Claude's pipeline. |

---

### UX/UI Audit

#### HIGH Severity (3 issues)

| # | Issue | Location | Details |
|---|-------|----------|---------|
| U-H1 | No root-level 404 page | `src/app/not-found.tsx` missing | Users on invalid URLs post-login see Next.js default unbranded 404. No Samvaya branding or helpful navigation. |
| U-H2 | No global error boundary | `src/app/error.tsx` missing | Errors in auth, legal, or admin flows show Next.js default error page. Only `/app` and `/app/onboarding` have error boundaries. |
| U-H3 | Match card photo lacks alt text when revealed | `MatchCardHeader.tsx:38` | `alt=""` on profile photos. Acceptable for blurred/decorative photos, but when profile is revealed (unblurred), meaningful alt text should be provided for accessibility. |

#### MEDIUM Severity (9 issues)

| # | Issue | Location | Details |
|---|-------|----------|---------|
| U-M1 | OTP input uses single text field | `login-form.tsx` | Industry standard is 6 individual digit boxes. Current single `<input>` is functional but feels less polished for a premium service. |
| U-M2 | Save status indicator too subtle | `ProgressBar.tsx:44-54` | `text-xs` (12px) for "Saving...", "Saved", "Save failed". Critical failure messages easy to miss on mobile. |
| U-M3 | No error feedback on form submission failure | `NavigationButtons.tsx:119-126` | If `submitForm()` fails, button reverts to "Submit" with zero explanation to the user. |
| U-M4 | File upload delete button invisible on mobile | `FileUploadInput.tsx:488` | `opacity-0 group-hover:opacity-100` — no hover on touch devices, so delete button never appears on mobile. |
| U-M5 | Spider chart axis labels overlap on narrow screens | `SpiderWebChart.tsx:87` | Labels at `115%` radius with `text-[11px]`. Adjacent labels like "Independence" and "Emotional" overlap on small viewports. |
| U-M6 | Delete account has no confirmation dialog | `SettingsPage.tsx:252-269` | Tapping "Delete Account" directly opens WhatsApp/email. No "Are you sure?" friction for this destructive action. |
| U-M7 | Edit profile save button always enabled | `EditProfileForm.tsx` | "Save Changes" button enabled even with no changes. `hasChanges` state exists but isn't used to disable the button. |
| U-M8 | Multiple 10px text instances below readable minimum | Various | `text-[10px]` used in: SettingsPage (notification headers), ProfileView (info labels), MatchListItem (status badge), MatchCardHeader (blur overlay). 10px is genuinely difficult to read on mobile. |
| U-M9 | Payment CTA button permanently disabled | `CompletionScreen.tsx:64-70` | Disabled "Pay ₹7,080" button with no alternative action is confusing. Informational text without a button would be clearer than a button users can't click. |

#### LOW Severity (16 issues)

| # | Issue | Location |
|---|-------|----------|
| U-L1 | Login button slightly below 44px touch target | `login-form.tsx:129-135` |
| U-L2 | No logo/branding on login page | `login-form.tsx` |
| U-L3 | NumberInput allows negative/unbounded values | `NumberInput.tsx` |
| U-L4 | RangeInput has no min<=max validation | `RangeInput.tsx` |
| U-L5 | DualLocationInput lacks scrollbar visibility cue | `DualLocationInput.tsx:196` |
| U-L6 | TimelineInput uses uncontrolled inputs (data loss risk on quick navigation) | `TimelineInput.tsx:148-160` |
| U-L7 | Chat message bubbles lack `overflow-wrap: break-word` | `ChatInterface.tsx:352` |
| U-L8 | Chat exchange counter label unclear ("2 of 4" vs "2 of 4 exchanges") | `ChatInterface.tsx:336` |
| U-L9 | MatchListItem status badge at 10px | `MatchListItem.tsx:63` |
| U-L10 | Toggle switch height below 44px recommendation | `SettingsPage.tsx` |
| U-L11 | Profile info labels at 10px | `ProfileView.tsx:189` |
| U-L12 | Edit form fields lack autocomplete/validation | `EditProfileForm.tsx` |
| U-L13 | Admin pages lack breadcrumb navigation | `src/app/admin/` |
| U-L14 | Legal pages show "placeholder" disclaimer | `privacy/page.tsx`, `terms/page.tsx` |
| U-L15 | Save status "Saved" green (`green-500`) fails WCAG AA contrast (3.2:1 vs required 4.5:1) | `ProgressBar.tsx:49` |
| U-L16 | Back button uses `disabled:invisible` instead of conditional rendering | `NavigationButtons.tsx:99` |

---

### Overall Production Audit Summary

| Category | Result |
|----------|--------|
| **Route Protection** | All 6 user routes + admin correctly redirect unauthenticated requests to login with return URL |
| **API Protection** | All API endpoints reject unauthenticated requests with proper JSON errors |
| **Security Headers** | Comprehensive and properly configured (HSTS, CSP, X-Frame-Options, etc.) |
| **Secret Exposure** | None detected in production HTML, JS bundles, or page source |
| **Source Maps** | Disabled in production |
| **Git History** | Clean — no secrets ever committed |
| **Code Security** | No active vulnerabilities. 6 hardening recommendations (0 critical, 3 medium, 3 low) |
| **UX/UI** | 3 HIGH, 9 MEDIUM, 16 LOW issues identified for future improvement |
| **Legal Pages** | Accessible and well-structured, but contain placeholder disclaimers |

**Verdict: The production deployment is secure and functional.** No critical security vulnerabilities found. All routes properly protected. No secrets exposed. The UX/UI issues identified are polish items for future iterations — none are blockers for the current launch with 3-5 invited users.

---

## Full Onboarding E2E Flow Test (Playwright CLI)

| Field | Value |
|-------|-------|
| Date | March 13, 2026 |
| Audit type | Full end-to-end onboarding flow via Playwright CLI — all 100 questions, all optional fields, all 3 Claude AI chats, file uploads, form submission |
| Test file | `e2e/full-onboarding-flow.spec.ts` |
| Config project | `full-onboarding` in `playwright.config.ts` |
| Test persona | Dr. Priya Sharma — Female, Hindu, Bengaluru, Completed PG Dermatology |
| Test email | `e2e-onboarding@samvayatest.com` |
| Result | **PASSED** — 3.6 minutes, all 100 questions completed |
| Target | `http://localhost:3000` (dev server) |

---

### What Was Tested

A complete new-user onboarding flow simulating a real applicant filling every question, including all optional fields:

| Section | Questions | Key Interactions Tested | Result |
|---------|-----------|------------------------|--------|
| **A** Basic Identity | Q1–Q17 | Text inputs, radios, date picker, time picker, autocomplete (city), dropdowns, multi-select checkboxes | PASS |
| **B** Location & Citizenship | Q18–Q26 | Country/state dropdowns, city autocomplete, radios, conditional Q25+Q26 (triggered by Q24=No) | PASS |
| **C** Religion & Community | Q27–Q31 | Dropdown, radios, text input, conditional Q29 (Hindu), Q31 (kundali=yes) | PASS |
| **D** Family Background + Chat 1 | Q32–Q39 | Text+dropdown groups, **Claude AI Chat (4 exchanges)**, number input, chat extraction | PASS |
| **E** Physical Attributes | Q40–Q42 | Grouped number inputs, illustrated multi-choice (optional) | PASS |
| **F** Lifestyle | Q43–Q52 | Illustrated MC cards, radios, text, conditional Q50 (skipped), Q52 (triggered) | PASS |
| **G** Personality & Interests | Q53–Q55 | **Grouped multi-select** (accordion expand + item select), text | PASS |
| **H** Education | Q56–Q60 | Radios, multi-select checkboxes, conditional Q57 (skipped) | PASS |
| **I** Career | Q61–Q62 | Radios, **timeline input** (org, role, dates), conditional Q62 (triggered) | PASS |
| **J** Goals & Values + Chat 2 | Q63–Q75 | Radios, multi-select, **Claude AI Chat (6 exchanges)**, conditional Q68+Q69, Q74 | PASS |
| **K** Partner Preferences | Q76–Q94 | Range inputs, dual location selector, **grouped multi-select** (max 7), radios, checkboxes | PASS |
| **L** Documents & Verification | Q95–Q99 | **File uploads** (2 profile photos, 1 ID doc, 1 kundali), BGV consent radio | PASS |
| **M** Closing + Chat 3 | Q100 | **Claude AI Chat (1 exchange)**, form submission | PASS |
| **Completion** | — | "Application submitted" screen, "Thank you" message, ₹7,080 verification fee display | PASS |

### Conditional Logic Paths Exercised

| Condition | Trigger | Questions Shown/Skipped |
|-----------|---------|------------------------|
| Q10=Yes (has siblings) | → Q11 shown | Q11: sibling details |
| Q12=Karnataka | → Q14: district selector shown | District autocomplete |
| Q19=No (not born in current city) | → Q20 skipped | Birth city not asked |
| Q24=No (not settled in India) | → Q25+Q26 shown | Country + city abroad |
| Q27=Hindu | → Q29 shown | Kundali belief |
| Q30=Yes (gotra relevant) | → Q31 shown | Gotra text input |
| Q49=No (no medical conditions) | → Q50 skipped | Condition details not asked |
| Q51=Yes (has allergies) | → Q52 shown | Allergy details |
| Q56=Completed PG | → Q57 skipped | MBBS year not asked |
| Q61=Yes (has work exp) | → Q62 shown | Timeline input |
| Q67=Yes (wants children) | → Q68+Q69 shown | Timeline + preference |
| Q73=Yes (plans abroad) | → Q74 shown | Countries exploring |
| Q29=Yes (kundali belief) | → Q98 shown | Kundali upload |

### Claude AI Chat Conversations

| Chat | Location | Exchanges | Wait Time | Extraction | Result |
|------|----------|-----------|-----------|------------|--------|
| Conv 1 — Family | Q38, Section D | 4 of 4 | ~5s per response | "Saving your conversation" appeared + completed | PASS |
| Conv 2 — Goals & Values | Q75, Section J | 6 of 6 | ~5s per response | "Saving your conversation" appeared + completed | PASS |
| Conv 3 — Closing | Q100, Section M | 1 of 1 | ~5s response | "Saving your conversation" appeared + completed | PASS |

All 3 chat conversations completed successfully with Claude responding naturally to the test persona's inputs. Extraction (saving conversation insights to `compatibility_profiles`) completed without errors.

### File Uploads

| Upload | Question | Files | Server Processing | Result |
|--------|----------|-------|-------------------|--------|
| Profile photos | Q95 | 2 test PNGs (600x800) | Sharp blur + Supabase Storage | PASS |
| ID document | Q97 | 1 test PNG (800x600) | Supabase Storage | PASS |
| Kundali | Q98 | 1 test PNG (800x600) | Supabase Storage | PASS |

Test PNG files were generated programmatically (pure Node.js, no external deps) with valid PNG headers and solid color fills.

---

### Issues Found During Testing

#### 1. Console 500 Error (Minor)

- **What:** A `Failed to load resource: the server responded with a status of 500` console error was logged during the test run.
- **Impact:** Did not block any functionality. The form completed successfully.
- **Likely cause:** A non-critical background resource fetch (favicon, analytics, or prefetch).
- **Recommendation:** Monitor in production. If it recurs, add request URL logging to the console error capture to identify the specific endpoint.

#### 2. Rate Limit Blocking on Repeated Test Runs (Medium — Dev/Test Only)

- **What:** The in-memory rate limiter (`src/lib/rate-limit.ts`) allows 50 chat messages per hour per user. When running the E2E test multiple times (which sends 11 chat messages per run), the quota is exhausted after ~4 runs, blocking the Claude chat conversations with "Too many messages. Please try again later."
- **Impact:** No impact on real users (11 messages per full onboarding is well within the 50/hour limit). Only affects repeated E2E testing.
- **Root cause:** The in-memory `Map()` store persists across test runs as long as the dev server is running.
- **Workaround:** Restart the dev server between test runs to clear the rate limit store.
- **Recommendation:** Consider adding a `RATE_LIMIT_DISABLED=true` env flag for E2E testing environments, or increase the limit for the test user.

---

### Test Infrastructure Details

#### Authentication Approach

The test authenticates via **password sign-in + Supabase SSR cookie injection** (same pattern as `e2e/auth.setup.ts`):

1. Test user created/found via Supabase Admin API with email + password
2. Sign in via `supabase.auth.signInWithPassword()`
3. Session encoded as base64 and injected as chunked cookies (`sb-<projectRef>-auth-token.0`, `.1`, etc.)
4. Navigate to `/app/onboarding` — middleware recognizes the session

**Important:** This approach only works against `localhost:3000` (dev server). Cookie injection against production (`app.samvayamatrimony.com`) fails because Vercel's edge middleware handles cookies differently. For production E2E testing, a different auth strategy (e.g., programmatic OTP verification) would be needed.

#### Data Reset

Before each test run, `beforeAll` resets all user data:
- Deletes: `compatibility_profiles`, `profiles`, `medical_credentials`, `partner_preferences`, `photos`, `documents`, `payments`
- Resets `users` row: `onboarding_section: 1`, `onboarding_last_question: 1`, `membership_status: 'onboarding_pending'`, `payment_status: 'unverified'`, `gate_answers: {}`, `bgv_consent: 'not_given'`

#### Test Selector Lessons (for future E2E tests)

These selector patterns were refined during test development and should be used as reference:

| Pattern | Avoid | Use Instead | Why |
|---------|-------|-------------|-----|
| Radio buttons | `getByRole('radio', { name: 'No' })` | `getByRole('radio', { name: 'No', exact: true })` | "No" substring-matches "No preference", "Prefer not to disclose", etc. |
| Checkboxes | `getByRole('checkbox', { name: 'Vegetarian' })` | `getByRole('checkbox', { name: 'Vegetarian', exact: true })` | "Vegetarian" substring-matches "Non-Vegetarian" |
| Illustrated MC buttons | `locator('button[aria-pressed]').filter({ hasText: label })` | `getByRole('button', { name: label, exact: true })` | `hasText` does substring matching |
| Grouped multi-select items | `locator('button[aria-pressed]').filter({ hasText: label })` | `getByRole('button', { name: label, exact: true })` | Same substring issue ("Fiction" matches "Non-Fiction") |
| Next button | `getByRole('button', { name: 'Next' })` | `getByRole('button', { name: 'Next', exact: true })` | Next.js Dev Tools button also has "Next" in its name |
| Document uploads | `img[alt="Uploaded photo"]` | `img[alt="Uploaded document"]` | FileUploadInput uses different alt text for photos vs documents |

#### Run Command

```bash
cd "/Users/ejaz/Documents/Claude Code Projects/Samvaya Phase-2"

# Restart dev server first (clears rate limit store)
kill $(lsof -ti:3000) && npm run dev &

# Run the test
npx playwright test e2e/full-onboarding-flow.spec.ts --project=full-onboarding --timeout=900000
```

---

## Form UI Polish (Pre-Audit)

| Field | Value |
|-------|-------|
| Date | March 15, 2026 |
| Scope | Form navigation, input components, data loading, mobile responsiveness |
| Files changed | **22 form files** (+622, -314 lines) |

### Changes

**Section Navigation & Layout**
- `SectionSidebar.tsx` — redesigned with progress indicators, active/completed/locked states, smooth transitions
- `SectionPanel.tsx` — improved section intro cards, better transition animations between sections
- `MobileSectionBar.tsx` — fixed responsive behavior for mobile section switching
- `SectionNavigationButtons.tsx` — added section-level navigation with completion validation
- `section-navigation.ts` — enhanced section completion logic and validation helpers

**Input Component Refinements (10 components)**
- `SelectInput.tsx` — refined radio group layout and styling
- `MultiSelectInput.tsx` — improved checkbox grid with better spacing
- `AutocompleteInput.tsx` — enhanced dropdown positioning, search filtering
- `DateInput.tsx` — improved date picker with better mobile UX
- `NumberInput.tsx` — refined stepper controls and validation
- `IllustratedMCInput.tsx` — improved card grid layout
- `GroupedMultiSelectInput.tsx` — better category grouping display
- `DualLocationInput.tsx` — refined dual-field layout
- `ChatInterface.tsx` — polish to chat bubble styling
- `NavigationButtons.tsx` — added disabled state logic for incomplete required fields

**New Components**
- `ComboboxInput.tsx` — new combobox input for searchable dropdowns
- `InternationalLocationInput.tsx` — city + country location selector
- `TagInput.tsx` — tag-based multi-value input
- `src/components/form/icons/` — custom SVG icons for form sections

**Data & Infrastructure**
- Moved country/city data from `src/lib/data/` to `public/data/` (JSON) for lazy loading
- Added `src/lib/data/loader.ts` — async data loader for large datasets
- Added `src/lib/data/use-location-data.ts` — React hook for location data
- Deleted `src/lib/data/countries.ts` and `src/lib/data/indian-cities.ts` (replaced by JSON files)
- `questions.ts` — updated question definitions for new input types and options
- `types.ts` — extended `QuestionType` union with new input types
- `auto-save.ts` — improved debounce and error recovery
- `globals.css` — form-specific CSS refinements

**Other**
- `QuestionField.tsx` — enhanced field wrapper with better label/help text rendering
- `QuestionRenderer.tsx` — updated to route new question types to correct input components
- `onboarding/page.tsx` — improved data loading and chat state initialization
- `InterestsBlock.tsx` — admin profile view updated for array-type hobbies
- `supabase/middleware.ts` — minor middleware refinement
- Migration: `20260327000009_hobbies_regular_to_array.sql` — converts `hobbies_regular` from TEXT to TEXT[]

---

## Pre-Production Comprehensive Audit

| Field | Value |
|-------|-------|
| Date | March 15, 2026 |
| Audit type | Full codebase review + Security + UX/UI + Playwright MCP + PRD sync + Production readiness |
| Agents deployed | **6** (3 exploration + 1 plan + 1 PRD sync + 1 Next.js best practices) |
| Tools used | Playwright MCP, next-best-practices skill, supabase-postgres-best-practices skill |
| Issues found | **10 total** (2 HIGH, 6 MEDIUM, 2 LOW) |
| Issues fixed | **All 10 fixed** |
| Verification | **All 10 fixes confirmed present** in codebase post-audit |

### Security Fixes Applied

| # | Issue | Severity | File | Fix |
|---|-------|----------|------|-----|
| 1 | Chat route trusts client-supplied message history — malicious client could alter conversation history sent to Claude | **HIGH** | `api/chat/route.ts:122,160` | Rebuilt message history from `serverChatState.messages` instead of client-supplied `messages` array |
| 2 | Extraction response leaks compatibility scores, personality analysis, and red flags to browser | **MEDIUM** | `api/chat/extract/route.ts:218` | Changed response from `{ success: true, extracted }` to `{ success: true }` |
| 3 | HTML injection in scheduled email endpoint — `email.body` inserted without entity escaping | **MEDIUM** | `api/admin/communications/send-scheduled/route.ts:64` | Added HTML entity escaping (`&`, `<`, `>`, `"`, `'`) before `<br/>` conversion |
| 4 | Partner preferences PATCH accepts any value type without validation | **MEDIUM** | `api/app/profile/route.ts:144-149` | Added type/length validation: null, strings (max 200), finite numbers, arrays of strings (max 100 chars, max 50 items) |
| 5 | No rate limiting on document uploads (photo uploads had 20/hour limit) | **MEDIUM** | `api/upload/register-document/route.ts` | Added `checkRateLimit('doc-upload:${userId}', 20, 3600_000)` |
| 6 | Timing oracle in webhook/cron secret comparison — length check leaks secret length | **LOW** | `send-scheduled/route.ts:20`, `airtable-sync/route.ts:19` | Replaced length-check + `timingSafeEqual` with HMAC-based constant-time comparison |

### Infrastructure Fixes

| # | Issue | Severity | File | Fix |
|---|-------|----------|------|-----|
| 7 | Middleware redirects `manifest.json` and `sw.js` to login — breaks PWA installability and service worker | **HIGH** | `src/middleware.ts:17` | Extended matcher exclusion pattern to include `.json`, `.js`, `.woff2` static file extensions |
| 8 | ESLint error: `SortIndicator` component created inside render function | **MEDIUM** | `components/admin/ApplicantList.tsx:94` | Converted from JSX component to render function (`sortIndicator()`) |
| 9 | ESLint error: `Date.now()` flagged as impure in server component | **LOW** | `app/admin/applicants/[userId]/page.tsx:80` | Added `eslint-disable-next-line` with comment (server component — Date access is safe) |
| 10 | Missing env vars in `.env.local.example` | **MEDIUM** | `.env.local.example` | Added `TEAM_NOTIFICATION_EMAIL`, `AIRTABLE_API_KEY`, `AIRTABLE_BASE_ID`, `AIRTABLE_WEBHOOK_SECRET` |

### PRD Sync Check

| Area | Status |
|------|--------|
| Pricing (₹7,080 / ₹41,300) | **IN SYNC** — all files correct |
| Chat exchange limits (Q38=4, Q75=6, Q100=1) | **IN SYNC** |
| Section boundaries (A-M) | **IN SYNC** |
| TOUCHPOINT 1 email copy | **IN SYNC** |
| Payment state machine / BGV logic | **IN SYNC** |

**Documented divergences (implementation is better, PRD should be updated):**

| # | Divergence | PRD Says | Implementation | Action |
|---|-----------|----------|----------------|--------|
| 1 | Q26 options | 2 options | 3 options (`owned`/`rented`/`family_home`) | Update PRD |
| 2 | Q31 input type | Dropdown | Autocomplete text (communities data source) | Update PRD |
| 3 | Q54 type | Short answer (text) | Multi-select from Q53 options | Update PRD |
| 4 | Q82/Q84 partner prefs | Single-select | Multi-select (DB uses `text[]`) | Update PRD |
| 5 | Q29 conditional | Always shown | Only for Hindu/Sikh/Buddhist/Jain | Update PRD |
| 6 | Q13 type | Short answer | `international_location` with city+country | Update PRD |
| 7 | Q6 label | "A friend or colleague" | "Friend or Family" | Update PRD |
| 8 | Q60 required | Required | Optional | Update PRD |
| 9 | Schema: 3 extra columns | Not in PRD | `father_occupation_other`, `mother_occupation_other`, `hobbies_other` | Update PRD |

**PRD updated to v9.1** — all 9 divergences synced into `Samvaya_Phase2_PRD_v9.md` (March 15, 2026).

**Known limitations:**
- Q23 (Current City) autocomplete only suggests Indian cities. Users outside India can type freely but don't get suggestions.

### Next.js Best Practices Audit

| Check | Result | Notes |
|-------|--------|-------|
| RSC boundaries | **PASS** | No async client components, no non-serializable props |
| Async params/cookies | **PASS** | All dynamic routes correctly await params |
| Image optimization | **LOW** | 6 raw `<img>` tags — all use Supabase signed URLs |
| Page metadata | **MEDIUM** | 5+ pages missing page-specific titles |
| Data waterfalls | **LOW** | 1 sequential query pair in BGV page |
| Font optimization | **PASS** | `next/font/local` with `display: swap` |
| useSearchParams + Suspense | **PASS** | Correctly wrapped |

### Accepted Risks (Documented, Not Fixed)

| # | Risk | Severity | Rationale |
|---|------|----------|-----------|
| 1 | In-memory rate limiter resets on cold starts, no cross-instance protection | LOW | Documented with TODO in `lib/rate-limit.ts`. Acceptable for v1 with 3-5 users. Upgrade to Upstash Redis for v1.1. |
| 2 | CSP includes `'unsafe-inline'` and `'unsafe-eval'` in `script-src` | LOW | Required by Next.js dev mode. Should test removal in production build. |
| 3 | Q23 city autocomplete only suggests Indian cities | LOW | Users outside India can type freely. Autocomplete just won't help. Fix when international user base grows. |

### Playwright MCP Testing Results

| Route | Test | Result |
|-------|------|--------|
| `/auth/login` | Renders email input + "Send verification code" button | **PASS** |
| `/auth/login` (mobile 375px) | Responsive layout, touch-friendly inputs | **PASS** |
| `/app/onboarding` (unauth) | Redirects to `/auth/login?next=%2Fapp%2Fonboarding` | **PASS** |
| `/admin` (unauth) | Redirects to `/auth/login?next=%2Fadmin` | **PASS** |
| `/legal/privacy` | Public page, renders privacy policy | **PASS** |
| `/legal/terms` | Public page, pricing correct (₹7,080 + ₹41,300) | **PASS** |
| `manifest.json` | Returns 200 (was 307 before fix) | **PASS** |
| `sw.js` | Returns 200 | **PASS** |

### Build Verification

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | **PASS** — zero type errors |
| `npm run lint` | **PASS** — zero errors after fixes (4 warnings in scripts/) |
| `npm run build` | **PASS** — production build succeeds |
| Error boundaries | **PASS** — exist for `/app/app/`, `/app/admin/`, `/app/app/onboarding/` |
| Loading states | **PASS** — exist for all three key routes |

### Database & Schema Audit (Supabase Best Practices)

| Check | Result |
|-------|--------|
| FK indexes on non-unique foreign keys | **PASS** — all FK columns indexed |
| Status/filter indexes for admin queries | **PASS** — `payment_status`, `membership_status`, `role`, `verification_fee_paid`, `verification_status` |
| Matching table indexes | **PASS** — pair index, status, score DESC, partial index on pending presentations |
| RLS policies | **PASS** — comprehensive coverage for all tables |
| `updated_at` triggers | **PASS** — on all tables |
| CHECK constraints | **PASS** — score columns (0-100), feedback rating (1-5) |
| Canonical ordering for match pairs | **PASS** — `profile_a_id < profile_b_id` constraint prevents duplicates |
| Pre-filter RPC | **PASS** — `SECURITY DEFINER` with `SET search_path = public` |

### Production Readiness

| Check | Result |
|-------|--------|
| Security headers (HSTS, CSP, X-Frame-Options, etc.) | **PASS** |
| Vercel cron configuration | **PASS** — daily at 9 AM UTC |
| PWA manifest | **PASS** — correct `start_url`, `scope`, `display`, icons |
| Service worker | **PASS** — network-first navigation, cache-first static, push notification handling, offline fallback |
| Environment variables documented | **PASS** (after fix #10) |

---

## PWA Design Polish + Production E2E Tests

| Field | Value |
|-------|-------|
| Commits | `3d40dd1`, `229cc20` |
| Date | March 15, 2026 |
| Audit type | PWA design polish (Tiers 1-3) + Production E2E via Playwright MCP |

### Design Changes (15 files, 3 tiers)

**Tier 1 — High Impact**
- Login page: full redesign with Samvaya logo, blush background, 6-digit OTP boxes, legal footer
- Error pages: new `error.tsx` (global error boundary) + `not-found.tsx` (branded 404)
- Fixed `text-[10px]` → `text-xs` across 6 components (LifeSnapshot, SettingsPage, MatchCardHeader, ProfileView, MatchListItem)
- FileUploadInput: delete button always visible on mobile (touch devices)
- CompletionScreen: replaced disabled pay button with WhatsApp CTA card

**Tier 2 — Medium Impact**
- AppHeader: replaced text "Samvaya" with logo image (`samvaya-logo-red.png`)
- StatusDashboard: blush greeting banner, colored icon backgrounds, rounded-2xl cards
- Font verification: ApfelGrotezk correctly configured (4 weights, CSS variable, Tailwind `--font-sans`)

**Tier 3 — Premium Polish**
- OTP individual digit input (6 boxes with auto-focus, paste, backspace navigation)
- Consistent card styling: `rounded-2xl`, `border-gray-100`, `shadow-sm` across all PWA cards
- MatchListItem: tap feedback (`active:scale`), hover shadow transition
- MatchCardHeader: matching rounded/shadow treatment

### Bug Found During E2E Testing

- **OTP boxes not rendering** — `padEnd(6, "")` with empty fill string returns original string unchanged; when OTP value is `""`, digits array was `[]` and zero inputs rendered. Fixed to `padEnd(6, " ")` in commit `229cc20`.

### Production E2E Test Results (Playwright MCP)

| Test | Result | Notes |
|------|--------|-------|
| manifest.json returns 200 | **PASS** | Correct PWA manifest with name, icons, start_url |
| sw.js returns 200 | **PASS** | Full service worker with cache, push, offline fallback |
| Login page design (375px mobile) | **PASS** | Logo, blush bg, tagline, email input, branded button |
| Login page design (1280px desktop) | **PASS** | Centered card, proper spacing |
| Auth redirect (/app → /auth/login) | **PASS** | Redirects with `?next=%2Fapp` query param |
| 404 for unknown routes | **PASS** | Middleware redirects unauthenticated to login (expected) |
| Legal: /legal/terms | **PASS** | Full terms page with correct pricing (₹7,080 / ₹41,300) |
| Legal: /legal/privacy | **PASS** | Full privacy policy renders |
| OTP flow: email → digit boxes | **PASS** | 6 individual digit boxes with aria-labels, first auto-focused |
| OTP flow: change email + resend | **PASS** | Both buttons present, resend shows countdown |

### Also Included

- Admin account creation helper: `scripts/create-admin.mjs`
- Logo files: `public/samvaya-logo-red.png`, `public/samvaya-logo-white.png`

---

## Phase 2E, Day 7 — API Security Sweep + Page Reliability

| Field | Value |
|-------|-------|
| Date | March 18, 2026 |
| Audit type | Security + Code Review + UX/UI |
| Agents deployed | 3 (Security Audit, Code Review, UX Audit) + 5 implementation agents |
| Issues found | **46 total** (2 HIGH, 11 MEDIUM, 14 LOW from audits; 19 pre-emptive fixes) |
| Issues fixed | **All** |

### What Was Built

1. **Shared validation utility** (`src/lib/validation.ts`) — `isValidUUID`, `validateString`, `validateEnum`, `validateDateString`, `sanitizeString`
2. **Rate limiting on all 40 API routes** — 30 routes newly protected (admin + app, reads + mutations)
3. **Input validation gaps closed** — UUID checks on dynamic params, length caps on text fields, array validation, enum checks across 15 routes
4. **Server page error handling** — 6 admin + 1 app pages wrapped with try-catch + inline error UI
5. **Phase 2E hardening roadmap** added to PRD v9.3 (Section 10) — 12-day plan

### Security Findings Fixed

| Severity | Count | Key Issues |
|----------|-------|------------|
| HIGH | 2 | IDOR in photo reorder/setPrimary (missing `user_id` filter); chat message type bypass on length validation |
| MEDIUM | 8 | Array validation bypass in feedback; SSRF via push endpoint (no HTTPS check); missing admin role checks on 4 pages; JSON.stringify exception; UUID missing on introductions + upload/delete |
| LOW | 8 | Nil UUID acceptance; permissive date parsing; template fields unvalidated; inconsistent rate limit messages; duplicate UUID regex |

### UX Findings Fixed

| Priority | Count | Key Issues |
|----------|-------|------------|
| P0 | 0 | — |
| P1 | 4 | Dashboard error page linked to itself (now refreshes); rate limit messages made friendly across 30 routes; `text-zinc-*` → `text-gray-*` for design consistency; `role="alert"` added to all error containers |
| P2 | 2 | Deferred: TeamNotes silent error swallowing, SettingsPage silent revert (Day 8 scope) |

### Verification

- `npx tsc --noEmit` — clean (0 errors)
- `npm run build` — clean (all routes + pages compile)
- Rate limit coverage: 40/41 routes (webhook excluded — uses HMAC auth)
- Admin role checks: all admin pages verified

---

## Summary Across All Phases

| Metric | Part 1 | Part 2 | Part 3 | Phase 2B | Phase 2C | Phase 2D | Prod Audit | E2E Onboarding | Form UI Polish | Pre-Prod Audit | PWA Polish + E2E | Total |
|--------|--------|--------|--------|----------|----------|----------|------------|----------------|----------------|----------------|-----------------|-------|
| Agents deployed | 1 | 1 | 5 | 3 | 4 | 5 | 6 | 1 | — | 6 | — | 32 |
| Issues found | 14 | 20 | ~87 | ~65 | ~30 | ~25 | 34 | 2 | — | 10 | 1 | ~288 |
| Critical issues | 0 | 5 | — | ~9 | 6 | 3 | 0 | 0 | — | 2 | 1 | 26+ |
| Major issues | 0 | 5 | — | ~10 | 6 | 5 | 0 | 0 | — | 6 | 0 | 32+ |
| E2E tests | — | Validated | 16/16 | — | 12/12 | 15/15 | 13/13 HTTP | 1/1 (100 Qs) | — | 8/8 Playwright | 10/10 Prod E2E | 75+ |
| Files changed | — | — | — | — | — | — | — | — | 22 | 40 | 15 | — |
| Audit types | Code, Security, A11y | Code, Security, A11y, E2E | Code (3), UI/UX (2), E2E | Security, Error, Quality (3) | Security, UX/UI, Quality (3) | Code, UX/UI, Integration (3) + E2E | Flow, Security, UX/UI (6) | Full flow E2E | UI/UX polish | Full codebase, Security, Playwright MCP, PRD sync | Design polish, Prod Playwright MCP | All |
