# Samvaya Phase 2 — Master Plan & Status Tracker

> **Last updated:** March 27, 2026 (end of session)
> **Purpose:** Single source of truth for what's done, what's pending, and what to work on next. Updated after every session. New Claude Code sessions should read this file to understand context.

---

## Current Focus

**Admin Dashboard structural overhaul** — completed in this session. User-facing PWA design work remains paused. Next priorities: applicant detail page improvements and remaining admin workflow gaps.

---

## Overall Architecture

| Layer | Status |
|-------|--------|
| Database (23 tables, 22 migrations, RLS) | DONE |
| Auth (email OTP, role-based routing, middleware) | DONE |
| API Routes (42 total, all with auth + rate limiting) | DONE |
| Email System (Resend, templates in DB, event-driven) | DONE |
| PWA Config (manifest, service worker, offline page) | DONE |
| Vercel Config (Mumbai region, CSP headers, cron) | DONE |
| E2E Tests (7 suites, critical flows covered) | DONE |
| Daily Snapshots (KPI trend tracking) | DONE — new table + API |

---

## 1. Onboarding Form (100 Questions, 13 Sections)

### Status: DONE (functional) — temporarily all fields optional for testing

All 13 sections (A-M) complete. 22 input component types. Auto-save, conditional logic (27 rules), save-and-resume, Claude chat integration (Q38, Q75, Q100 in Section M), form submission with email notifications.

### Temporary Testing State (MUST RESTORE before launch)
- All `required: true` fields set to `required: false` (82 questions)
- All `minFiles` set to 0 (photos, documents)
- GuidedPhotoUpload slots set to optional
- ChatInterface has "Skip conversation" button

---

## 2. Admin Dashboard

### Status: MAJOR OVERHAUL COMPLETED this session

### What was built/changed today (March 27):

**Dashboard Home (`/admin`) — 5-row command center:**
- Row 1: 10 KPI cards with trend sparklines + "% vs 7d ago" (powered by `daily_snapshots` table)
- Row 2: Horizontal flowing wave funnel (SVG area chart with stage labels + conversion %)
- Row 3: Alerts with one-click actions (1/3 width) + Donut chart distribution tabs (2/3 width) — Location/Education/Age/Gender
- Row 4: Match Command Center — 4 stage cards + side-by-side profile comparison cards with expandable detail (spider chart + highlights/concerns)
- Row 5: Activity feed (1/3 width) + Recent Communications (2/3 width)
- 11 new components in `src/components/admin/dashboard/`

**Sidebar:** Collapsible with toggle (persists in localStorage). Settings pinned to bottom, separated from main nav.

**Analytics page (`/admin/analytics`):**
- Vertical narrowing trapezoid funnel (SVG)
- Conversion rates show actual numbers ("X of Y") + capped at 100%
- Stage duration shows "X applicants" instead of "n=X"

**Matching page (`/admin/matching`):**
- Interactive spider chart (500px SVG) with scores at each axis — no clicking needed
- Chart takes 2/3 width, highlights + concerns + narrative stacked in 1/3
- Dimension score bars removed — spider chart is the primary visualization
- Highlights/concerns in colored cards (green/red) with improved visibility

**Verification page (`/admin/verification/[userId]`):**
- "Set All To" bulk dropdown + "Save All Changes" button
- Individual edits still work for fine-tuning

**Activity Log (`/admin/activity`):**
- JSON metadata → human-readable text (e.g., "Changed Criminal Records to In Progress")

**Communications (`/admin/communications`):**
- Inline template editing in Send tab (Edit button next to preview, saves via PATCH)

**Settings/Profile:**
- Per-user pricing override on applicant detail page (custom amount + "Complementary" checkbox)

**Infrastructure:**
- `daily_snapshots` table (migration `20260327000011`) for KPI trend tracking
- `POST /api/admin/snapshots` — capture daily snapshot (Vercel cron or manual)
- `GET /api/admin/snapshots` — retrieve last N days
- `formatDateIN()`, `formatDateTimeIN()`, `timeAgo()`, `daysSince()` utilities in `src/lib/utils.ts`
- All dates across admin use DD-MM-YYYY (Indian format)
- Desktop-only layout (max-w-[1600px], no mobile responsiveness)

**Seed data:** 15 test applicants at various pipeline stages, 8 waitlist entries, 3 match suggestions, activity logs, communications. Seed script at `scripts/seed-dashboard.mjs`. Temporary seed API at `src/app/api/admin/seed/route.ts` (DELETE after testing).

**Test user for admin access:** `maheenejaz@goocampus.in` has admin role set.

### Pages & Features

| Feature | Route | Status |
|---------|-------|--------|
| Dashboard Home | `/admin` | **REBUILT** — 5-row command center with KPI trends, wave funnel, donut charts, match command center, activity feed, comms |
| Applicant List | `/admin/applicants` | DONE — **STILL NEEDS** in-progress applicant tab |
| Applicant Detail | `/admin/applicants/[userId]` | DONE — **STILL NEEDS** document viewer, conversation transcripts, inline email |
| Verification Queue | `/admin/verification` | DONE |
| BGV Tracker | `/admin/verification/[userId]` | **UPGRADED** — bulk update + save button |
| Matching — Suggestions | `/admin/matching` | **UPGRADED** — spider chart with scores, 2/3+1/3 layout |
| Matching — Presentations | `/admin/matching/presentations` | DONE |
| Matching — Introductions | `/admin/matching/introductions` | DONE |
| Matching — History | `/admin/matching/history` | DONE |
| Analytics | `/admin/analytics` | **UPGRADED** — vertical funnel, conversion rates with numbers, clearer stage timing |
| Communications | `/admin/communications` | **UPGRADED** — inline template editing in Send tab |
| Activity Log | `/admin/activity` | **UPGRADED** — human-readable metadata |
| Settings | `/admin/settings` | DONE + per-user pricing on profile page |

