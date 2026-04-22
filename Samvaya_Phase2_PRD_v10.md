# Samvaya Phase 2 — Product Requirements Document (PRD)

**Version:** 10.0
**Date:** April 3, 2026
**Status:** Confidential — GooCampus / Samvaya
**Scope:** Complete consolidated specification reflecting all changes through Phase 2F

> This document is the single authoritative reference for the Samvaya platform. It consolidates all changes from PRD versions 9.0 through 9.5, all phases 2A–2F, and reflects the actual built state of the product as of April 2026. Use it as the primary context source for all AI-assisted work on this project.

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Current Build State](#2-current-build-state)
3. [Tech Stack & Architecture](#3-tech-stack--architecture)
4. [Pricing & Payment](#4-pricing--payment)
5. [Database Schema](#5-database-schema)
6. [Onboarding Form](#6-onboarding-form)
7. [AI Onboarding Conversations](#7-ai-onboarding-conversations)
8. [Background Verification (BGV)](#8-background-verification-bgv)
9. [Matching Algorithm](#9-matching-algorithm)
10. [Admin Dashboard](#10-admin-dashboard)
11. [User-Facing PWA](#11-user-facing-pwa)
12. [Phase 2F Design Direction](#12-phase-2f-design-direction)
13. [Infrastructure & Integrations](#13-infrastructure--integrations)
14. [Security & Privacy](#14-security--privacy)
15. [Pre-Launch Checklist](#15-pre-launch-checklist)
16. [Locked Rules — Never Break](#16-locked-rules--never-break)
17. [Key Files Reference](#17-key-files-reference)

---

## 1. Product Overview

### 1.1 What Samvaya Is

Samvaya is a premium matrimony platform exclusively for medical professionals in India. It is not a search-and-browse platform — it is a curated, human-reviewed matchmaking service where every profile is verified, every match is hand-selected, and the team is involved throughout the process.

**Target audience:** Indian doctors — MBBS graduates, PG residents, consultants, specialists. The community is niche by design. Medical professionals share a specific set of life circumstances — gruelling training, irregular hours, high career stakes, frequent relocation — that make generic matrimony platforms a poor fit.

**What makes Samvaya different:**
- Every member is a medical professional (no exceptions)
- Every member undergoes a 13-point background verification
- Matches are not algorithmic suggestions — they are team-reviewed, curated, and presented with a written rationale
- The AI is used as a tool by the team, not as an autonomous matchmaker
- Payment is only requested after both parties have independently said yes to a specific match
- GooCampus members (existing paying clients) have the verification fee waived

### 1.2 Founders

Founded by **Ashwini, Santosh, and Ejaz**. Built on GooCampus infrastructure and leveraging GooCampus's existing relationship with medical professionals across India.

### 1.3 What Phase 2 Accomplishes

Phase 2 transitions Samvaya from a waitlist to a fully operational matchmaking platform:

1. A detailed 100-question onboarding form capturing everything needed for matching
2. Three embedded AI conversations (Claude API) capturing nuanced compatibility signals
3. A matching algorithm scoring compatibility using structured form data + AI conversation data
4. An admin dashboard (desktop-first) for the team to manage the entire operation
5. A user-facing PWA (mobile-first) for applicants to fill the form, track status, and view matches

---

## 2. Current Build State

### 2.1 Phase Completion Status

| Phase | Scope | Status |
|-------|-------|--------|
| **2A** | Onboarding form + Database schema + Admin dashboard (initial) | **COMPLETE** |
| **2B** | Matching algorithm (AI-powered scoring + feedback loop) | **COMPLETE** |
| **2C** | User-facing PWA (mobile-first, installable) | **COMPLETE** |
| **2D** | PWA polish: pause/resume, notification prefs, edit profile, push notifications, photo management, introduction scheduling | **COMPLETE** |
| **2E** | Code hardening: security sweep, accessibility, E2E tests, performance, production deployment | **COMPLETE** |
| **2F** | Admin dashboard structural overhaul + premium design + launch prep | **IN PROGRESS** |

### 2.2 What Is Production-Ready

- Database schema: 23 tables, 22 migrations, full RLS
- Auth system: email OTP, role-based routing, middleware
- API routes: 42 total, all with auth + rate limiting
- Onboarding form: 100 questions, 13 sections, 3 AI chats, auto-save, conditional logic
- Admin dashboard: fully rebuilt as 5-row command center (Phase 2F)
- Matching algorithm: pre-filter SQL, Claude scoring, suggestion queue, presentations, feedback
- User-facing PWA: all 9 pages functional
- Email system: Resend, DB-stored templates, event-driven notifications
- Airtable one-way sync
- E2E tests: 7 suites, all passing
- Vercel deployment: Mumbai region, CSP headers, cron jobs
- Daily snapshots table for KPI trend tracking

### 2.3 Temporary Testing State (Must Restore Before Launch)

The following were changed temporarily for load testing. **Must be reverted before real applicants are invited:**

- All `required: true` form fields set to `required: false` (82 questions)
- All `minFiles` set to 0 (photos, documents)
- GuidedPhotoUpload slots set to optional
- ChatInterface has "Skip conversation" button enabled
- 15 seed applicants in the database (plus 8 waitlist entries, 3 match suggestions)
- Temporary seed API route at `/api/admin/seed` must be deleted

### 2.4 Pending Before Launch (Admin)

| # | Item |
|---|------|
| 1 | Applicant detail page: document viewer (fetch + display Aadhaar/passport with signed URLs) |
| 2 | Applicant detail page: conversation transcript viewer (parse `raw_conversation_transcript` as chat bubbles) |
| 3 | Applicant detail page: send email inline + communication history list |
| 4 | Applicant list: in-progress tab with section/progress tracking for `onboarding_in_progress` users |
| 5 | Verification page: name search + sortable columns |

---

## 3. Tech Stack & Architecture

### 3.1 Stack (Locked — No New Dependencies Without Founder Approval)

| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | Next.js 14+ (App Router), TypeScript | Single codebase, admin + user |
| Styling | Tailwind CSS | Phase 2F tokens in `globals.css` |
| Database | Supabase (PostgreSQL + Auth + Storage + Realtime) | Source of truth |
| Team interface | Airtable (synced from Supabase) | Read-only; never write structural data here |
| AI | Anthropic Claude API — `claude-sonnet-4-20250514` | **Model ID is locked — never swap silently** |
| Payments | **v1: Manual flag only.** Razorpay = v2 (deferred) | Team collects offline, sets `verification_fee_paid = true` |
| Hosting | Vercel | Mumbai region, CSP headers, cron |
| SMS | MSG91 | OTP delivery, notifications |
| Email | Resend | Transactional; templates stored in DB |
| BGV | Third-party provider | 13 checks per applicant |

### 3.2 Architecture

```
app.samvayamatrimony.com/app/*     → User-facing PWA (mobile-first)
app.samvayamatrimony.com/admin/*   → Admin dashboard (desktop-first)
app.samvayamatrimony.com/api/*     → API routes (42 total)
app.samvayamatrimony.com/legal/*   → Static legal pages

samvayamatrimony.com + www         → Framer (marketing site)
apply.samvayamatrimony.com         → Netlify (Phase 1 waitlist, closed)
Vercel fallback: samvaya-phase2.vercel.app
```

- Admin and user share a single Next.js codebase on Vercel
- Route differentiation by path prefix (`/admin/*` vs `/app/*`)
- Middleware enforces auth + role — unauthorized access is redirected
- Admin: desktop-optimized layout, sidebar, wide tables, charts (max-w-[1600px], no mobile)
- User PWA: mobile-optimized, bottom nav, card-based, installable

### 3.3 Supabase → Airtable Sync

All structural data lives in Supabase. A one-way sync pushes relevant fields to Airtable for the team to view, filter, and annotate without touching the source database.

**Critical rule:** Never write structural applicant data into Airtable. All status changes, match assignments, and payment updates must flow through admin dashboard → Supabase → Airtable. Airtable is for viewing and annotating only.

---

## 4. Pricing & Payment

### 4.1 Fees (Locked — Never Change These Numbers)

| Payment | Amount | When Triggered | Who Pays |
|---------|--------|----------------|---------|
| Verification fee | ₹6,000 + 18% GST = **₹7,080 total** | After form submitted + application reviewed | All applicants except GooCampus members |
| Membership fee | ₹35,000 + 18% GST = **₹41,300 total** | After both parties express mutual interest in a specific match | All applicants including GooCampus members |
| Premium concierge | ₹1,50,000–₹2,00,000 (price on enquiry) | On enquiry — never publicly displayed | Self-selected applicants |

**GooCampus members:** `is_goocampus_member = true` — verification fee is waived. Status moves `unverified` → `in_pool` directly (no verification_pending step). Membership fee applies in full when triggered.

### 4.2 Payment State Machine

`users.payment_status` drives every screen the user sees. States:

```
unverified           → Form complete, not yet paid verification fee
verification_pending → Verification fee paid, BGV in progress
in_pool              → BGV complete, in candidate pool, awaiting match
match_presented      → Match shared, awaiting response from this user
awaiting_payment     → Mutual interest confirmed, membership fee not yet paid
active_member        → Membership fee paid, membership active
membership_expired   → 6-month window closed
```

GooCampus fast-track: `unverified` → `in_pool` (skip `verification_pending`).

### 4.3 Hard Payment Rules (Enforce in Code)

1. BGV may not begin until BOTH: `verification_fee_paid = true` AND `bgv_consent = 'consented'`
2. Membership fee must not be requested until `match_presentations.is_mutual_interest = true`
3. `membership_start_date` = date of mutual interest, NOT the payment date
4. `membership_expiry_date` = `membership_start_date` + 6 months
5. GooCampus members: verification fee screen must never render — not even briefly

### 4.4 v1 Payment Collection

All payments collected offline (phone/UPI/bank transfer). Team manually sets `verification_fee_paid = true` in admin dashboard after confirming receipt. Razorpay integration is deferred to v2.

### 4.5 Membership Guarantee

Samvaya guarantees a minimum of 3 match presentations within the 6-month membership period. If unable to deliver, membership is extended at no charge.

### 4.6 Refund Policy

No refunds once verification has begun (costs incurred with the BGV provider immediately). No refunds on membership fee (payment only requested after mutual interest). Exception: technical error causing duplicate/incorrect charge — must be raised within 7 days.

---

## 5. Database Schema

### 5.1 Design Principles

- All tables: `id` (UUID, primary key), `created_at`, `updated_at` (UTC timestamps)
- Row-Level Security (RLS) enabled on every table
- JSONB fields for semi-structured data (preferences, AI outputs)
- Enum types for all status fields
- 23 tables, 22 migrations as of April 2026

### 5.2 Core Tables

#### `waitlist`
Phase 1 data. Original waitlist submissions.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| full_name | text | |
| phone | text | |
| email | text | |
| specialty | text | |
| career_stage | enum | student, resident, junior_doctor, consultant, specialist |
| city | text | |
| country | text | |
| status | enum | pending, invited, converted, rejected |
| invited_at | timestamp | |
| converted_at | timestamp | |
| utm_source | text | Marketing attribution |
| utm_medium | text | |
| utm_campaign | text | |

#### `users`
Linked to Supabase `auth.users`. Created when a waitlist member is invited.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK, FK to auth.users |
| waitlist_id | UUID | FK to waitlist (nullable) |
| role | enum | applicant, admin, super_admin |
| is_goocampus_member | boolean | Verification fee waived if true. Set manually by team. |
| membership_tier | enum | standard, premium_concierge |
| payment_status | enum | unverified, verification_pending, in_pool, match_presented, awaiting_payment, active_member, membership_expired |
| membership_status | enum | onboarding_pending, onboarding_in_progress, onboarding_complete, active, paused, suspended, deleted |
| onboarding_section | integer | Current section (1–13) — for save-and-resume |
| onboarding_last_question | integer | Last answered question — for save-and-resume to exact position |
| ai_conversation_status | enum | not_started, conv1_in_progress, conv1_complete, conv2_in_progress, conv2_complete, conv3_in_progress, all_complete |
| profile_completion_pct | integer | 0–100, computed |
| bgv_consent | enum | not_given, consented |
| is_bgv_complete | boolean | True when all 13 checks are verified |
| bgv_flagged | boolean | True if any check returned a flag |
| verified_at | timestamp | When BGV completed |
| gate_answers | jsonb | `{"Q10": "yes", "Q19": "no", "Q24": "yes"}` — conditional visibility answers |
| is_paused | boolean | When true, excluded from matching pool |
| paused_at | timestamp | |

#### `profiles`
Form answers. Each column maps to a specific question in the 100-question form.

| Column | Type | Q# |
|--------|------|----|
| id, user_id | UUID | |
| first_name | text | Q1 |
| last_name | text | Q2 |
| *(email — in auth.users, not here)* | — | Q3 |
| *(phone — in auth.users, not here)* | — | Q4 |
| gender | enum (male, female) | Q5 |
| referral_source | enum (instagram, linkedin, friend, goocampus, google, other) | Q6 |
| marital_status | enum (first_marriage, divorced, widowed) | Q7 |
| has_children_from_previous | boolean | Q8 |
| date_of_birth | date | Q9 |
| time_of_birth | text | Q11 |
| place_of_birth | text | Q12 |
| city_of_birth | text | Q13/Q14 |
| blood_group | text | Q15 |
| mother_tongue | text | Q16 |
| languages_spoken | text[] | Q17 |
| citizenship_country | text | Q18 |
| employment_visa_country | text | Q20 |
| current_country | text | Q21 |
| current_state | text | Q22 |
| current_city | text | Q23 |
| permanent_city | text | Q25 |
| permanent_ownership | enum (owned, rented, family_home) | Q26 |
| religion | text | Q27 |
| religious_observance | enum (actively_practicing, culturally_observant, spiritual, not_religious) | Q28 |
| believes_in_kundali | boolean | Q29 |
| caste_comfort | boolean | Q30 |
| caste | text | Q31 |
| father_name | text | Q32 |
| father_occupation | text | Q33 |
| father_occupation_other | text | Q34 |
| mother_name | text | Q35 |
| mother_occupation | text | Q36 |
| mother_occupation_other | text | Q37 |
| siblings_count | integer | Q39 |
| height_cm | integer | Q40 |
| weight_kg | integer | Q41 |
| skin_tone | text | Q42 |
| diet | enum (vegetarian, non_vegetarian, eggetarian, vegan, jain, other) | Q43 |
| attire_preference | enum (modern_western, traditional, mix, no_preference) | Q44 |
| fitness_habits | enum (regularly_exercises, occasionally, rarely, not_interested) | Q45 |
| smoking | enum (never, occasionally, frequently) | Q46 |
| drinking | enum (never, occasionally, frequently) | Q47 |
| tattoos_piercings | enum (none, tattoos_only, piercings_only, both) | Q48 |
| has_disability | enum (yes, no, prefer_not_to_disclose) | Q49 |
| disability_description | text | Q50 |
| has_allergies | boolean | Q51 |
| allergy_description | text | Q52 |
| hobbies_interests | text[] | Q53 |
| hobbies_regular | text[] | Q54 |
| hobbies_other | text | Q55 |
| marriage_timeline | enum | Q63 |
| long_distance_comfort | enum | Q64 |
| post_marriage_family_arrangement | enum (nuclear, joint, flexible, no_preference) | Q65 |
| both_partners_working_expectation | enum | Q66 |
| wants_children | enum (yes, no, open) | Q67 |
| children_count_preference | enum | Q68 |
| children_timing_preference | enum | Q69 |
| open_to_partner_with_children | enum | Q70 |
| preferred_settlement_countries | text[] | Q71 |
| open_to_immediate_relocation | enum (yes, no, open) | Q72 |
| plans_to_go_abroad | boolean | Q73 |
| abroad_countries | text[] | Q74 |

#### `medical_credentials`
Medical education and career. Maps to Sections H and I.

| Column | Type | Q# |
|--------|------|----|
| id, user_id | UUID | |
| current_status | enum (mbbs_student, intern, mbbs_passed, pursuing_pg, completed_pg) | Q56 |
| pg_plans | enum | Q57 |
| additional_qualifications | text[] | Q58 |
| additional_qualifications_other | text | Q59 |
| specialty | text[] | Q60 |
| has_work_experience | boolean | Q61 |
| work_experience | jsonb | `[{org_name, designation, start_month, start_year, end_month, end_year, is_current}]` — Q62 |
| current_designation | text | Extracted from most recent `is_current = true` entry |
| total_experience_months | integer | Calculated from all timeline entries |
| monthly_remuneration_range | text | Post-onboarding (not during form) |
| linkedin_url | text | Post-onboarding — mandatory |
| instagram_handle | text | Post-onboarding — optional |

#### `partner_preferences`
What the applicant wants. Maps to Section K (Q76–Q94).

| Column | Type | Q# |
|--------|------|----|
| id, user_id | UUID | |
| preferred_age_min, preferred_age_max | integer | Q76 |
| preferred_height_min_cm, preferred_height_max_cm | integer | Q77 |
| prefers_specific_specialty | boolean | Q78 |
| preferred_specialties | text[] | Q79 |
| preferred_career_stage | text[] | Q92 |
| preferred_indian_states | text[] | Q80 |
| preferred_countries | text[] | Q80 |
| no_location_preference | boolean | Q80 |
| preferred_mother_tongue | text[] | Q81 |
| body_type_preference | text[] | Q82 |
| attire_preference | enum | Q83 |
| diet_preference | text[] | Q84 |
| fitness_preference | enum | Q85 |
| smoking_preference | enum | Q86 |
| drinking_preference | enum | Q87 |
| tattoo_preference | enum | Q88 |
| family_type_preference | enum | Q89 |
| religious_observance_preference | enum | Q90 |
| partner_career_expectation_after_marriage | enum | Q91 |
| partner_qualities | text[] | Q93 |
| partner_qualities_other | text | Q94 |

#### `compatibility_profiles`
Structured output from the three AI conversations. Used by matching algorithm and displayed as spider web graphs.

| Column | Type | Description |
|--------|------|-------------|
| id, user_id | UUID | |
| raw_conversation_transcript | text | Full verbatim transcript, all 3 conversations. Never modified. |
| conversation_completed_at | timestamp | |
| input_mode | enum (text, voice) | v1 = text only; voice = v2 |
| family_orientation_score | integer | 0–100 |
| family_orientation_notes | text | AI qualitative notes |
| career_ambition_score | integer | 0–100 |
| career_ambition_notes | text | |
| independence_vs_togetherness_score | integer | 0–100 |
| independence_vs_togetherness_notes | text | |
| emotional_expressiveness_score | integer | 0–100 |
| emotional_expressiveness_notes | text | |
| social_orientation_score | integer | 0–100 |
| social_orientation_notes | text | |
| traditionalism_score | integer | 0–100 |
| traditionalism_notes | text | |
| relocation_openness_score | integer | 0–100 |
| relocation_openness_notes | text | |
| life_pace_score | integer | 0–100 |
| life_pace_notes | text | |
| communication_style | enum (direct, indirect, avoidant, expressive, reserved) | |
| conflict_approach | enum (addresses_immediately, reflects_first, withdraws, collaborative) | |
| partner_role_vision | enum (co_builder, anchor_complement, flexible) | |
| financial_values | enum (financially_intentional, financially_casual, financially_anxious, not_discussed) | |
| ai_personality_summary | text | 2–3 paragraph narrative for team reading |
| ai_compatibility_keywords | text[] | Tags for matching logic |
| key_quote | text | One or two sentences from transcript capturing the person's essence |
| ai_red_flags | text | Concerns flagged for team review |
| extraction_model_version | text | e.g. `claude-sonnet-4-20250514 / prompt-v1.2` |
| closing_freeform_note | text | Verbatim Q100 response — never summarized |
| chat_state | jsonb | Save-and-resume: `{ "Q38": { messages: [...], exchangeCount: N, isComplete: bool }, "Q75": {...}, "Q100": {...} }` |

#### `photos`

| Column | Type | Description |
|--------|------|-------------|
| id, user_id | UUID | |
| storage_path | text | `storage/photos/{user_id}/original/{filename}` |
| blurred_path | text | `storage/photos/{user_id}/blurred/{filename}` — Sharp sigma 20, server-side |
| is_primary | boolean | Face close-up slot |
| display_order | integer | 0=face_closeup, 1=full_length, 2=professional, 3=casual, 4+=additional |
| photo_type | text | face_closeup, full_length, professional, casual, additional |

#### `documents`

| Column | Type | Description |
|--------|------|-------------|
| id, user_id | UUID | |
| document_type | enum (identity_document, kundali, other) | |
| storage_path | text | Private bucket, signed URLs only |
| verification_status | enum (pending, verified, rejected, needs_resubmission) | |
| verified_by, verified_at | UUID, timestamp | |
| rejection_reason | text | |

### 5.3 Matching & Introduction Tables

#### `match_suggestions`
AI-generated suggestions awaiting team review.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | |
| profile_a_id, profile_b_id | UUID | FK to users (ordered: a < b) |
| overall_compatibility_score | integer | 0–100 |
| compatibility_report | jsonb | Dimension scores, highlights, concerns |
| match_narrative | text | AI-generated explanation |
| ai_model_version | text | |
| recommendation | enum (strongly_recommend, recommend, worth_considering, not_recommended) | |
| admin_status | enum (pending_review, approved, rejected, expired) | |
| reviewed_by, reviewed_at | UUID, timestamp | |
| admin_notes | text | |
| is_stale | boolean | True if either profile updated since scoring |

Constraint: `UNIQUE (profile_a_id, profile_b_id)` + `CHECK (profile_a_id < profile_b_id)`

#### `match_presentations`
Approved matches sent to applicants.

| Column | Type | Description |
|--------|------|-------------|
| id, match_suggestion_id | UUID | |
| member_a_response, member_b_response | enum (pending, interested, not_interested, expired) | |
| member_a_responded_at, member_b_responded_at | timestamp | |
| is_mutual_interest | boolean | Computed when both respond |
| status | enum (pending, mutual_interest, one_sided, expired, declined) | |
| presented_at | timestamp | |
| expires_at | timestamp | Default: 7 days from presented_at |

#### `match_feedback`
Feedback from applicants on presented matches.

| Column | Type | Description |
|--------|------|-------------|
| id, match_presentation_id, user_id | UUID | |
| response | enum (interested, not_interested) | |
| feedback_rating | integer | 1–5 |
| feedback_text | text | |
| what_worked, what_didnt_work | text[] | |
| would_like_more_like_this | boolean | |
| specific_concern | text | |

#### `introductions`

| Column | Type | Description |
|--------|------|-------------|
| id, match_presentation_id | UUID | |
| introduction_number | integer | 1st, 2nd, etc. |
| scheduled_at | timestamp | |
| meeting_link | text | Google Meet |
| is_team_facilitated | boolean | First intro = facilitated |
| status | enum (scheduled, completed, rescheduled, cancelled, no_show) | |
| outcome_member_a, outcome_member_b | enum (want_to_continue, not_a_match, need_more_time) | |

### 5.4 Payment Table

#### `payments`

| Column | Type | Description |
|--------|------|-------------|
| id, user_id | UUID | |
| payment_type | enum (verification_fee, membership_fee, membership_renewal) | |
| amount | integer | In paise |
| currency | text | INR |
| verification_fee_paid | boolean | **v1 only** — manually set true by team |
| razorpay_order_id, razorpay_payment_id, razorpay_signature | text | **v2 — deferred, null in v1** |
| status | enum (created, authorized, captured, failed, refunded) | |
| paid_at | timestamp | |
| refunded_at, refund_reason | | Technical error only |
| membership_start_date | date | Date of mutual interest — NOT payment date |
| membership_expiry_date | date | membership_start_date + 6 months |
| match_presentation_id | UUID | Match that triggered this membership |
| is_goocampus_member | boolean | |

### 5.5 Admin & System Tables

#### `bgv_checks`
13 rows per applicant. One per check type.

| Column | Type | Description |
|--------|------|-------------|
| id, user_id | UUID | |
| check_type | enum | aadhaar, pan, bank_account, credit_check, employment, education, professional_reference, court_records, criminal_records, global_database, address_digital, address_physical, social_media |
| status | enum | pending, in_progress, verified, flagged |
| document_path | text | Optional |
| notes | text | Admin-only |
| updated_by | UUID | |

Constraint: `UNIQUE (user_id, check_type)`

#### `communication_log`

| Column | Type | Description |
|--------|------|-------------|
| id, user_id, sent_by | UUID | |
| channel | enum (email, sms) | |
| subject, body | text | |
| status | enum (sent, failed, pending) | |
| sent_at, scheduled_at | timestamp | |
| batch_id | UUID | Groups bulk sends |

#### `email_templates`

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | |
| name | text | UNIQUE |
| subject, body | text | Support `{{variable}}` interpolation |
| category | text | general, payment, verification, matching |
| variables | text[] | Variable names used |

Pre-seeded: "Verification Fee Reminder", "BGV Initiated", "BGV Complete — Welcome to the Pool"

#### `notification_preferences`
Per-user notification toggles.

| Column | Default | Description |
|--------|---------|-------------|
| email_new_match | true | |
| email_match_response | true | |
| email_status_update | true | |
| email_promotions | false | |
| push_new_match | true | |
| push_match_response | true | |
| push_status_update | true | |

#### `push_subscriptions`
Web Push API subscriptions. One per device per user.

| Column | Type |
|--------|------|
| user_id, endpoint, p256dh, auth | text |

Constraint: `UNIQUE (user_id, endpoint)`

#### `introduction_availability`
14-day rolling calendar for introduction scheduling.

| Column | Type | Description |
|--------|------|-------------|
| user_id, match_presentation_id | UUID | |
| available_date | date | |
| time_slot | text | morning, afternoon, evening |
| notes | text | Optional |

#### `daily_snapshots`
Daily KPI snapshots for trend tracking (added Phase 2F). Powers sparklines and "% vs 7 days ago" on admin dashboard.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | |
| snapshot_date | date | UNIQUE |
| total_waitlist | integer | |
| total_users | integer | |
| onboarding_in_progress | integer | |
| onboarding_complete | integer | |
| verification_pending | integer | |
| in_pool | integer | |
| active_members | integer | |
| total_matches_suggested | integer | |
| total_matches_presented | integer | |
| total_mutual_interests | integer | |

#### `activity_log`

| Column | Type | Description |
|--------|------|-------------|
| actor_id | UUID | |
| action | text | e.g. "approved_match" |
| entity_type, entity_id | text, UUID | |
| metadata | jsonb | Parsed to human-readable text in UI |

#### `system_config`
Key-value store for configurable settings (feature flags, pricing display, Airtable sync state).

#### `admin_notes`
Free-text internal notes per entity (user, match_suggestion, match_presentation, introduction).

### 5.6 RPC Functions

#### `get_prefiltered_candidates(target_user_id UUID)`
Returns `TABLE(candidate_id UUID)`. Pre-filters matching pool using hard constraints before Claude scoring.

Filters applied:
- Opposite gender
- Bidirectional age range overlap
- Location overlap (preferred states/countries or no_location_preference)
- Smoking/drinking preference compatibility
- Excludes: self, paused users (`is_paused = true`), existing match_suggestions
- Requires: `is_bgv_complete = true` AND `payment_status IN ('in_pool', 'match_presented')`

#### `handle_match_response(p_presentation_id UUID, p_user_id UUID, p_response TEXT)`
Returns JSONB. Atomically processes a match response with row-level locking.

1. Validates presentation exists and belongs to this user
2. Checks expiry
3. Prevents double-response
4. Records response (interested / not_interested)
5. If both responded: computes `is_mutual_interest`
6. On mutual interest: sets `payment_status = 'awaiting_payment'` for both users, records `membership_start_date = NOW()`

---

## 6. Onboarding Form

### 6.1 Design Principles

- Self-filled by applicant only (no parents/guardians)
- Auto-saves every answer (debounced Supabase upsert)
- Save-and-resume via `users.onboarding_section` + `users.onboarding_last_question`
- Mobile-first: large touch targets, one question per screen, progress bar always visible
- 27 conditional rules controlling question visibility
- Real-time validation with clear error messages
- Warm, encouraging copy throughout — not clinical
- City autocomplete for Indian states/cities and international locations
- Illustrated multiple-choice options (lifestyle, physical) via icons

### 6.2 Confidentiality Callouts

Shown at sensitive sections to reduce hesitation:

**Welcome screen (before Q1):** Full callout about confidentiality and honest answers.

**Short reminder at:**
- Section C (Religion & Community)
- Section E (Physical Details)
- Section F (Lifestyle)
- Section K (Partner Preferences)

Short text: *"Your answers here are private and confidential. Be honest — this is how we find the right match for you."*

### 6.3 All 100 Questions Across 13 Sections

#### SECTION A — Basic Identity

| # | Question | Type | Conditional |
|---|----------|------|-------------|
| 1 | First Name | Short Answer | — |
| 2 | Last Name | Short Answer | — |
| 3 | Email | Email | — (stored in auth.users) |
| 4 | Phone Number | Phone | — (stored in auth.users) |
| 5 | Gender | MC: Male / Female | — |
| 6 | How did you hear about Samvaya? | MC: Instagram / LinkedIn / Friend or Family / GooCampus / Google / Other | — |
| 7 | Have you been married before? | MC: No, first marriage / Yes, divorced / Yes, widowed | — |
| 8 | Do you have children from your previous marriage? | MC: Yes / No | ↳ if Q7 = divorced or widowed |
| 9 | Date of Birth | Date Picker | — |
| 10 | Do you know your time of birth? | MC: Yes / No | — |
| 11 | Time of Birth | Time Picker | ↳ if Q10 = Yes |
| 12 | Place of Birth | Dropdown: Outside India / All Indian states | — |
| 13 | City and country of birth | International location (city + country) | ↳ if Q12 = Outside India |
| 14 | City of birth | Autocomplete (cities by state) | ↳ if Q12 = Indian state |
| 15 | Blood Group | Dropdown: A+/A-/B+/B-/AB+/AB-/O+/O-/Don't Know | Optional |
| 16 | Mother Tongue | Dropdown | — |
| 17 | Languages you speak fluently | Checkboxes | — |

#### SECTION B — Location & Citizenship

| # | Question | Type | Conditional |
|---|----------|------|-------------|
| 18 | Citizenship country | Dropdown | — |
| 19 | Employment visa for another country? | MC: Yes / No | — |
| 20 | Which country's employment visa? | Dropdown | ↳ if Q19 = Yes |
| 21 | Country of current residence | Dropdown | — |
| 22 | Which state? | Dropdown (Indian states/UTs) | ↳ if Q21 = India |
| 23 | City of current residence | Autocomplete | — |
| 24 | Is permanent address same as present? | MC: Yes / No | — |
| 25 | City and state/country of permanent address | Short Answer | ↳ if Q24 = No |
| 26 | Permanent home: owned or rented? | MC: Owned / Rental / Family home | ↳ if Q24 = No |

#### SECTION C — Religion & Community
*(Confidentiality callout shown)*

| # | Question | Type | Conditional |
|---|----------|------|-------------|
| 27 | Religion | Dropdown | — |
| 28 | Level of religious observance | MC: Actively practicing / Culturally observant / Spiritual / Not religious | — |
| 29 | Do you believe in Kundali matching? | MC: Yes / No | ↳ Hindu, Sikh, Buddhist, Jain only |
| 30 | Comfortable sharing caste/community? | MC: Yes / No | — |
| 31 | Caste or community | Autocomplete | ↳ if Q30 = Yes |

#### SECTION D — Family Background

| # | Question | Type | Conditional |
|---|----------|------|-------------|
| 32 | Father's Name | Short Answer | — |
| 33 | Father's Occupation | Dropdown | — |
| 34 | Describe father's occupation | Short Answer | ↳ if Q33 = Other |
| 35 | Mother's Name | Short Answer | — |
| 36 | Mother's Occupation | Dropdown | — |
| 37 | Describe mother's occupation | Short Answer | ↳ if Q36 = Other |
| 38 | 💬 Family background (Claude Chat) | Claude Chat, 4 exchanges max | — |
| 39 | How many siblings? | Number | — |

> Q38 Claude Chat: Covers family emotional texture, childhood model of marriage, domestic expectations, what a good Tuesday looks like. Siblings discussed naturally — no separate structured siblings field needed.

#### SECTION E — Physical Details
*(Confidentiality callout shown)*

| # | Question | Type |
|---|----------|------|
| 40 | Height (cm) | Number |
| 41 | Weight (kg) | Number |
| 42 | Skin tone *(optional)* | MC with illustrations: Fair / Wheatish / Dusky / Dark |

#### SECTION F — Lifestyle
*(Confidentiality callout shown; all questions illustrated)*

| # | Question | Type | Conditional |
|---|----------|------|-------------|
| 43 | Dietary preferences | MC illustrated | — |
| 44 | Everyday attire preference | MC illustrated | — |
| 45 | Fitness habits | MC illustrated | — |
| 46 | Smoke? | MC: Never / Occasionally / Frequently | — |
| 47 | Drink? | MC: Never / Occasionally / Frequently | — |
| 48 | Tattoos or piercings? | MC: None / Tattoos / Piercings / Both | — |
| 49 | Any disabilities or health conditions? | MC: Yes / No / Prefer not to disclose | — |
| 50 | Describe disability/health condition | Short Answer | ↳ if Q49 = Yes |
| 51 | Any allergies? | MC: Yes / No | — |
| 52 | Describe allergies | Short Answer | ↳ if Q51 = Yes |

#### SECTION G — Personality & Interests

| # | Question | Type | Conditional |
|---|----------|------|-------------|
| 53 | Hobbies and interests (select all) | Grouped checkboxes with category illustrations | — |
| 54 | Which 2–3 do you actually spend time on? | Multi-select from Q53, max 3 | — |
| 55 | Other hobbies not listed | Short Answer | ↳ if "Other" selected in Q53 |

> Note: Personality is captured via Claude conversations (Q38, Q75), not self-label checkboxes. Social orientation and communication style are inferred from how the applicant speaks.

Q53 Categories: Arts & Creativity · Sports & Fitness · Outdoors & Travel · Food & Lifestyle · Tech & Gaming · Reading & Learning · Social & Community · Entertainment · Crafts & Collecting · Other

#### SECTION H — Education

| # | Question | Type | Conditional |
|---|----------|------|-------------|
| 56 | Current medical status | MC: MBBS student / Intern / MBBS passed / Pursuing PG / Completed PG | — |
| 57 | Plans to pursue PG? | MC: Yes <1yr / Yes 2–3yrs / No / Undecided | ↳ if Q56 = MBBS Passed |
| 58 | Additional qualifications | Checkboxes: MD/MS/DNB/DM/MCh/MBA/MPH/PhD/Fellowship/MRCP/USMLE/PLAB/Other | — |
| 59 | Other qualifications | Short Answer | ↳ if Other in Q58 |
| 60 | Specialty | Checkboxes (full specialty list) | Optional |

#### SECTION I — Career

| # | Question | Type | Conditional |
|---|----------|------|-------------|
| 61 | Have you worked or are you currently working? | MC: Yes / No | — |
| 62 | Work Experience Timeline | LinkedIn-style: org name / designation / start date / end date (or "current") | ↳ if Q61 = Yes |

#### SECTION J — Goals & Values

| # | Question | Type | Conditional |
|---|----------|------|-------------|
| 63 | When looking to get married? | MC: <6mo / 6–12mo / 1–2yr / No fixed timeline | — |
| 64 | Open to long-distance for the right match? | MC: Yes / Open / Prefer same city | — |
| 65 | Family arrangement after marriage? | MC: Nuclear / Joint / Flexible / No preference | — |
| 66 | Both partners working expectations? | MC: Both continue / Either way / I prefer home / Prefer partner home / Open | — |
| 67 | Want children? | MC: Yes / No / Open | — |
| 68 | How many children? | MC: 1 / 2 / 3+ / No preference | ↳ if Q67 = Yes |
| 69 | When to have children? | MC: 1–2yr / 3–5yr / After milestones / No preference | ↳ if Q67 = Yes |
| 70 | Open to partner with children? | MC: Yes / No / Open | ↳ if Q7 = divorced/widowed AND Q8 = Yes |
| 71 | Ideal settlement countries | Multi-select | — |
| 72 | Open to immediate relocation? | MC: Yes / No / Open | — |
| 73 | Plans to go abroad next 3 years? | MC: Yes / No | — |
| 74 | Which countries? | Multi-select | ↳ if Q73 = Yes |
| 75 | 💬 Future goals, ambitions, the life you want to build (Claude Chat) | Claude Chat, 6 exchanges max | — |

> Q75 Claude Chat: Career vision, personal meaning beyond medicine, partner role (co-builder vs. anchor), what they bring to a relationship, conflict/communication style, financial values, what a partner must understand about their medical life.

#### SECTION K — Partner Preferences
*(Confidentiality callout shown)*

| # | Question | Type | Conditional |
|---|----------|------|-------------|
| 76 | Age range open to | Two number inputs: min / max | — |
| 77 | Height range open to (cm) | Range slider | — |
| 78 | Prefer specific medical specialty? | MC: Yes / No | — |
| 79 | Preferred specialties | Checkboxes | ↳ if Q78 = Yes |
| 80 | Where should partner be based? | Multi-select Indian states + countries outside India; "No preference" clears both | — |
| 81 | Mother tongue preferences | Multi-select (or No preference) | — |
| 82 | Body type preference | Multi-select: Slim / Athletic / Average / Full-figured / No preference | — |
| 83 | Attire preference | MC | — |
| 84 | Dietary preference | Multi-select | — |
| 85 | Fitness habit preference | MC | — |
| 86 | Smoking preference | MC | — |
| 87 | Drinking preference | MC | — |
| 88 | Tattoo/piercing preference | MC | — |
| 89 | Family type preference | MC | — |
| 90 | Religious observance preference | MC | — |
| 91 | Partner career expectations after marriage | MC | — |
| 92 | Career stages open to in a partner | Checkboxes | — |
| 93 | Partner qualities (up to 7) | Grouped checkboxes | — |
| 94 | Other qualities | Short Answer | ↳ if Other in Q93 |

Q93 Quality categories: Character & Values · Personality · Relationship Style · Family & Home · Career & Ambition · Social & Cultural · Other

#### SECTION L — Documents & Verification

| # | Question | Type | Conditional |
|---|----------|------|-------------|
| 95 | Upload photos | Guided slots: face close-up (required/primary), full-length, professional, casual, additional (4+). Min 3, max 10. Client-side compression for large files. | — |
| 96 | *(Grouped into Q95 — does not render separately)* | — | — |
| 97 | Identity document (Aadhaar or Passport) | File Upload | — |
| 98 | Upload your Kundali | File Upload | ↳ if Q29 = Yes |
| 99 | Background Verification Consent | Custom consent toggle (mandatory — blocks form progression if not toggled) | — |

> Q99 BGV Consent screen includes: shield icon, title, why we verify, what we verify (7 categories), safety notes (amber callout), confidentiality note, consent toggle. Toggle value `consented` — empty value blocks form.

> **Critical rule:** BGV initiation requires BOTH `bgv_consent = 'consented'` AND `verification_fee_paid = true`.

#### SECTION M — Conversations (All 3 Claude Chats)

> Architecture note (confirmed March 27, 2026): All 3 Claude conversations are grouped together as Section M, the final section. Applicants complete all factual questions (Sections A–L) first, then do all 3 conversations. Question IDs remain Q38/Q75/Q100 for DB/extraction compatibility, but their `questionNumber` values in code are 101/102/103.

| # | Conversation | questionNumber | Exchanges | Covers |
|---|-------------|----------------|-----------|--------|
| Q38 | Family background | 101 | 4 max | Family emotional texture, childhood model of marriage, domestic expectations, what a good Tuesday looks like |
| Q75 | Goals & values | 102 | 6 max | Career vision, personal meaning, partner role vision, what they bring to a relationship, conflict/communication style, financial values |
| Q100 | Closing | 103 | 1 only | Anything unsaid — one prompt, one response, stored verbatim |

> Q100 closing prompt: *"Before we finish — is there anything important about you, or about what you're looking for, that you feel this form hasn't quite captured?"*
> Fixed closing message: *"Thank you for the care you've put into your answers. It genuinely helps us find the right person for you. We'll take it from here."*

### 6.4 Post-Onboarding

After form completion, a profile completion prompt collects:
- LinkedIn profile URL (mandatory)
- Instagram handle (optional)
- Monthly remuneration range (optional: ₹0–1L / ₹1L–2.5L / ₹2.5L–5L / ₹5L–7.5L / ₹7.5L–10L / Above ₹10L)

Stored in `medical_credentials`. LinkedIn/Instagram used for BGV social media check — never shown to other members.

### 6.5 Photo Upload Pipeline

**Client-side:** Files >3 MB compressed to ~3 MB / max 2048px using `browser-image-compression`. Toast shown: "Optimized from X MB to Y MB". Original never reaches the server.

**Server-side (after upload):**
1. Compressed file → `storage/photos/{user_id}/original/{filename}`
2. Sharp safety resize to max 2048px
3. Sharp Gaussian blur (sigma 20) → `storage/photos/{user_id}/blurred/{filename}`
4. Both paths + photo_type written to `photos` table

**Serving:**
- Before mutual interest confirmed: serve `blurred_path`
- After mutual interest + payment captured: serve `storage_path`
- Both are private Supabase Storage — signed URLs, server-side only
- **The blur is server-side, not CSS. It cannot be removed from the DOM.**
- Admin always sees unblurred originals

---

## 7. AI Onboarding Conversations

### 7.1 Architecture

The three AI conversations are embedded within the form. When the applicant reaches Q38/Q75/Q100 (now all in Section M at the end), the form pauses and a chat UI renders inline. After conversation ends, form resumes. Built as an inline form component that hands back control on completion.

**Full system prompts, branching logic, extraction prompts, exchange counter logic, and spider web dimension mapping are in:** `Samvaya_Claude_Chat_Prompts_v1.md`

**AI system prompts are server-only.** `prompts.ts` imports `server-only`. Client uses `chat-metadata.ts` only (title, maxExchanges, nudgeText). Full prompts are never exposed to the client.

### 7.2 Spider Web — 8 Dimensions

Extracted across the conversations. Each scored 0–100. Two profiles whose webs overlap significantly signal strong compatibility.

| Dimension | Description | Source |
|-----------|-------------|--------|
| Family orientation | How central family is to identity and daily life | Conv 1 (Q38) |
| Career ambition | How much professional achievement defines self | Conv 2 (Q75) |
| Independence vs. togetherness | Personal space vs. closeness | Conv 1 + 2 |
| Emotional expressiveness | How openly feelings are communicated | Conv 2 |
| Social orientation | Introverted to extroverted (inferred, not self-reported) | Conv 2 |
| Traditionalism | Modern/progressive to traditional values and roles | Conv 1 |
| Relocation openness | Rooted to highly mobile | Conv 2 |
| Life pace | Grounded/deliberate to driven/fast-moving | Conv 2 |

### 7.3 Extraction

After each conversation ends, a separate extraction API call runs at temperature 0, producing structured JSON. Extracts all 8 spider web scores + notes, plus communication style, conflict approach, partner role vision, financial values, personality summary, compatibility keywords, key quote.

`extraction_model_version` stored with each extraction for quality tracking and re-processing with newer models.

### 7.4 Save-and-Resume for Chats

Full conversation state persisted to `compatibility_profiles.chat_state` (JSONB):
```json
{
  "Q38": { "messages": [...], "exchangeCount": 2, "isComplete": false },
  "Q75": { "messages": [...], "exchangeCount": 0, "isComplete": false },
  "Q100": { "messages": [...], "exchangeCount": 0, "isComplete": false }
}
```
Applicants can return mid-conversation across sessions.

### 7.5 UX Details

- Chat-style UI: message bubbles, typing indicator, smooth scrolling
- Exchange counter visible to applicant
- Nudge text: *"Take your time — longer answers help us find a better match for you."*
- Voice input: text-only in v1. Voice (speech-to-text) is v2.
- Skip button enabled during testing (must be removed before launch)

---

## 8. Background Verification (BGV)

### 8.1 Provider

**Third-party BGV provider** — 13 checks per applicant across identity, financial, professional, legal, address, and digital footprint.

### 8.2 13 Checks

| Category | Checks |
|----------|--------|
| Identity | Aadhaar Verification, PAN Verification |
| Financial & Credit | Bank Account Verification, Credit Check |
| Professional & Educational | Employment Verification, Education Verification, Professional Reference Check |
| Legal & Criminal | Court Record Check, Criminal Record Check (via Law Firm), Global Database Check |
| Address & Residency | Address Verification (Digital), Address Verification (Physical) |
| Digital Footprint | Social Media Check |

### 8.3 Trigger Rules (Hard — Both Conditions Required)

BGV is never initiated automatically. Both must be true:

1. `users.bgv_consent = 'consented'` (Q99 toggled by applicant)
2. `payments.verification_fee_paid = true` (manually set by team in v1)

If consent is not given, profile is deleted within 30 working days.

### 8.4 Admin BGV Tracker

- 13-check tracker per applicant (one row per check in `bgv_checks`)
- Status per check: ⬜ Pending / 🔄 In Progress / ✅ Verified / 🚩 Flagged
- Phase 2F: "Set All To" bulk dropdown + "Save All Changes" button (individual edits still work)
- Notes field per check (admin-only)
- Profile-level summary badge on applicant list: "BGV: X/13 verified"
- BGV Complete = all 13 checks Verified (none Flagged or Pending)

---

## 9. Matching Algorithm

### 9.1 Architecture: Three Stages

1. **Pre-filtering** (SQL): Fast elimination based on hard constraints
2. **Compatibility scoring** (Claude API): Deep analysis of remaining pairs
3. **Human review** (Admin dashboard): Team reviews, approves or rejects before presenting to applicants

### 9.2 Pre-Filtering (Stage 1)

`get_prefiltered_candidates()` RPC applies:
- Opposite gender
- Bidirectional age range overlap
- Location overlap
- Smoking/drinking preference compatibility
- Excludes: self, paused users, already-suggested pairs
- Requires: `is_bgv_complete = true` AND `payment_status IN ('in_pool', 'match_presented')`

### 9.3 Compatibility Scoring (Stage 2)

Claude API receives both profiles and produces a structured JSON report:

```json
{
  "overall_score": 84,
  "dimension_scores": {
    "career_alignment": { "score": 88, "note": "..." },
    "values_alignment": { "score": 91, "note": "..." },
    "lifestyle_compatibility": { "score": 79, "note": "..." },
    "relocation_compatibility": { "score": 85, "note": "..." },
    "communication_compatibility": { "score": 82, "note": "..." },
    "family_orientation": { "score": 90, "note": "..." },
    "financial_alignment": { "score": 75, "note": "..." },
    "timeline_alignment": { "score": 88, "note": "..." },
    "emotional_compatibility": { "score": 80, "note": "..." }
  },
  "highlights": ["..."],
  "concerns": ["..."],
  "narrative": "One paragraph, warm, natural language for team review",
  "recommendation": "strongly_recommend"
}
```

### 9.4 Scoring Weights

| Factor | Weight |
|--------|--------|
| Values alignment | High |
| Career & timeline alignment | High |
| Relocation compatibility | High |
| Communication compatibility | High |
| Lifestyle compatibility | Medium |
| Family orientation | Medium |
| Financial alignment | Medium |
| Emotional compatibility | Medium |
| Demographics (age, height) | Low |
| Specialty match | Low |

**Critical principle:** A match meeting all criteria except one non-critical factor should still score high (82–85%) with a note explaining the difference. Surface near-matches, not just perfect ones.

### 9.5 Human Review (Stage 3)

Admin sees both profiles side-by-side with the compatibility report. Phase 2F: interactive spider chart (500px SVG) with scores at each axis (no clicking needed), 2/3-width chart + 1/3-width highlights/concerns/narrative. Admin can:
- Approve: match moves to presentation queue
- Reject (with reason)
- Flag for team discussion
- Add notes

### 9.6 Match Presentation to Applicants

Once approved, the match is sent to both applicants independently as a **member-facing match card**:

**What's shown:** Blurred primary photo, age, state + country, medical status, designation, experience, height, religion + observance, match rationale (3–4 specific reasons), spider web overlay, AI-generated "About them" paragraph, life snapshot, interests.

**What's hidden:** Full name, email, phone, exact city, parents' names, parents' occupations, weight, caste details, BGV status, financial information, work history (org names), team notes, AI red flags, closing freeform note.

**Response window:** 7 days from `presented_at`. Expires automatically.

**After mutual interest + payment:** Full name, contact info, unblurred photos unlocked.

### 9.7 Feedback Loop

- Match feedback collected after every presentation (rating 1–5, what worked, what didn't, specific concerns)
- Introduction outcomes logged (want to continue, not a match, need more time)
- Periodically: Claude analyzes accumulated feedback to identify patterns
- Scoring rubric and weights updated based on analysis
- All scoring runs tagged with prompt/model version

---

## 10. Admin Dashboard

### 10.1 Overview

Desktop-only, data-dense, full operational control. Built for the Samvaya team (Ashwini, Santosh, Ejaz) to manage every aspect of the platform day-to-day.

- **Layout:** max-w-[1600px], no mobile responsiveness
- **Dates:** All dates in DD-MM-YYYY format (Indian convention)
- **Sidebar:** Collapsible with toggle, state persists in localStorage. Settings pinned to bottom, separated from main nav.
- **Test user:** `maheenejaz@goocampus.in` has admin role set

### 10.2 Dashboard Home (`/admin`)

5-row command center (Phase 2F rebuild):

**Row 1 — KPI Cards:** 10 metric cards with trend sparklines and "% vs 7 days ago" (powered by `daily_snapshots` table).
- Total waitlist, total users, onboarding in progress, onboarding complete, verification pending, in pool, active members, total matches suggested, total matches presented, total mutual interests

**Row 2 — Pipeline Funnel:** Horizontal flowing wave funnel (SVG area chart) showing the full pipeline from waitlist to active member, with stage labels and conversion percentages.

**Row 3 — Alerts + Distribution (1/3 + 2/3):**
- Left: Alerts with one-click actions (matches to review, BGV to initiate, expiring presentations, etc.)
- Right: Donut chart distribution tabs — Location / Education / Age / Gender

**Row 4 — Match Command Center:** 4 match-stage cards + side-by-side profile comparison cards with expandable detail (spider chart + highlights/concerns).

**Row 5 — Activity + Communications (1/3 + 2/3):**
- Left: Recent activity feed
- Right: Recent communications sent

### 10.3 Applicant List (`/admin/applicants`)

- Searchable, filterable, sortable table
- Tabs: All / Verified / In-Progress (pending: in-progress tab with section/progress tracking)
- Quick actions: view profile, change status, add note, send communication

### 10.4 Applicant Detail (`/admin/applicants/[userId]`)

16-component admin profile view across blocks:
1. Header (name, age, location, medical status, BGV badge, membership status, GooCampus flag, application date)
2. Identity snapshot (religion, observance, mother tongue, languages, marital status, blood group)
3. Family background + key quote
4. Education & career (mini-timeline, LinkedIn, remuneration range)
5. Lifestyle snapshot (icon row: diet, attire, fitness, smoking, drinking, tattoos/piercings)
6. Interests (grouped by category + "actually spend time on")
7. Goals & values (two-column grid)
8. Compatibility profile (spider web + dimension scores + notes)
9. AI personality summary + compatibility keywords
10. Partner preferences
11. BGV verification status (13-check table)
12. Team notes (AI red flags + admin free-text)
13. Closing note (Q100 verbatim)
14. Status management (payment status, membership status, pause profile, per-user pricing override + "Complementary" option)
15. Document viewer — **PENDING** (fetch + display Aadhaar/passport with signed URLs)
16. Conversation transcript viewer — **PENDING** (parse `raw_conversation_transcript` as chat bubbles)
17. Send email inline + communication history — **PENDING**

### 10.5 Verification Queue (`/admin/verification`)

List of applicants with submitted documents awaiting review. Pending: name search + sortable columns.

### 10.6 BGV Tracker (`/admin/verification/[userId]`)

- 13-check tracker with status per check
- **Phase 2F:** "Set All To" bulk dropdown + "Save All Changes" button
- Individual edits still work for fine-tuning
- Upload field + notes per check

### 10.7 Matching Pages (`/admin/matching`)

- **Suggestions tab:** Suggestion queue sorted by score. Interactive spider chart (500px SVG), scores at each axis, 2/3-width. Highlights/concerns in green/red cards. Narrative in 1/3 column. Admin approve/reject/flag.
- **Presentations tab:** Presented matches, response status of each party, countdown to expiry
- **Introductions tab:** Scheduling interface (time slots, Google Meet links), status tracking
- **History tab:** Full match history, filterable

### 10.8 Analytics (`/admin/analytics`)

- Vertical narrowing trapezoid funnel (SVG) — stage volume with actual counts
- Conversion rates: actual numbers ("X of Y") capped at 100%
- Stage duration showing "X applicants" instead of "n=X"
- Geographic distribution
- Specialty distribution

### 10.9 Communications (`/admin/communications`)

- **Send tab:** Individual email + bulk send with template selection. **Phase 2F:** Inline template editing (Edit button next to preview, saves via PATCH)
- **History tab:** All communications sent, filterable by applicant/batch/date
- **Templates tab:** Manage email templates with `{{variable}}` interpolation

### 10.10 Activity Log (`/admin/activity`)

Full audit trail. **Phase 2F:** JSON metadata parsed to human-readable text (e.g., "Changed Criminal Records to In Progress" instead of raw JSON).

### 10.11 Settings (`/admin/settings`)

- Pricing display (verification fee, membership fee)
- Per-user pricing override on applicant detail page (custom amount + "Complementary" checkbox)
- Feature flag editor
- Airtable sync status + manual trigger

---

## 11. User-Facing PWA

### 11.1 Overview

Mobile-first progressive web app installable from the browser. Not a native iOS/Android app. Designed for phones with large touch targets, bottom navigation, and card-based UI.

### 11.2 Auth

Email OTP only (Supabase Auth). No passwords. Invited applicants only. 30-day JWT session persistence.

### 11.3 All Pages

| Route | Page |
|-------|------|
| `/app` | Dashboard — 5 status cards |
| `/app/onboarding` | Multi-step form shell (all 13 sections) |
| `/app/matches` | Match list |
| `/app/matches/[id]` | Match detail + spider chart + response |
| `/app/matches/[id]/feedback` | Post-match feedback form |
| `/app/profile` | View own profile |
| `/app/profile/edit` | Edit location, lifestyle, goals |
| `/app/profile/photos` | Photo management (add, delete, replace, reorder) |
| `/app/settings` | Notifications, pause, introduction availability |

### 11.4 Dashboard — 5 Cards (Phase 2F Design)

**Card 1 — Profile Summary:** Photo (50–70% of card), name + verified badge, specialty + designation, location. Edit icon. Glassmorphic card.

**Card 2 — Status Card (Hero):** Current pipeline state with icon, colored status badge, title + description, progress checklist (checkmarks for done, samvaya-red for active, gray for future), CTA button.

**Card 3 — Match Stats:** Two glassmorphic sub-cards side by side. Large thin-weight numbers (total matches, pending responses). "View Matches →" subtle link.

**Card 4 — Membership Countdown:** Large thin-weight "days remaining" number, total/used context, glassmorphic progress bar, date range. Only shown for `active_member` status.

**Card 5 — Activity Timeline:** Vertical timeline. Green filled circle + checkmark for completed steps. samvaya-red circle with pulse/glow for active step. Gray outlined circle for future steps. Connecting line.

### 11.5 Match Card (9 Components)

1. MatchCardHeader (name placeholder, blurred photo, verified badge)
2. ProfileReveal (blur-to-unblur interaction after mutual interest)
3. AboutThem (bio, specialty, location, AI-generated paragraph)
4. LifeSnapshot (goals, values, lifestyle grid)
5. InterestsSection (2–3 actual interests)
6. MatchRationale (3–4 specific reasons, one honest note of difference)
7. CompatibilityChart (spider web overlay — both profiles)
8. ResponsePrompt (I'm interested / Not for me, expires in X days)
9. FeedbackForm (post-response structured feedback)

### 11.6 Key Features

- **Pause profile:** Toggle at `/app/settings`. Sets `users.is_paused = true`. Excluded from `get_prefiltered_candidates()`.
- **Notification preferences:** Email + push toggles in `notification_preferences` table.
- **Push notifications:** VAPID keys, service worker handles push events, subscriptions in `push_subscriptions`.
- **Introduction availability:** 14-day calendar with time slots (morning/afternoon/evening) at `/app/settings`.
- **Photo management:** Add, delete, replace, reorder at `/app/profile/photos`. Min 3, max 10. Same blur pipeline.
- **Full profile reveal:** After mutual interest + payment captured, `storage_path` (unblurred) served instead of `blurred_path`.

### 11.7 PWA Config

Web manifest only (v1). Offline: service worker caches core assets and provides offline fallback page. No service worker for full offline support (v2).

---

## 12. Phase 2F Design Direction

### 12.1 General Aesthetic

| Principle | Description |
|-----------|-------------|
| Mood | Quiet luxury. Calm confidence. Not flashy, not trying hard. |
| Glassmorphism | Real, not decorative — backdrop-blur 20–40px, backgrounds genuinely show through (alpha 0.1–0.3) |
| Colors | Muted, sophisticated. samvaya-red (#A3171F) as ambient warmth, not primary UI color |
| Numbers | Large, thin-weight — the number itself is the visual element |
| Spacing | Very generous — content breathes, never cramped |
| Buttons | Pill-shaped or high border-radius. Dark solid for primary, frosted glass for secondary |
| Cards | Edges defined by blur and transparency, not hard borders |
| Animations | Calm, smooth, elegant — never bouncy or playful |

### 12.2 Typography — Urbanist (Replaced ApfelGrotezk, March 25, 2026)

**Google Fonts. Geometric sans-serif.**

| Usage | Weight |
|-------|--------|
| Display numbers (hero stats, countdowns) | Thin/Light (100–300) |
| Large headings | Light (300) |
| Section headings, card titles | Medium (500) |
| Labels, small headings, badges | SemiBold (600) |
| Body text | Regular (400) |
| Bold emphasis | Bold (700) |

**Key rule: Large display numbers always use thin/light weight. Never bold for large numbers.**

### 12.3 Color Application

| Element | Color |
|---------|-------|
| Primary buttons | Dark charcoal/black (#18181B), pill-shaped |
| Secondary buttons | Frosted glass (semi-transparent white + blur) |
| Background atmosphere | samvaya-red gradients, subtle and warm |
| Status accents | Muted green/blue/amber — not saturated |
| Text hierarchy | #18181B (primary) → gray-600 (secondary) → gray-400 (tertiary) |
| Active/highlight | samvaya-red used sparingly |

### 12.4 Glassmorphism Specs

| Property | Target |
|----------|--------|
| backdrop-blur | 20–40px for real glass feel |
| Background alpha | 0.1–0.3 (so backgrounds show through) on dark backgrounds; 0.5–0.7 on light backgrounds |
| Border | Subtle or absent — let blur define the edge |

### 12.5 Design Tokens (in `globals.css`)

- `.card-glass` — alpha 0.6, blur 24px, inset white highlight, elevated shadow, rounded-2xl
- `.glass-sub-card` — warm-tinted sub-card for depth layering
- `.glass-pill` — frosted glass pill for secondary actions
- `.active-glow` — pulse animation with samvaya-red glow (timeline active step)
- `.btn-primary` — dark charcoal (#18181B), border-radius 9999px
- `.btn-secondary` — frosted glass + backdrop-blur, pill-shaped
- `.bg-page-warm` — rich warm gradient with visible rose/gold tones
- Badge system (6 variants), hover-lift, press-scale, animation utilities

### 12.6 Implementation Status

**Done:**
- Urbanist font in `layout.tsx` and `globals.css`
- All design tokens defined
- App layout uses `bg-page-warm`
- StatusDashboard.tsx has initial 5-card structure

**Not done (card-by-card iteration paused, resumes after admin is production-ready):**
- Match card components (9 files)
- App components (settings, profile, photos)
- Form shell + inputs
- Admin components
- Navigation (AppHeader, BottomNav)

### 12.7 What NOT to Do

- Don't bold large display numbers (defeats the premium feel)
- Don't use samvaya-red for primary buttons (use dark charcoal)
- Don't use hard borders to define cards (blur and transparency do the work)
- Don't use high alpha (0.6+) on dark backgrounds — keep 0.1–0.3
- Don't make animations bouncy or playful
- Don't over-saturate status colors
- Don't cram information — more whitespace when in doubt
- Don't use low alpha on light backgrounds — use 0.5–0.7 on light backgrounds

---

## 13. Infrastructure & Integrations

### 13.1 Vercel Deployment

- Mumbai region (low latency for Indian users)
- CSP headers configured
- Cron jobs: daily snapshot capture (`POST /api/admin/snapshots`), abandonment tracking (daily — Vercel Hobby plan limit, cannot run more frequently)
- Environment variables for all secrets
- Preview deployments for testing

### 13.2 Supabase Auth

- Email OTP only. No passwords, no phone OTP.
- JWT sessions, 30-day persistence
- Rate limiting on OTP requests
- Account lockout after 5 failed attempts
- Role-based access: `applicant` → `/app/*`, `admin`/`super_admin` → `/admin/*`
- Middleware enforces routing at the edge

### 13.3 Claude API Integration

- **Model: `claude-sonnet-4-20250514` — locked. Never swap silently.**
- Used for: onboarding conversations (streaming), compatibility extraction (temperature 0), match scoring
- System prompts are server-only (`prompts.ts` imports `server-only`)
- Client only receives chat metadata (title, maxExchanges, nudgeText) from `chat-metadata.ts`

### 13.4 Resend (Email)

- Transactional email for all 5 payment touchpoints + event-driven notifications
- Templates stored in `email_templates` table (editable without redeployment)
- Variables: `{{first_name}}`, `{{match_link}}`, `{{expiry_date}}`, etc.
- Event-driven emails: new match presented, match response received, payment status transitions
- Respects user preferences in `notification_preferences`

### 13.5 MSG91 (SMS)

Locked. Best-in-class Indian SMS gateway. Used for OTP delivery and notifications.

### 13.6 BGV Provider

13-check integration. Webhook handler at `/api/webhooks/bgv` for completion events. Status tracked in `bgv_checks` table.

### 13.7 Airtable Sync

One-way: Supabase → Airtable. Never write structural data to Airtable. Sync status visible at `/admin/settings`. Manual trigger available.

### 13.8 Push Notifications

VAPID keys for Web Push API. Subscriptions in `push_subscriptions`. Service worker handles push events. API: `POST /api/app/push-subscription`.

### 13.9 Rate Limiting

In-memory rate limiting on all 42 API routes (v1). Redis rate limiting deferred to v2 when user volume justifies it.

### 13.10 Daily Snapshots Cron

`POST /api/admin/snapshots` — Vercel cron (daily). Captures all KPI counts in `daily_snapshots`. Powers sparklines and trend percentages on admin dashboard.

---

## 14. Security & Privacy

### 14.1 Auth & Sessions

- Email OTP only — no passwords to leak or crack
- JWT-based, 30-day persistence
- Rate limiting + lockout on OTP requests
- All API routes validate JWT and role

### 14.2 Database Security

- RLS on every table — applicants only access their own data
- Admins have role-based access controlled by middleware
- JSONB fields validated server-side before storage

### 14.3 Photo Privacy

- Client-side compression — original uncompressed files never touch the server
- Server-side blur (Sharp sigma 20) — stored as a separate file, not CSS
- Private Supabase Storage bucket — signed URLs with short expiry, generated server-side
- Unblurred photos only served after mutual interest + payment confirmed

### 14.4 Document Security

- Identity documents in private bucket, signed URLs only
- Never exposed to other applicants
- Accessible to admin with signed URLs

### 14.5 AI System Prompt Security

- Full system prompts in `prompts.ts` with `server-only` import — never sent to browser
- Client-side `chat-metadata.ts` contains only non-sensitive metadata (title, maxExchanges, nudgeText)

### 14.6 Privacy Principles

- Data collected only for matchmaking and verification
- No advertising, no third-party data sharing
- Applicants can pause, delete, and export their data
- BGV consent required — no consent = profile deleted within 30 working days
- Verification results strictly confidential — never shared with other members

---

## 15. Pre-Launch Checklist

> **Audit status:** A comprehensive two-pass pre-launch audit was completed on April 4, 2026 (17 agents, 8 streams, two independent passes with reconciliation). Full report in `AUDIT.md → Phase 2F — Pre-Launch Audit`. 0 CRITICAL issues, 0 HIGH issues. Two items require founder decision before first real applicant.

### Restore Testing State
- [ ] **[REQUIRED — founder action]** Restore all form fields to `required: true` per PRD spec (`src/lib/form/questions.ts`) — currently `required: false` for testing
- [ ] **[REQUIRED — founder action]** Verify `minFiles` values are correct (photos: 3, documents: per question)
- [x] ~~`GuidedPhotoUpload` slots restored to required~~ — fixed in audit (`face_closeup` set to `required: true`)
- [x] ~~Remove "Skip conversation" button from `ChatInterface`~~ — fixed in audit

### Delete Seed Data
- [x] ~~Delete `scripts/seed-dashboard.mjs`~~ — deleted in audit
- [x] ~~Delete `src/app/api/admin/seed/route.ts`~~ — deleted in audit

### Resolve Before First Real Applicant
- [ ] **[REQUIRED — founder action]** Fix `Q56b`/`Q57` duplicate `questionNumber: 57` in `src/lib/form/questions.ts:729–730`. Renumber Q57 → 58, cascade Q58–Q100 up by 1. Requires migration to update any existing `onboarding_last_question` values 57–100.

### Deploy Infrastructure
- [ ] Run `supabase db push` to deploy migration `20260404000001_add_missing_indexes.sql` (4 performance indexes added in audit)

### Complete Admin Pending Items
- [ ] Document viewer on applicant detail page
- [ ] Conversation transcript viewer on applicant detail page
- [ ] Send email inline + communication history on applicant detail page
- [ ] In-progress tab on applicant list
- [ ] Verification page search + sort

### End-to-End Testing
- [ ] Invite 3–5 real test users, watch them fill the form
- [ ] Test full admin workflow (review, approve, BGV, match, present)
- [ ] Verify all 3 Claude chats complete correctly (Q38: 4 exchanges, Q75: 6 exchanges, Q100: 1 exchange only)
- [ ] Test GooCampus gate: GooCampus member must never see the verification fee screen
- [ ] Verify email notifications firing correctly
- [ ] Verify payment status state machine transitions
- [ ] Run `npx playwright test` once dev server is running — 7 existing suites + new GooCampus + Q100 tests

### Audit-Verified Items (No Action Needed)
The following were explicitly verified during the April 4 audit:
- All 47 API routes have auth guards — no unauthenticated endpoints
- All 7 critical business rules are correctly implemented in code (BGV gate, GooCampus gate, membership start date, Q100 exchange limit, photo blur, pricing constants, Claude model)
- RLS enabled on all core database tables
- Scroll overrun bug fixed (`SectionSidebar.tsx:217` and `SectionNavigationButtons.tsx:31,66`)
- Validation error accessibility fixed (`QuestionField.tsx` — `role="alert"`)
- 4 missing database indexes added (`20260404000001` migration)

---

## 16. Locked Rules — Never Break

| Rule | Consequence of Breaking |
|------|------------------------|
| Verification fee = ₹7,080 (₹6K + 18% GST) | Silently corrupts legal copy, emails, DB |
| Membership fee = ₹41,300 (₹35K + 18% GST) | Silently corrupts legal copy, emails, DB |
| Q-numbers locked at 100 base questions | Breaks save-and-resume, extraction JSON, chat prompts |
| Claude model = `claude-sonnet-4-20250514` | Extraction quality calibrated to this model |
| Photo blur = Sharp sigma 20, server-side, stored as separate file | CSS blur is DOM-removable; must be in the file |
| BGV requires BOTH conditions (consent + payment) | Legal and trust issue |
| `membership_start_date` = mutual interest date, NOT payment date | Applicant gets less time than promised |
| Supabase is source of truth — never write structural data to Airtable | Data integrity; Airtable is read-only |
| GooCampus members: verification fee screen must never render | Never leak payment UI to them, even briefly |
| AI system prompts are server-only | Never expose full prompts to the client |
| Q100 is one exchange only | One prompt → one response → fixed closing message → stored verbatim |
| Q3 (email) and Q4 (phone) stored in auth.users only | No separate fields in profiles — would create duplication |

---

## 17. Key Files Reference

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Build context, locked decisions, gotchas, session safety rails |
| `plan.md` | Living status tracker — read at start of every session |
| `design.md` | Phase 2F design direction, card designs, tokens |
| `Samvaya_Claude_Chat_Prompts_v1.md` | System prompts, branching logic, extraction JSON, prompt versioning |
| `Samvaya_Phase2_PRD_v10.md` | This file — consolidated product spec |
| `AUDIT.md` | Full audit log across all phases. Phase 2F Pre-Launch Audit (Apr 4, 2026): 17 agents, 8 streams, two-pass methodology. 43 issues found, 29 fixed, 0 CRITICAL, 0 HIGH remaining. |
| `src/app/admin/page.tsx` | Admin dashboard home (5-row command center) |
| `src/components/admin/dashboard/` | 11 dashboard components |
| `src/components/admin/AdminSidebar.tsx` | Collapsible sidebar |
| `src/components/admin/MetricCard.tsx` | KPI card with trend + sparkline |
| `src/components/app/StatusDashboard.tsx` | 5 user-facing dashboard cards |
| `src/lib/form/questions.ts` | 100 question definitions |
| `src/lib/form/conditional-rules.ts` | 27 conditional visibility rules |
| `src/lib/claude/prompts.ts` | Server-only AI system prompts |
| `src/lib/claude/chat-metadata.ts` | Client-safe chat metadata only |
| `src/lib/matching/pre-filter.ts` | `get_prefiltered_candidates()` implementation |
| `src/lib/matching/scoring.ts` | Claude API compatibility scoring |
| `src/lib/email/notifications.ts` | Event-driven email notifications |
| `src/lib/utils.ts` | `formatDateIN()`, `timeAgo()`, `daysSince()` |
| `src/app/api/admin/snapshots/route.ts` | Daily snapshot capture + retrieval |
| `supabase/migrations/` | 22 migrations (full schema history) |
| `globals.css` | Design tokens: card-glass, glass-sub-card, btn-primary, bg-page-warm, etc. |

---

*Samvaya Phase 2 PRD v10.0 — April 3, 2026 — Confidential — GooCampus / Samvaya*