### Still Pending (next session priorities)

| # | Item | Description |
|---|------|-------------|
| 1 | **In-progress applicant tab** | Applicant list needs a tab for `membership_status = 'onboarding_in_progress'` showing section/progress |
| 2 | **Document viewer on profile** | Fetch + display uploaded identity docs (Aadhaar/passport) with signed URLs |
| 3 | **Conversation transcript viewer** | Parse + render `raw_conversation_transcript` as readable chat bubbles |
| 4 | **Send email from profile** | Inline email form on applicant detail page |
| 5 | **Communication history on profile** | List all emails sent to this applicant |
| 6 | **Verification page search/sort** | Add name search and sortable columns |

---

## 3. User-Facing PWA

### Status: DONE (functional) — design overhaul paused

All 9 pages functional: Dashboard, Profile (view/edit), Photo Manager, Matches (list/detail/feedback), Settings, Onboarding.

### Phase 2F Design Overhaul — PAUSED
Design tokens complete (Urbanist font, glassmorphism, buttons, badges). Card-by-card iteration paused at Card 1. Will resume after admin dashboard is fully ready.

---

## 4. Matching Algorithm — DONE

Pre-filter SQL, Claude API scoring, suggestion queue, admin review, presentations, response tracking, mutual interest detection, introduction scheduling.

---

## 5. Integration & Infrastructure — DONE

Airtable sync (one-way, Supabase → Airtable), Resend email, Claude API, Supabase Auth (email OTP), Supabase Storage (photos + blur), Push notifications (VAPID), Rate limiting (in-memory).

---

## Priority Queue — What to Work on Next

### Next session
1. Applicant detail page: document viewer, conversation transcripts, inline email, communication history
2. Applicant list: in-progress tab with section/progress tracking
3. Verification page: search + sort

### After admin is ready
4. Restore form required fields (undo temporary testing changes)
5. Delete seed data + seed script + seed API route
6. End-to-end test: invite 3-5 real users, watch them fill the form, process in admin

### Later (paused)
7. Phase 2F design overhaul (all pages — user + admin)
8. Redis rate limiting (when user volume justifies it)

---

## Decisions Log

| Date | Decision | Context |
|------|----------|---------|
| Mar 27 | Pause user-facing PWA design work | Focus on admin dashboard production readiness |
| Mar 27 | Claude chats confirmed in Section M | Grouped at end of form, not inline. PRD v9.4. |
| Mar 27 | Form fields temporarily optional | For testing. Must restore before launch. |
| Mar 27 | Admin dashboard rebuilt as 5-row command center | Desktop-only, DD-MM-YYYY dates, 11 new components |
| Mar 27 | Daily snapshots table for KPI trends | Captures counts daily, enables sparklines + "% vs 7d ago" |
| Mar 27 | Spider chart replaces dimension score bars | Scores visible at each axis, no clicking needed. 2/3 width on matching page. |
| Mar 27 | Collapsible sidebar + Settings at bottom | Persists in localStorage. Settings separated from main nav. |
| Mar 27 | BGV bulk update + save | "Set All To" dropdown + "Save All Changes" button |
| Mar 27 | Per-user pricing + complementary option | On applicant detail page, not global settings |
| Mar 27 | Airtable sync is one-way only | Supabase → Airtable. Two-way would risk data integrity. |
| Mar 27 | Email templates are DB-stored, not Resend-approved | Can be edited freely without affecting deliverability |
| Mar 27 | maheenejaz@goocampus.in set as admin | For founder to test admin dashboard in browser |

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Build context, locked decisions, rules |
| `plan.md` | This file — status tracker |
| `design.md` | Phase 2F design direction |
| `Samvaya_Phase2_PRD_v9.md` | Full product spec (v9.4) |
| `src/app/admin/page.tsx` | Admin dashboard home (5-row command center) |
| `src/components/admin/dashboard/` | 11 dashboard components (PipelineFunnel, DistributionBarChart, DistributionTabs, AlertsList, MatchCommandCenter, MatchStageCard, MatchTable, MatchRowDetail, ActivityFeed, RecentComms, InteractiveSpiderChart) |
| `src/components/admin/AdminSidebar.tsx` | Collapsible sidebar with Settings at bottom |
| `src/components/admin/MetricCard.tsx` | KPI card with trend + sparkline support |
| `src/app/api/admin/snapshots/route.ts` | Daily snapshot capture + retrieval API |
| `supabase/migrations/20260327000011_create_daily_snapshots.sql` | Daily snapshots table |
| `scripts/seed-dashboard.mjs` | Test data seed script (DELETE after testing) |
| `src/app/api/admin/seed/route.ts` | Temp seed API route (DELETE after testing) |
