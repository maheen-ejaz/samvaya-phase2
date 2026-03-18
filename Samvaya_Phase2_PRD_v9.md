# Samvaya Phase 2 — Product Requirements Document (PRD)

**Version:** 9.3
**Date:** March 2026
**Status:** Confidential — GooCampus / Samvaya
**Scope:** Onboarding Form + Admin Dashboard + Matching Algorithm + User PWA + Code Hardening
**Changelog v9.3:** Updated March 18, 2026: Added Phase 2E — Code Hardening & Production Readiness (12-day plan) to Section 10. Updated phased delivery table.
**Changelog v9.2:** Updated March 16, 2026: Full PRD audit to sync with codebase reality. Added 9 missing table schemas (bgv_checks, communication_log, email_templates, notification_preferences, push_subscriptions, introduction_availability + missing columns on users, compatibility_profiles, match_suggestions). Added 2 RPC function specs (get_prefiltered_candidates, handle_match_response). Updated all phase banners to COMPLETE. Added Phase 2D to phased delivery table. Updated feature status for 5 features built in Phase 2D. Added event-driven notification email documentation. Updated guided photo upload system (Q95 slots, client-side compression). Version bump reflects all Phases 2A–2D complete and ready for production deployment.
**Changelog v9.1:** Updated March 15, 2026: Synced 9 form question specs with implementation (Q6, Q13, Q26, Q29, Q31, Q54, Q60, Q82, Q84) and added 3 missing schema columns.
**Changelog v9.0:** Comprehensive two-pass audit for Claude Code readiness. Pass 1 fixes: (1) bgv_consent annotation corrected to Q99. (2) profiles table description updated to 100-question form. (3) partner_preferences range annotation corrected to Q76–Q94. (4) closing_freeform_note annotation corrected to Q100. (5) Section 4.3 intro corrected to 100 base questions. (6) SMS stack locked to MSG91. (7) BGV trigger corrected from "Premium membership" to "verification fee payment". (8) Auth corrected to email OTP only. (9) Deployment locked to single domain. (10) Section 10 Build Plan replaced with locked day-by-day plan. (11) Section 12 Open Questions fully replaced with resolved decisions table. (12) Section 7 given proper header. (13) Terminology cleaned: "basic/deep" and wrong "Premium" tier labels removed. (14) Razorpay entries in Tech Log annotated as v2 deferred. (15) Refund policy given section header 6B.4. Pass 2 fixes: (16) Section 4.6 critical architectural error corrected — AI chats are embedded mid-form at Q38/Q75/Q100, not a separate post-form screen; explicit Claude Code implementation note added. (17) documents table enum corrected to match what the form actually collects (identity_document, kundali, other); note added distinguishing from photos table. (18) profiles table annotated to show Q3/Q4 (email/phone) are stored in auth.users, not duplicated. (19) Phase 2B and 2C warning banners added to Sections 5 and 7. (20) Section ordering fixed — 6B moved to follow Section 6; duplicate Sections 8 and 9 renumbered to 14 and 15. (21) Section 2.1 stack table Razorpay entry updated to note v1 manual flag / v2 deferral. (22) membership_tier table cell fixed — pipe character removed to prevent Markdown table break. (23) Section 14 Refund Policy cross-reference corrected from "Section 7" to "Section 6B.4".

---

## 1. Context & Current State

### 1.1 What Has Been Completed (Phase 1)

Samvaya Phase 1 is complete. The following are live and operational:

- **Waitlist landing page** at `apply.samvayamatrimony.com`
- **Waitlist form** collecting basic applicant information
- **Data infrastructure** for the waitlist: Supabase (source of truth), Google Sheets (automation triggers via n8n for WhatsApp and email), Airtable (team-facing working copy for data manipulation)
- **Marketing and distribution**: Meta paid ads (Instagram + Facebook) driving traffic to the waitlist. YouTube video boosted for awareness. Promotion to internal GooCampus client base.
- **Main website** at `samvayamatrimony.com`

People are actively filling the waitlist form. Phase 1 is considered closed.

### 1.2 What Phase 2 Must Accomplish

Phase 2 transitions Samvaya from "collecting interest" to "operating as a matchmaking platform." This means:

1. **A detailed onboarding form** that captures everything needed for the matching algorithm — built as a custom form within Samvaya's own systems (not a third-party form tool)
2. **An AI-powered onboarding conversation** (Claude API) that captures nuanced compatibility signals through open-ended questions
3. **A matching algorithm** that scores compatibility between profiles using both structured form data and AI conversation data, producing numerical scores and narrative explanations
4. **An admin dashboard** (desktop-first) for the Samvaya team to manage users, review matches, handle verification, track progress, and operate the platform day-to-day
5. **A user-facing progressive web app (PWA)** (mobile-first) for applicants to fill the form, track progress, view curated matches, accept/reject, and provide feedback

### 1.3 Phased Delivery Within Phase 2

Phase 2 is delivered in sub-phases:

| Sub-Phase | Scope | Status |
|-----------|-------|--------|
| **2A** | Onboarding form (structured + AI chat) + Database schema + Admin dashboard (internal tool) | **COMPLETE** |
| **2B** | Matching algorithm (AI-powered scoring + feedback loop) | **COMPLETE** |
| **2C** | User-facing PWA (mobile-first interface) | **COMPLETE** |
| **2D** | PWA polish + features: pause/resume, notification preferences, edit profile, push notifications, service worker, introduction scheduling, photo management | **COMPLETE** |
| **2E** | Code hardening & production readiness: security sweep, UX polish, accessibility, E2E testing, performance audit, production deployment | **IN PROGRESS** |

**Sub-phases 2A through 2D are complete as of March 2026.** Phase 2E (code hardening) is in progress — Days 1-7 complete.

---

## 2. Technical Decisions

### 2.1 Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend (Admin) | Next.js 16 (App Router), TypeScript, Tailwind CSS | Desktop-first, data-dense views, charts, tables |
| Frontend (User PWA) | Next.js 16 (App Router), TypeScript, Tailwind CSS | Mobile-first, installable as PWA, shared codebase with admin |
| Backend / API | Next.js API Routes | Server-side logic, webhook handlers, AI API calls |
| Database (Source of Truth) | Supabase (PostgreSQL) | Relational data, RLS, real-time subscriptions, auth |
| Database (Team Working Copy) | Airtable (synced from Supabase) | Team-friendly interface for data manipulation without touching source of truth |
| AI / Matching | Anthropic Claude API | Onboarding conversation, compatibility scoring, match narratives |
| Payments | **v1: Manual flag only.** Razorpay deferred to v2 | v1: team collects payment offline, manually sets `verification_fee_paid = true`. Razorpay (UPI, cards, net banking) is Phase 2C. |
| Hosting | Vercel | Next.js deployment, edge functions, CDN |
| SMS | MSG91 | OTP delivery, notifications (locked — best-in-class Indian SMS gateway) |
| Email | Resend | Transactional emails |

### 2.2 Why Supabase (Confirmed)

Supabase remains the database of choice. Reasons:

- Already in use for the waitlist (continuity)
- PostgreSQL gives relational power for matching queries
- Row-level security for data protection
- Built-in auth (email OTP — no passwords)
- Real-time subscriptions for dashboard updates
- Storage for photos and documents
- The founder can interact with data through the Supabase dashboard when needed

### 2.3 Data Sync: Supabase → Airtable

All data lives in Supabase as the source of truth. A sync mechanism (webhook, n8n automation, or Supabase edge function) pushes relevant data to Airtable so the team can:

- View and filter applicant data in a familiar spreadsheet-like interface
- Add internal notes and tags
- Track verification status manually
- Collaborate without risk of corrupting the source database

**Critical rule:** Airtable is read-heavy, write-light. Any structural changes to applicant data (status changes, match assignments) should flow through the admin dashboard → Supabase, then sync to Airtable. Airtable is for viewing and annotating, not for primary data entry.

### 2.4 Single Codebase Architecture

The admin dashboard and user PWA share a single Next.js codebase deployed on Vercel. They are differentiated by:

- **Route groups**: `/admin/*` for the admin dashboard, `/app/*` for the user-facing PWA
- **Authentication & roles**: Supabase Auth with role-based access. Admin users see `/admin/*`, applicant users see `/app/*`
- **Layout and design**: Admin routes use a desktop-optimized layout (sidebar, wide tables, charts). User routes use a mobile-optimized layout (bottom nav, card-based UI, large touch targets)
- **Middleware**: Next.js middleware checks auth state and role, redirecting unauthorized access

---

## 3. Database Schema

### 3.1 Design Principles

- All tables include: `id` (UUID, primary key), `created_at`, `updated_at` (timestamps in UTC)
- Supabase Row-Level Security (RLS) on every table
- Foreign keys with cascading deletes where appropriate
- JSONB fields for flexible, semi-structured data (e.g., preferences, AI outputs)
- Enum types for status fields

### 3.2 Core Tables

#### `waitlist`
Migrated from Phase 1. Stores original waitlist submissions.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| full_name | text | |
| phone | text | |
| email | text | |
| specialty | text | Medical specialty |
| career_stage | enum | student, resident, junior_doctor, consultant, specialist |
| city | text | |
| country | text | |
| status | enum | pending, invited, converted, rejected |
| invited_at | timestamp | When invitation was sent |
| converted_at | timestamp | When they started onboarding |
| utm_source | text | Marketing attribution |
| utm_medium | text | |
| utm_campaign | text | |

#### `users`
Linked to Supabase `auth.users`. Created when a waitlist member is invited and begins onboarding.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key, FK to auth.users |
| waitlist_id | UUID | FK to waitlist (nullable — for users who skip waitlist) |
| role | enum | applicant, admin, super_admin |
| is_goocampus_member | boolean | True if this applicant is an existing paying GooCampus client. Verification fee is waived. Set manually by team at account creation. |
| membership_tier | enum | standard, premium_concierge. `standard` = ₹35,000 membership. `premium_concierge` = ₹1.5L–₹2L founder-led service. |
| payment_status | enum | unverified, verification_pending, in_pool, match_presented, awaiting_payment, active_member, membership_expired | The current stage in the payment and membership lifecycle. See Section 6B for state transition rules. |
| membership_status | enum | onboarding_pending, onboarding_in_progress, onboarding_complete, active, paused, suspended, deleted |
| onboarding_section | integer | Current section (1–13) in the onboarding form — for save-and-resume |
| onboarding_last_question | integer | Last answered question number — for save-and-resume to exact position |
| ai_conversation_status | enum | not_started, conv1_in_progress, conv1_complete, conv2_in_progress, conv2_complete, conv3_in_progress, all_complete |
| profile_completion_pct | integer | 0–100, computed |
| bgv_consent | enum | not_given, consented | Mirrors Q99 consent toggle (BGV Consent, Section L). DB enum retains `consented_wants_call` and `refused` for backward compatibility but only `not_given` and `consented` are used. |
| is_bgv_complete | boolean | True when all 13 checks are verified |
| bgv_flagged | boolean | True if any check returned a flag |
| verified_at | timestamp | When BGV completed |
| gate_answers | jsonb | Stores gate question answers (Q10, Q19, Q24) as `{"Q10": "yes", "Q19": "no", "Q24": "yes"}`. These control conditional visibility but do not map to dedicated DB columns. |
| is_paused | boolean | Default false. When true, user is excluded from matching pool via `get_prefiltered_candidates()`. Toggled from `/app/settings`. |
| paused_at | timestamp | When user last paused their profile. Null if never paused. |

#### `profiles`
Core profile data collected through the onboarding form. Each column maps to a specific finalized question in the 100-question form.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | FK to users |
| — **Personal** — | | |
| first_name | text | Q1 |
| last_name | text | Q2 |
| *(email — Q3)* | — | *Stored in Supabase `auth.users.email`, not duplicated here* |
| *(phone — Q4)* | — | *Stored in Supabase `auth.users.phone`, not duplicated here* |
| gender | enum | male, female — Q5 |
| referral_source | enum | instagram, linkedin, friend, goocampus, google, other — Q6 |
| marital_status | enum | first_marriage, divorced, widowed — Q7 |
| has_children_from_previous | boolean | Q8 — conditional on Q7 |
| date_of_birth | date | Q9 |
| time_of_birth | text | Q11 — optional, conditional on Q10 = Yes |
| place_of_birth | text | Q12 |
| city_of_birth | text | Q13 or Q14 — autocomplete (Indian states) or short answer (outside India) |
| blood_group | text | Q15 — optional |
| mother_tongue | text | Q16 |
| languages_spoken | text[] | Array — Q17 |
| — **Location & Citizenship** — | | |
| citizenship_country | text | Q18 |
| employment_visa_country | text | Q20 — conditional on Q19 = Yes |
| current_country | text | Q21 |
| current_state | text | Q22 — conditional on Q21 = India |
| current_city | text | Q23 |
| permanent_city | text | Q25 — conditional if permanent ≠ present |
| permanent_ownership | enum | owned, rented, family_home — Q26 — conditional |
| — **Religion & Community** — | | |
| religion | text | Q27 |
| religious_observance | enum | actively_practicing, culturally_observant, spiritual, not_religious — Q28 |
| believes_in_kundali | boolean | Q29 |
| caste_comfort | boolean | Q30 — does caste matter to them |
| caste | text | Q31 — conditional on Q30 = yes |
| — **Family** — | | |
| father_name | text | Q32 |
| father_occupation | text | Q33 |
| father_occupation_other | text | Q34 — conditional on Q33 = Other |
| mother_name | text | Q35 |
| mother_occupation | text | Q36 |
| mother_occupation_other | text | Q37 — conditional on Q36 = Other |
| siblings_count | integer | Q39 |
| — **Physical** — | | |
| height_cm | integer | Q40 |
| weight_kg | integer | Q41 |
| skin_tone | text | Q42 — optional: fair, wheatish, dusky, dark |
| — **Lifestyle** — | | |
| diet | enum | vegetarian, non_vegetarian, eggetarian, vegan, jain, other — Q43 |
| attire_preference | enum | modern_western, traditional, mix, no_preference — Q44 |
| fitness_habits | enum | regularly_exercises, occasionally, rarely, not_interested — Q45 |
| smoking | enum | never, occasionally, frequently — Q46 |
| drinking | enum | never, occasionally, frequently — Q47 |
| tattoos_piercings | enum | none, tattoos_only, piercings_only, both — Q48 |
| has_disability | enum | yes, no, prefer_not_to_disclose — Q49 |
| disability_description | text | Q50 — conditional |
| has_allergies | boolean | Q51 |
| allergy_description | text | Q52 — conditional |
| — **Interests** — | | |
| hobbies_interests | text[] | Array of selected hobby categories and items — Q53 |
| hobbies_regular | text[] | Array — which 2–3 they actually do regularly (multi-select from Q53 selections, max 3) — Q54 |
| hobbies_other | text | Q55 — conditional on "Other" selected in Q53 |
| — **Goals & Values** — | | |
| marriage_timeline | enum | within_6_months, 6_to_12_months, 1_to_2_years, no_fixed_timeline — Q63 |
| long_distance_comfort | enum | yes_absolutely, open_to_it, prefer_same_location — Q64 |
| post_marriage_family_arrangement | enum | nuclear, joint, flexible, no_preference — Q65 |
| both_partners_working_expectation | enum | both_continue, comfortable_either_way, i_prefer_home, prefer_partner_home, open — Q66 |
| wants_children | enum | yes, no, open — Q67 |
| children_count_preference | enum | 1, 2, 3_or_more, no_preference — Q68 — conditional |
| children_timing_preference | enum | within_1_2_years, after_3_5_years, after_milestones, no_preference — Q69 — conditional |
| open_to_partner_with_children | enum | yes, no, open — Q70 — conditional on Q7 = divorced/widowed |
| preferred_settlement_countries | text[] | Array — Q71 |
| open_to_immediate_relocation | enum | yes, no, open — Q72 |
| plans_to_go_abroad | boolean | Q73 |
| abroad_countries | text[] | Q74 — conditional on Q73 |

#### `medical_credentials`
Medical education and career details, mapped to Section H and Section I of the onboarding form.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | FK to users |
| — **Education** — | | |
| current_status | enum | mbbs_student, intern, mbbs_passed, pursuing_pg, completed_pg — Q56 |
| pg_plans | enum | yes_within_1_year, yes_2_to_3_years, no_plan_to_practice, undecided — Q57 — conditional on Q56 = mbbs_passed |
| additional_qualifications | text[] | Array of selected qualifications — Q58 |
| additional_qualifications_other | text | Q59 — conditional if Other selected |
| specialty | text[] | Array of selected specialties — Q60 |
| — **Career** — | | |
| has_work_experience | boolean | Q61 |
| work_experience | jsonb | Array of {org_name, designation, start_month, start_year, end_month, end_year, is_current} — Q62 — conditional on Q61 |
| current_designation | text | Extracted from the most recent work_experience entry where is_current = true. Stored as a flat field for fast querying. e.g. "Senior Resident", "Consultant", "Associate Professor" |
| total_experience_months | integer | Total post-MBBS work experience in months, calculated from all work_experience timeline entries. Stored as a flat field so it doesn't need to be recalculated on every render. Displayed on member card as years and months: e.g. 50 months → "4 years, 2 months" |
| — **Post-Onboarding (profile completion prompt)** — | | |
| monthly_remuneration_range | text | Collected after onboarding via profile completion prompt, not during form. Ranges: ₹0–1L / ₹1L–2.5L / ₹2.5L–5L / ₹5L–7.5L / ₹7.5L–10L / Above ₹10L |
| linkedin_url | text | Collected post-onboarding — mandatory |
| instagram_handle | text | Collected post-onboarding — optional |

*(Note: Relocation and settlement preferences are stored directly in the `profiles` table — see `preferred_settlement_countries`, `open_to_immediate_relocation`, `plans_to_go_abroad`, `abroad_countries`, and `long_distance_comfort` fields above. No separate relocation table needed.)*

#### `partner_preferences`
What the applicant is looking for in a partner. Maps directly to Section K of the onboarding form (Q76–Q94).

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | FK to users |
| — **Demographics** — | | |
| preferred_age_min | integer | Q76 |
| preferred_age_max | integer | Q76 |
| preferred_height_min_cm | integer | Q77 |
| preferred_height_max_cm | integer | Q77 |
| — **Medical** — | | |
| prefers_specific_specialty | boolean | Q78 |
| preferred_specialties | text[] | Q79 — conditional on Q78 = yes |
| preferred_career_stage | text[] | Array of acceptable stages — Q92 |
| — **Location** — | | |
| preferred_indian_states | text[] | Multi-select — Q80 |
| preferred_countries | text[] | Multi-select countries outside India — Q80 |
| no_location_preference | boolean | Q80 — if true, both arrays above are ignored |
| — **Background** — | | |
| preferred_mother_tongue | text[] | Array — Q81 |
| — **Lifestyle** — | | |
| body_type_preference | text[] | Q82: slim, athletic, average, full_figured, no_preference |
| attire_preference | enum | modern_western, traditional, mix, no_preference — Q83 |
| diet_preference | text[] | Array of acceptable diets — Q84 |
| fitness_preference | enum | regularly_exercises, occasionally, rarely, no_preference — Q85 |
| smoking_preference | enum | never, occasionally, frequently, no_preference — Q86 |
| drinking_preference | enum | never, occasionally, frequently, no_preference — Q87 |
| tattoo_preference | enum | none, tattoos_only, piercings_only, both, no_preference — Q88 |
| — **Values & Family** — | | |
| family_type_preference | enum | nuclear, joint, flexible, no_preference — Q89 |
| religious_observance_preference | enum | actively_practicing, culturally_observant, spiritual, not_religious, no_preference — Q90 |
| partner_career_expectation_after_marriage | enum | both_continue, comfortable_either_way, prefer_partner_home, open — Q91 |
| — **Qualities** — | | |
| partner_qualities | text[] | Array of up to 7 selected quality tags — Q93 |
| partner_qualities_other | text | Q94 — conditional if Other selected |

#### `compatibility_profiles`
Structured output from the AI onboarding conversations. Stores both the raw transcripts and all extracted signals used by the matching algorithm and displayed as spider web graphs on internal profile cards.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | FK to users |
| raw_conversation_transcript | text | Full verbatim transcript — all three conversations concatenated with section labels. Never modified, never deleted. Ground truth for human review and future re-processing. |
| conversation_completed_at | timestamp | |
| input_mode | enum | text, voice | Whether the applicant typed or spoke their responses (voice = speech-to-text; v2 feature) |
| — **Spider Web Dimensions (0–100 each)** — | | |
| family_orientation_score | integer | How central family is to identity and daily life |
| family_orientation_notes | text | AI qualitative notes |
| career_ambition_score | integer | How much of their sense of self is tied to professional achievement |
| career_ambition_notes | text | |
| independence_vs_togetherness_score | integer | Low = strong preference for togetherness; High = strong preference for independence |
| independence_vs_togetherness_notes | text | |
| emotional_expressiveness_score | integer | How openly they communicate feelings |
| emotional_expressiveness_notes | text | |
| social_orientation_score | integer | Low = introverted; High = extroverted — inferred from conversation, not self-reported |
| social_orientation_notes | text | |
| traditionalism_score | integer | Low = modern/progressive; High = traditional — values, lifestyle, relationship roles |
| traditionalism_notes | text | |
| relocation_openness_score | integer | How rooted vs. mobile they are |
| relocation_openness_notes | text | |
| life_pace_score | integer | Low = grounded and deliberate; High = driven and fast-moving |
| life_pace_notes | text | |
| — **Additional Extracted Dimensions** — | | |
| communication_style | enum | direct, indirect, avoidant, expressive, reserved | Inferred from conversation tone and conflict response |
| conflict_approach | enum | addresses_immediately, reflects_first, withdraws, collaborative | Extracted from conflict/communication question |
| partner_role_vision | enum | co_builder, anchor_complement, flexible | What role they see their partner playing in their life |
| financial_values | enum | financially_intentional, financially_casual, financially_anxious, not_discussed | Inferred from financial values question |
| — **Summary** — | | |
| ai_personality_summary | text | 2–3 paragraph personality narrative written for the team to read |
| ai_compatibility_keywords | text[] | Array of tags for quick matching logic |
| key_quote | text | One or two sentences from the transcript that best capture the person's essence. Appears on the internal profile card. |
| ai_red_flags | text | Any concerns the extraction model flagged for team review |
| extraction_model_version | text | Claude model ID and system prompt version used to produce this extraction (e.g., "claude-sonnet-4-20250514 / prompt-v1.2"). Critical for tracking quality improvements over time and re-running extraction on old transcripts with newer models. |
| closing_freeform_note | text | Verbatim response to Q100 (closing single-exchange prompt) — stored as-is, not summarised |
| chat_state | jsonb | Stores in-progress conversation state for save-and-resume. Structure: `{ "Q38": { messages: [...], exchangeCount: N, isComplete: bool }, "Q75": {...}, "Q100": {...} }`. Allows applicants to return mid-chat across sessions. |

#### `photos`

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | FK to users |
| storage_path | text | Supabase Storage path (compressed original, max 2048px) |
| blurred_path | text | Server-generated blurred version (Sharp, sigma 20) |
| is_primary | boolean | `true` for the face close-up slot |
| display_order | integer | Slot order: 0=face_closeup, 1=full_length, 2=professional, 3=casual, 4+=additional |
| photo_type | text | `face_closeup`, `full_length`, `professional`, `casual`, `additional` |
| uploaded_at | timestamp | |
| created_at | timestamp | |
| updated_at | timestamp | |

#### `documents`
Verification documents uploaded by applicants during Section L of the onboarding form.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | FK to users |
| document_type | enum | `identity_document` (Q97 — Aadhaar or Passport), `kundali` (Q98 — conditional on Q29 = Yes), `other` |
| storage_path | text | Supabase Storage (private bucket, signed URLs only) |
| uploaded_at | timestamp | |
| verification_status | enum | pending, verified, rejected, needs_resubmission |
| verified_by | UUID | FK to users (admin) |
| verified_at | timestamp | |
| rejection_reason | text | |
| created_at | timestamp | |
| updated_at | timestamp | |

*Note: All applicant photos (Q95 guided upload) are stored in the `photos` table, not here. Q96 is grouped into Q95 and does not render separately.*

### 3.3 Matching & Introduction Tables

#### `match_suggestions`
AI-generated match suggestions awaiting team review.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| profile_a_id | UUID | FK to users |
| profile_b_id | UUID | FK to users |
| overall_compatibility_score | integer | 0–100 |
| compatibility_report | jsonb | Full breakdown: dimension scores, highlights, concerns |
| match_narrative | text | AI-generated 1-paragraph explanation of why this match was suggested |
| ai_model_version | text | For tracking which model version produced the score |
| — **Review** — | | |
| recommendation | enum | strongly_recommend, recommend, worth_considering, not_recommended |
| admin_status | enum | pending_review, approved, rejected, expired |
| reviewed_by | UUID | FK to users (admin) |
| reviewed_at | timestamp | |
| admin_notes | text | |
| is_stale | boolean | Default false. Set true if either profile has been updated since scoring. |
| created_at | timestamp | |
| updated_at | timestamp | |

*Constraints: `UNIQUE (profile_a_id, profile_b_id)` and `CHECK (profile_a_id < profile_b_id)` for canonical pair ordering.*

#### `match_presentations`
Approved matches sent to applicants.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| match_suggestion_id | UUID | FK to match_suggestions |
| — **Responses** — | | |
| member_a_response | enum | pending, interested, not_interested, expired |
| member_b_response | enum | pending, interested, not_interested, expired |
| member_a_responded_at | timestamp | |
| member_b_responded_at | timestamp | |
| is_mutual_interest | boolean | Computed |
| — **Status** — | | |
| status | enum | pending, mutual_interest, one_sided, expired, declined |
| presented_at | timestamp | |
| expires_at | timestamp | Default: 7 days from presented_at |
| created_at | timestamp | |
| updated_at | timestamp | |

#### `match_feedback`
Feedback from applicants on presented matches. This feeds back into the algorithm.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| match_presentation_id | UUID | FK to match_presentations |
| user_id | UUID | FK to users (who gave the feedback) |
| response | enum | interested, not_interested |
| — **Feedback Details** — | | |
| feedback_rating | integer | 1–5 (how relevant was this match?) |
| feedback_text | text | Free-text feedback |
| what_worked | text[] | Array of aspects they liked |
| what_didnt_work | text[] | Array of aspects that didn't fit |
| would_like_more_like_this | boolean | |
| specific_concern | text | |
| created_at | timestamp | |

*Constraint: `UNIQUE (match_presentation_id, user_id)` — one feedback per user per presentation.*

#### `introductions`
Tracks video introductions between matched applicants.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| match_presentation_id | UUID | FK to match_presentations |
| introduction_number | integer | 1st, 2nd, etc. |
| scheduled_at | timestamp | |
| meeting_link | text | Google Meet link |
| is_team_facilitated | boolean | First intro = facilitated |
| facilitator_id | UUID | FK to users (admin) |
| status | enum | scheduled, completed, rescheduled, cancelled, no_show |
| — **Outcomes** — | | |
| outcome_member_a | enum | want_to_continue, not_a_match, need_more_time |
| outcome_member_b | enum | same |
| team_feedback_notes | text | |
| created_at | timestamp | |
| updated_at | timestamp | |

### 3.4 Payment Tables

#### `payments`

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | FK to users |
| payment_type | enum | verification_fee, membership_fee, membership_renewal | Matches the two payment stages in Samvaya's pricing model |
| amount | integer | In smallest currency unit (paise for INR) |
| currency | text | INR |
| verification_fee_paid | boolean | **v1 only** — manually set to `true` by the team once offline payment is confirmed. Razorpay integration deferred to v2. BGV cannot start until this is true AND bgv_consent is set. |
| razorpay_order_id | text | **v2** — Razorpay integration, deferred. Null in v1. |
| razorpay_payment_id | text | **v2** — deferred |
| razorpay_signature | text | **v2** — deferred |
| status | enum | created, authorized, captured, failed, refunded |
| paid_at | timestamp | |
| refunded_at | timestamp | Populated only for technical error refunds |
| refund_reason | text | Populated only for technical error refunds |
| — **Membership timing** — | | |
| membership_start_date | date | The date both applicants mutually agreed to proceed. This is the trigger for the 6-month access window — NOT the payment date. Null for verification_fee payments. |
| membership_expiry_date | date | Computed: membership_start_date + 6 months. Extended if Samvaya fails to deliver 3 match presentations. |
| match_presentation_id | UUID | FK to match_presentations — the specific match that triggered this membership payment |
| is_goocampus_member | boolean | True if this payment is from a GooCampus member. Verification fee is waived for these applicants. |

### 3.5 Admin & System Tables

#### `admin_notes`

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| entity_type | enum | user, match_suggestion, match_presentation, introduction |
| entity_id | UUID | ID of the related entity |
| admin_user_id | UUID | FK to users |
| note_text | text | |

#### `activity_log`
Tracks all significant actions for audit trail.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| actor_id | UUID | FK to users |
| action | text | e.g., "approved_match", "rejected_profile", "sent_invitation" |
| entity_type | text | |
| entity_id | UUID | |
| metadata | jsonb | Additional context |

#### `system_config`
Key-value store for configurable settings.

| Column | Type | Description |
|--------|------|-------------|
| key | text | Primary key |
| value | jsonb | |
| description | text | Human-readable explanation |
| updated_by | UUID | FK to users |

#### `bgv_checks`
Tracks the 13 OnGrid background verification checks per applicant. Each check has its own row.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | FK to users |
| check_type | enum | aadhaar, pan, bank_account, credit_check, employment, education, professional_reference, court_records, criminal_records, global_database, address_digital, address_physical, social_media |
| status | enum | pending, in_progress, verified, flagged |
| document_path | text | Optional path to supporting document |
| notes | text | Admin notes for this check |
| updated_by | UUID | FK to users (admin who last updated) |
| created_at | timestamp | |
| updated_at | timestamp | |

*Constraint: `UNIQUE (user_id, check_type)` — one row per check per applicant.*

#### `communication_log`
Tracks all emails and SMS sent to applicants — both manual and automated.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | FK to users (recipient) |
| sent_by | UUID | FK to users (sender admin, or system) |
| channel | enum | email, sms |
| subject | text | Email subject (nullable for SMS) |
| body | text | Message body |
| status | enum | sent, failed, pending |
| sent_at | timestamp | |
| scheduled_at | timestamp | For scheduled/bulk sends |
| batch_id | UUID | Groups messages from a single bulk send operation |
| created_at | timestamp | |

#### `email_templates`
Reusable email templates for bulk and triggered communications.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | text | UNIQUE template name |
| subject | text | Email subject (supports `{{variable}}` interpolation) |
| body | text | Email body (supports `{{variable}}` interpolation) |
| category | text | Default 'general'. Others: payment, verification, matching |
| variables | text[] | List of variable names used in this template |
| created_by | UUID | FK to users (admin) |
| created_at | timestamp | |
| updated_at | timestamp | |

*Pre-seeded templates: "Verification Fee Reminder", "BGV Initiated", "BGV Complete — Welcome to the Pool".*

### 3.6 PWA Feature Tables

#### `notification_preferences`
Per-user notification toggles. Created with defaults when user first visits settings.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | FK to users (UNIQUE) |
| email_new_match | boolean | Default true |
| email_match_response | boolean | Default true |
| email_status_update | boolean | Default true |
| email_promotions | boolean | Default false |
| push_new_match | boolean | Default true |
| push_match_response | boolean | Default true |
| push_status_update | boolean | Default true |
| created_at | timestamp | |
| updated_at | timestamp | |

#### `push_subscriptions`
Web Push API subscription records. One user may have multiple devices.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | FK to users |
| endpoint | text | Push service endpoint URL |
| p256dh | text | Public key for encryption |
| auth | text | Auth secret |
| created_at | timestamp | |
| updated_at | timestamp | |

*Constraint: `UNIQUE (user_id, endpoint)` — one subscription per device per user.*

#### `introduction_availability`
Applicant-submitted availability for video introductions. 14-day rolling calendar with time slots.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | FK to users |
| match_presentation_id | UUID | FK to match_presentations |
| available_date | date | Specific date within the 14-day window |
| time_slot | text | morning, afternoon, evening |
| notes | text | Optional notes (e.g., "prefer after 5pm") |
| created_at | timestamp | |
| updated_at | timestamp | |

*Constraint: `UNIQUE (user_id, match_presentation_id, available_date, time_slot)`.*

### 3.7 RPC Functions

#### `get_prefiltered_candidates(target_user_id UUID)`
Returns `TABLE(candidate_id UUID)`. Pre-filters the matching pool using hard constraints before Claude API scoring.

**Filters applied:**
- Opposite gender
- Bidirectional age range overlap (both users' min/max preferences)
- Location overlap (preferred states/countries or no_location_preference)
- Smoking/drinking preference compatibility
- Excludes: self, paused users (`is_paused = true`), existing match_suggestions
- Requires: `is_bgv_complete = true` AND `payment_status IN ('in_pool', 'match_presented')`

#### `handle_match_response(p_presentation_id UUID, p_user_id UUID, p_response TEXT)`
Returns JSONB. Atomically processes a match response with row-level locking (`FOR UPDATE`).

**Logic:**
1. Validates the presentation exists and belongs to this user
2. Checks expiry (rejects if past `expires_at`)
3. Prevents double-response
4. Records the response (interested / not_interested)
5. If both users have now responded: computes `is_mutual_interest`
6. On mutual interest: sets `payment_status = 'awaiting_payment'` for both users and records `membership_start_date = NOW()` on the presentation

---

## 4. Onboarding Form — Specification

### 4.1 Design Principles

- **Applicant-only**: The form must be filled by the applicant themselves. No third-party filling is permitted (no parents, siblings, or guardians). The depth and personal nature of the questions means only the applicant can answer them accurately enough to produce high-quality matches.
- **Save and resume**: Every question auto-saves immediately upon response. Medical professionals will be interrupted. They must be able to return exactly where they left off, in the same session or a future one.
- **Mobile-first design**: Large touch targets, one question or logical group per screen, progress bar always visible.
- **Conditional logic**: Questions and options show/hide based on previous responses. The form adapts to the user.
- **Validation**: Real-time validation with clear error messages. No submitting invalid data.
- **Progress indicator**: Clear step counter (e.g., "Section 3 of 13") and visual progress bar with percentage.
- **Warm tone**: All copy is warm and encouraging, not clinical. Consistent with Samvaya brand voice.
- **Time estimate**: Show estimated completion time upfront (~30–40 minutes total for form + AI conversation questions).
- **Illustrated options**: For physical description and lifestyle questions, options are accompanied by visual illustrations or icons to help applicants self-identify accurately without ambiguity.
- **City autocomplete**: All city fields use an autocomplete search that preloads cities based on the country/state selected. For India: cities filtered by state. For other countries: major cities of that country. Typing shows matching options dynamically.

### 4.2 Confidentiality Callouts

Applicants may hesitate on sensitive questions (religion, lifestyle, physical preferences, partner preferences). To address this, confidentiality callouts appear at key moments:

**Welcome screen (before Q1)** — Full callout:
> *"Everything you share here is completely confidential. We don't judge — and we never will. We ask detailed questions because the more honestly you answer, the better your matches will be. There are no right or wrong answers. Take your time."*

**Short reminder callout shown when entering these sections:**
- Section C (Religion & Community)
- Section E (Physical Details)
- Section F (Lifestyle)
- Section K (Partner Preferences)

Short reminder text: *"Your answers here are private and confidential. Be honest — this is how we find the right match for you."*

### 4.3 Form Sections & Questions

The form is finalized at **100 base questions** across 13 sections, with approximately 28–32 questions appearing conditionally based on responses. Conditional questions are marked ↳ with their trigger condition.

Three questions are handled via **Claude chat** (marked 💬) rather than traditional form fields. These are open-ended questions where a conversational exchange produces significantly richer and more honest responses than a blank text box.

---

#### SECTION A — Basic Identity

| # | Question | Type | Conditional |
|---|----------|------|-------------|
| 1 | First Name | Short Answer | — |
| 2 | Last Name | Short Answer | — |
| 3 | Email | Email | — |
| 4 | Phone Number | Phone | — |
| 5 | Gender | MC: Male / Female | — |
| 6 | How did you hear about Samvaya? | MC: Instagram / LinkedIn / Friend or Family / GooCampus / Google / Other | — |
| 7 | Have you been married before? | MC: No, this will be my first marriage / Yes, I am divorced / Yes, I am widowed | — |
| 8 | Do you have children from your previous marriage? | MC: Yes / No | ↳ if Q7 = divorced or widowed |
| 9 | Date of Birth | Date Picker | — |
| 10 | Do you know your time of birth? | MC: Yes / No | — |
| 11 | Time of Birth | Time Picker | ↳ if Q10 = Yes |
| 12 | Place of Birth | Dropdown: Outside India / All Indian states | — |
| 13 | City and country of birth | International location input (city + country) | ↳ if Q12 = Outside India |
| 14 | City of birth | Autocomplete (cities by state) | ↳ if Q12 = Indian state |
| 15 | Blood Group | Dropdown: A+ / A- / B+ / B- / AB+ / AB- / O+ / O- / Don't Know | Optional |
| 16 | Mother Tongue | Dropdown | — |
| 17 | Languages you speak fluently | Checkboxes | — |

---

#### SECTION B — Location & Citizenship

| # | Question | Type | Conditional |
|---|----------|------|-------------|
| 18 | Which country are you a citizen of? | Dropdown | — |
| 19 | Do you have an employment visa for any country other than India? | MC: Yes / No | — |
| 20 | Which country's employment visa? | Dropdown | ↳ if Q19 = Yes |
| 21 | Which country are you currently residing in? | Dropdown | — |
| 22 | Which state? | Dropdown (Indian states/UTs) | ↳ if Q21 = India |
| 23 | City of current residence | Autocomplete search (cities by country/state) | — |
| 24 | Is your permanent address the same as your present address? | MC: Yes / No | — |
| 25 | City and state/country of permanent address | Short Answer | ↳ if Q24 = No |
| 26 | Is your permanent home owned by family or rented? | MC: Owned by self or family / Rental or leased unit / Family home (not owned by self) | ↳ if Q24 = No |

---

#### SECTION C — Religion & Community
*(Confidentiality callout shown at start of this section)*

| # | Question | Type | Conditional |
|---|----------|------|-------------|
| 27 | What is your religion? | Dropdown | — |
| 28 | How would you describe your level of religious observance? | MC: Actively practicing / Culturally observant / Spiritual but not religious / Not particularly religious | — |
| 29 | Do you believe in Kundali/horoscope matching? | MC: Yes / No | ↳ Only shown for Hindu, Sikh, Buddhist, Jain religions |
| 30 | Would you be comfortable sharing your caste or community? | MC: Yes / No, I'd rather not say | — |
| 31 | What is your caste or community? | Autocomplete text input (communities data source) | ↳ if Q30 = Yes |

---

#### SECTION D — Family Background

| # | Question | Type | Conditional |
|---|----------|------|-------------|
| 32 | Father's Name | Short Answer | — |
| 33 | Father's Occupation | Dropdown | — |
| 34 | Please describe your father's occupation | Short Answer | ↳ if Q33 = Other |
| 35 | Mother's Name | Short Answer | — |
| 36 | Mother's Occupation | Dropdown | — |
| 37 | Please describe your mother's occupation | Short Answer | ↳ if Q36 = Other |
| 38 | 💬 Is there anything else you'd like to share about your parents or family? | **Claude Chat** | — |
| 39 | How many siblings do you have? | Number | — |

**Q38 Claude Chat note**: Claude asks about what home felt like growing up, family emotional texture, and the applicant's model of marriage. Siblings are discussed naturally within this conversation — no separate structured siblings description needed.

*(Note: A structured "describe your siblings" question was removed — the family chat conversation covers this more naturally and richly than a structured text field.)*

---

#### SECTION E — Physical Details
*(Confidentiality callout shown at start of this section)*

| # | Question | Type | Notes |
|---|----------|------|-------|
| 40 | Height (in cm) | Number | — |
| 41 | Weight (in kg) | Number | — |
| 42 | Skin tone *(optional)* | MC with illustrations: Fair / Wheatish / Dusky / Dark | Optional field |

---

#### SECTION F — Lifestyle
*(Illustrated options accompany choices in this section)*
*(Confidentiality callout shown at start of this section)*

| # | Question | Type | Conditional |
|---|----------|------|-------------|
| 43 | Dietary preferences | MC with illustrations: Vegetarian / Non-Vegetarian / Eggetarian / Vegan / Jain / Other | — |
| 44 | Everyday attire preference | MC with outfit illustrations: Modern/Western / Traditional / Mix of both / No preference | — |
| 45 | How would you describe your fitness habits? | MC with illustrations: Regularly exercise / Occasionally exercise / Rarely exercise / Not interested in exercise | — |
| 46 | Do you smoke? | MC with illustrations: Never / Occasionally / Frequently | — |
| 47 | Do you drink? | MC with illustrations: Never / Occasionally / Frequently | — |
| 48 | Do you have tattoos or piercings? | MC with illustrations: None / Tattoos only / Piercings only / Both | — |
| 49 | Do you have any disabilities or health conditions? | MC: Yes / No / Prefer not to disclose | — |
| 50 | Please describe your disability or health condition | Short Answer | ↳ if Q49 = Yes |
| 51 | Do you have any allergies? | MC: Yes / No | — |
| 52 | Please describe your allergies | Short Answer | ↳ if Q51 = Yes |

---

#### SECTION G — Personality & Interests
*(Note: Personality is captured through the Claude chat conversations — Q38 and Q75 — not through a self-label checkbox. Social orientation, emotional expressiveness, and communication style are inferred from how the applicant speaks in those conversations.)*

| # | Question | Type | Conditional |
|---|----------|------|-------------|
| 53 | What are your hobbies and interests? *(select all that apply)* | Checkboxes grouped into ~10 categories, each with a category illustration | — |
| 54 | Out of everything you selected, which 2 or 3 do you actually spend time on most regularly? | Multi-select (from Q53 selections, max 3) | — |
| 55 | Any other hobbies or interests not listed? | Short Answer | ↳ if "Other" selected in Q53 |

**Q53 Categories** (each category shown with one illustration, not per-item):
- 🎨 Arts & Creativity: Drawing/Painting, Photography, Writing, Music (Listening), Music (Playing), Dance, Theatre, Poetry
- ⚽ Sports & Fitness: Cricket, Football, Tennis, Badminton, Swimming, Gym/Weightlifting, Yoga, Cycling, Trekking, Running, Martial Arts, Chess
- 🌿 Outdoors & Travel: Hiking, Camping, Road Trips, Wildlife & Nature, Backpacking, Adventure Sports
- 🍳 Food & Lifestyle: Cooking, Baking, Coffee Culture, Wine & Cocktails, Gardening, Interior Design, Fashion & Style
- 💻 Tech & Gaming: Video Games, Board Games, Coding, Robotics, Gadgets
- 📚 Reading & Learning: Fiction, Non-Fiction, Philosophy, History, Science, Podcasts, Documentaries, Online Courses
- 🤝 Social & Community: Volunteering, Social Work, Activism, Spirituality & Meditation, Environmentalism
- 🎬 Entertainment: Movies, Web Series, Theatre Shows, Stand-Up Comedy, Concerts & Live Music
- ✂️ Crafts & Collecting: DIY Projects, Knitting/Crocheting, Pottery, Stamp/Coin Collecting, Origami
- Other

---

#### SECTION H — Education

| # | Question | Type | Conditional |
|---|----------|------|-------------|
| 56 | What best describes your current status? | MC: In Medical School (MBBS) / Internship / MBBS Passed / Pursuing PG / Completed PG | — |
| 57 | ↳ Are you planning to pursue postgraduate studies? | MC: Yes, within the next year / Yes, in 2–3 years / No, I plan to practice as MBBS / Undecided | ↳ if Q56 = MBBS Passed |
| 58 | Do you have any additional qualifications? | Checkboxes: MD / MS / DNB / DM / MCh / MBA / MPH / PhD / Fellowship / MRCP / USMLE / PLAB / Other | — |
| 59 | What other qualifications do you have? | Short Answer | ↳ if Other selected in Q58 |
| 60 | What specialty are you currently pursuing or planning to pursue? | Checkboxes (full specialty list) | Optional |

---

#### SECTION I — Career
*(UX: LinkedIn-style timeline. Applicant adds one entry per role. Entries displayed chronologically. "+Add another role" button for multiple entries.)*

| # | Question | Type | Conditional |
|---|----------|------|-------------|
| 61 | Have you worked or are you currently working? | MC: Yes / No | — |
| 62 | Work Experience Timeline | Timeline entries: Organisation name / Designation / Start date (Month + Year) / End date (Month + Year or "I currently work here") | ↳ if Q61 = Yes |

*(Note: Monthly remuneration removed from onboarding — moved to "Complete your profile" prompt post-onboarding.)*

---

#### SECTION J — Goals & Values

| # | Question | Type | Conditional |
|---|----------|------|-------------|
| 63 | When are you looking to get married? | MC: Within 6 months / 6–12 months / 1–2 years / No fixed timeline yet | — |
| 64 | If your match is based in a different city or country, are you open to getting to know them through video calls and visits before deciding on relocation? | MC: Yes, absolutely / Open to it / I'd prefer someone in the same city or country | — |
| 65 | What type of family arrangement do you prefer after marriage? | MC: Nuclear family / Joint family / Flexible / No preference | — |
| 66 | What are your expectations around both partners working after marriage? | MC: Both should continue working / Comfortable either way / I prefer to focus on home and family / I prefer my partner focuses on home after we have children / Open to discussion | — |
| 67 | Do you want children? | MC: Yes / No / Open to discussion | — |
| 68 | How many children are you hoping for? | MC: 1 / 2 / 3 or more / No preference | ↳ if Q67 = Yes |
| 69 | When would you ideally like to have children? | MC: Within 1–2 years of marriage / After 3–5 years / After specific career milestones / No preference | ↳ if Q67 = Yes |
| 70 | Are you open to a partner who also has children? | MC: Yes / No / Open to discussion | ↳ if Q7 = divorced or widowed AND Q8 = Yes |
| 71 | Where would you ideally like to eventually settle? *(select all that apply)* | Multi-select Dropdown (countries) | — |
| 72 | Are you open to immediately relocating for your partner? | MC: Yes / No / Open to discussion | — |
| 73 | Do you have plans to study or work outside India within the next 3 years? | MC: Yes / No | — |
| 74 | Which countries are you exploring? | Multi-select Dropdown | ↳ if Q73 = Yes |
| 75 | 💬 Future goals, ambitions, and the life you want to build | **Claude Chat** | — |

**Q75 Claude Chat note**: The richest conversation in the form. Claude covers: future goals and career vision, personal meaning beyond medicine, partner role vision (co-builder vs. anchor), what the applicant brings to a relationship, conflict and communication style, financial values, and what a partner genuinely needs to understand about their medical life. Fixed opening and closing questions; branched middle paths based on responses. Maximum 5–6 exchanges.

---

#### SECTION K — Partner Preferences
*(Confidentiality callout shown at start of this section)*

| # | Question | Type | Conditional |
|---|----------|------|-------------|
| 76 | What age range are you open to? | Two number inputs: Minimum age / Maximum age | — |
| 77 | What height range are you open to? (in cm) | Range slider: Min / Max | — |
| 78 | Would you like your partner to be pursuing a specific medical specialty? | MC: Yes / No, I'm open to all specialties | — |
| 79 | Preferred specialties | Checkboxes (full specialty list) | ↳ if Q78 = Yes |
| 80 | Where would you prefer your partner to currently be based? | Two selectors: (1) Multi-select Indian states; (2) Multi-select countries outside India. "No location preference" clears both. | — |
| 81 | Mother tongue preferences | Multi-select (or "No preference") | — |
| 82 | Body type preference | Multi-select: Slim / Athletic / Average / Full-figured / No preference | — |
| 83 | Attire preference | MC: Modern/Western / Traditional / Mix of both / No preference | — |
| 84 | Dietary preference | Multi-select: Vegetarian / Non-Veg / Eggetarian / Vegan / Jain / No preference | — |
| 85 | Fitness habit preference | MC: Regularly exercises / Occasionally / Rarely / No preference | — |
| 86 | Smoking preference | MC: Never / Occasionally / Frequently / No preference | — |
| 87 | Drinking preference | MC: Never / Occasionally / Frequently / No preference | — |
| 88 | Tattoo or piercing preference | MC: None / Tattoos only / Piercings only / Both / No preference | — |
| 89 | Family type preference | MC: Nuclear / Joint / Flexible / No preference | — |
| 90 | Religious observance preference | MC: Actively practicing / Culturally observant / Spiritual but not religious / Not particularly religious / No preference | — |
| 91 | What are your expectations around your partner's career after marriage? | MC: I expect both of us to keep working / Comfortable either way / I'd prefer my partner to focus on home and family / Open to discussion | — |
| 92 | Which career stages are you open to in a partner? | Checkboxes: Medical student / Intern / PG resident / Completed PG / Established practitioner / No preference | — |
| 93 | What qualities are you looking for in a life partner? *(select up to 7)* | Checkboxes grouped by theme (see below) | — |
| 94 | Any other qualities you're looking for? | Short Answer | ↳ if "Other" selected in Q93 |

**Q93 Quality categories:**
- **Character & Values:** Honest, Loyal, Kind, Humble, Patient, Responsible, Trustworthy, Emotionally mature, Respectful
- **Personality:** Grounded, Calm, Humorous, Intellectual, Creative, Spontaneous, Adventurous, Disciplined, Energetic, Confident
- **Relationship Style:** Affectionate, Supportive, Good listener, Direct communicator, Thoughtful, Emotionally expressive, Independent
- **Family & Home:** Family-oriented, Nurturing, Protective, Involved parent, Respectful of in-laws, Values traditions
- **Career & Ambition:** Ambitious, Hard-working, Financially responsible, Entrepreneurial, Values work-life balance, Career-driven
- **Social & Cultural:** Socially active, Community-minded, Culturally aware, Spiritually inclined, Charitable, Open to other cultures
- Other

---

#### SECTION L — Documents & Verification

| # | Question | Type | Conditional |
|---|----------|------|-------------|
| 95 | Upload your photos *(guided slots: face close-up, full-length, professional, casual, + additional; minimum 3, maximum 10; client-side compression for large files)* | Guided Photo Upload | — |
| 96 | *(Grouped into Q95 — does not render separately)* | — | — |
| 97 | Identity document *(Aadhaar or Passport)* | File Upload | — |
| 98 | Upload your Kundali | File Upload | ↳ if Q29 = Yes (believes in Kundali) |
| 99 | Background Verification Consent | Single consent toggle — mandatory (see below) | — |

**Q99 — Background Verification Consent**

Custom `bgv_consent` question type with a rich visual layout (bypasses the standard QuestionField wrapper). The screen includes:

1. **Shield icon** — centered emerald verification icon
2. **Title** — "Background Verification"
3. **Why we verify** — "At Samvaya, every member undergoes the same comprehensive verification. This ensures every profile is genuine and every match is between two verified individuals. No exceptions."
4. **What we verify** — icon-labeled checklist: identity, employment history, education credentials, financial standing, address, court & criminal records, social media
5. **Safety notes** (amber callout):
   - Verification will only begin after consent is given AND the verification fee (₹7,080) has been processed
   - If consent is not provided, the applicant's profile will be deleted within 30 working days
6. **Confidentiality note** — "All verification results are strictly confidential and are never shared with other members or third parties."
7. **Single consent toggle** — "I consent to a comprehensive background verification"

Toggle value: `consented` when on, empty when off (blocks form progression via required-field validation).

**Critical rule**: No BGV may be initiated until both conditions are met: (1) consent given (`bgv_consent = 'consented'`), and (2) verification fee (₹6,000 + GST) confirmed as paid in Supabase — either via Razorpay capture (future) or manual flag (`verification_fee_paid = true`) set by the team (v1).

---

#### SECTION M — Closing

| # | Question | Type | Conditional |
|---|----------|------|-------------|
| 100 | 💬 Closing — anything we haven't asked | **Claude Chat (single exchange)** | — |

**Q100 Claude Chat note**: A single-question, single-response exchange — not a full conversation. The applicant has been through 99 questions and two full conversations. This is a lightweight safety net, not a third interview. Claude sends one prompt, accepts one response, stores it as a freeform note. No follow-up questions.

Prompt sent to applicant:
> *"Before we finish — is there anything important about you, or about what you're looking for, that you feel this form hasn't quite captured?"*

If they answer: stored verbatim as `closing_freeform_note` on their profile.
Final message Claude sends regardless:
> *"Thank you for the care you've put into your answers. It genuinely helps us find the right person for you. We'll take it from here."*

---

### 4.4 Claude Chat Questions — Final Summary

**Total base questions: 100** (renumbered to include referral source Q6)
**Conditional questions:** ~28–32 depending on answers
**Claude chat moments:** 3 (Q38, Q75, Q100)

| # | Conversation | Section | Format | What it captures |
|---|-------------|---------|--------|-----------------|
| Q38 | Family background | D | Full conversation, 3–4 exchanges, branched paths | Family emotional texture, childhood model of marriage, domestic expectations, what a good Tuesday looks like |
| Q75 | Future goals and ambitions | J | Full conversation, 5–6 exchanges, branched paths | Career vision, personal meaning, partner role (co-builder vs. anchor), what they bring to a relationship, conflict/communication style, financial values, what a partner must understand about their medical life |
| Q100 | Closing | M | Single exchange, no follow-up | Anything unsaid — dealbreakers, context, corrections, important nuance |

The exact Claude system prompts, branching logic, and JSON extraction format are specified in Section 4.6 below.

### 4.5 Post-Onboarding: Social Media Handles

Collected after the applicant completes the onboarding form and is confirmed as a member. Presented as a profile completion prompt on their dashboard:

> *"Help us get to know you better — add your social profiles."*

| Field | Platform | Requirement |
|-------|----------|-------------|
| LinkedIn profile URL | LinkedIn | Mandatory |
| Instagram handle | Instagram | Optional |

These are stored on the profile and used by the Samvaya team for the social media check component of the BGV. They are never shared with other members.

### 4.6 AI Onboarding Conversation

> ⚠️ **Critical implementation note for Claude Code**: The three AI conversations are **embedded within the form** at specific question positions (Q38, Q75, Q100). They are NOT a separate post-form screen. When the applicant reaches Q38 mid-form, the form pauses and the chat UI renders inline. After the conversation ends, the form resumes with Q39. The same pattern applies at Q75 and Q100. Build this as an inline form component that replaces the standard question UI at these three question numbers, then hands back to the form on completion.

**Purpose**: Capture nuanced, subjective compatibility signals that structured forms cannot — communication style, emotional maturity, values depth, partnership philosophy, conflict resolution approach, and financial values.

**Implementation**:

- Chat-style UI with message bubbles, typing indicator, smooth scrolling
- Claude API called per message with full conversation history as context
- System prompt enforces fixed opening, pre-authored branching paths, fixed closing, and hard exchange limits
- Separate extraction API call runs after each conversation ends, producing structured JSON at temperature 0
- Save-and-resume: full conversation state persisted to Supabase so applicants can return mid-conversation
- Voice input: text-only in v1. Voice (speech-to-text) flagged as v2 feature. UI should show a subtle nudge: *"Take your time — longer answers help us find a better match for you."*

**Three conversations, their positions in the form, and their exchange limits:**

| Conversation | Triggered at | Exchange limit | Covers |
|---|---|---|---|
| Conv 1 — Family background | Q38, Section D | 4 exchanges max | Family emotional texture, childhood model of marriage, domestic expectations, Tuesday picture |
| Conv 2 — Goals and ambitions | Q75, Section J | 6 exchanges max | Career vision, personal meaning, partner role vision, what they bring to a relationship, conflict/communication style, financial values, what a partner must understand |
| Conv 3 — Closing | Q100, Section M | 1 exchange only | Anything unsaid — dealbreakers, context, important nuance |

**Full system prompts, branching logic, extraction prompts, API call structure, exchange counter logic, spider web dimension mapping, and prompt version tracking are documented in:**
`Samvaya_Claude_Chat_Prompts_v1.md`

**Spider web graph — 8 dimensions extracted across conversations:**

| Dimension | Description | Source |
|---|---|---|
| Family orientation | How central family is to identity and daily life | Conv 1 |
| Career ambition | How much professional achievement defines self | Conv 2 |
| Independence vs. togetherness | Preference for personal space vs. closeness | Conv 1 + 2 |
| Emotional expressiveness | How openly feelings are communicated | Conv 2 |
| Social orientation | Introverted to extroverted (inferred, not self-reported) | Conv 2 |
| Traditionalism | Modern/progressive to traditional values and roles | Conv 1 |
| Relocation openness | Rooted to highly mobile | Conv 2 |
| Life pace | Grounded and deliberate to driven and fast-moving | Conv 2 |

Two profiles whose spider webs overlap significantly signal strong compatibility. The admin dashboard displays both webs side by side for team review before any match is approved.


---

## 4B. Background Verification — Specification

### 4B.1 BGV Provider

Background verification is conducted via **OnGrid**, covering 13 checks across identity, financial, professional, legal, address, and digital footprint categories.

### 4B.2 Services Covered

Every Samvaya applicant who completes the **verification fee payment** (₹7,080) undergoes all of the following:

**Identity**
- Aadhaar Verification
- PAN Verification

**Financial & Credit**
- Bank Account Verification
- Credit Check

**Professional & Educational**
- Employment Verification (Employment History Check)
- Education Verification
- Professional Reference Check

**Legal & Criminal**
- Court Record Check
- Criminal Record Check (via Law Firm)
- Global Database Check

**Address & Residency**
- Address Verification (Digital)
- Address Verification (Physical)

**Digital Footprint**
- Social Media Check

### 4B.3 BGV Trigger Rules

BGV is never initiated automatically. Both of the following conditions must be satisfied before any check may begin:

1. **Consent confirmed**: Applicant has toggled the consent switch in Q99 of the onboarding form (`bgv_consent = 'consented'`).
2. **Payment confirmed**: Verification fee (₹6,000 + GST) has been paid and confirmed — either via Razorpay capture (future) or manually marked as paid by the team (`verification_fee_paid = true`) in the admin dashboard (v1).

If consent is not given, the applicant's profile will be deleted within 30 working days. The consent screen clearly communicates this.

### 4B.4 BGV Status Tracker (Admin Dashboard)

Each applicant's internal profile in the admin dashboard includes a BGV tracker. Each of the 13 checks is tracked independently.

**Status states per check:**

| Status | Indicator | Meaning |
|--------|-----------|---------|
| Pending | ⬜ | Not yet initiated |
| In Progress | 🔄 | Check submitted to OnGrid, awaiting result |
| Verified | ✅ | Check passed |
| Flagged | 🚩 | Check returned a concern — requires team review |

**Profile-level summary badge** (visible on applicant list view without opening the profile):

- `BGV: Not Started` — payment not yet received or consent not given
- `BGV: 4 / 13 verified` — in progress
- `BGV: Complete ✅` — all 13 checks verified
- `BGV: Flagged 🚩` — one or more checks flagged

**Admin actions per check:**
- Toggle status (Pending → In Progress → Verified / Flagged)
- Upload supporting document or report from OnGrid
- Add a note per check (visible only to the team)

---

## 5. Matching Algorithm — Specification
> ✅ **Phase 2B — COMPLETE** (March 2026). Pre-filtering SQL, Claude API compatibility scoring, match suggestions, match presentations, feedback collection, and introduction tracking are all built and operational.

### 5.1 Architecture

Three-stage process:

1. **Pre-filtering** (SQL-based): Fast elimination of incompatible pairs based on hard constraints
2. **Compatibility scoring** (Claude API): Deep analysis of remaining pairs, producing scores and narratives
3. **Human review** (Admin dashboard): Team reviews AI suggestions, approves or rejects before presenting to applicants

### 5.2 Pre-Filtering (Stage 1)

SQL queries against Supabase to narrow the pool based on hard constraints:

- **Gender**: Match based on preferred gender
- **Age**: Both parties' age falls within each other's preferred range
- **Religion**: Overlap between stated religion and partner's religion preference
- **Location**: Compatible geography preferences
- **Marital status**: Overlap between status and partner's acceptable statuses
- **Medical professional requirement**: If one party requires a medical professional partner, the other must be one
- **Deal breakers**: Exclude pairs where one party's attributes match the other's deal breakers
- **Already matched**: Exclude pairs that have been previously suggested, whether approved or rejected
- **Status**: Only include users with `membership_status = active` and appropriate verification level

Pre-filtering runs daily as a scheduled job, or on-demand when a new verified member enters the pool.

### 5.3 Compatibility Scoring (Stage 2)

For each pre-filtered pair, Claude API receives both profiles and produces a compatibility report.

**Input to Claude**:

- Member A: structured profile data + AI conversation compatibility profile + partner preferences
- Member B: structured profile data + AI conversation compatibility profile + partner preferences
- System prompt with scoring rubric, weighting guidelines, and output format
- Historical feedback data (anonymized): patterns of what has worked and what hasn't in past matches

**Output from Claude** (structured JSON):

```json
{
  "overall_score": 84,
  "dimension_scores": {
    "career_alignment": { "score": 88, "note": "Both in early career, aligned timelines" },
    "values_alignment": { "score": 91, "note": "Strong overlap in family values and life goals" },
    "lifestyle_compatibility": { "score": 79, "note": "Minor differences in diet preference" },
    "relocation_compatibility": { "score": 85, "note": "Both open to international relocation" },
    "communication_compatibility": { "score": 82, "note": "Similar conflict resolution styles" },
    "family_orientation": { "score": 90, "note": "Both prefer moderate family involvement" },
    "financial_alignment": { "score": 75, "note": "Different planning horizons but compatible" },
    "timeline_alignment": { "score": 88, "note": "Both planning to settle in 2-3 years" },
    "emotional_compatibility": { "score": 80, "note": "Complementary stress management styles" }
  },
  "highlights": [
    "Both value career growth and are open to relocation within 2 years",
    "Strong alignment on family values and partnership philosophy",
    "Compatible communication and conflict resolution approaches"
  ],
  "concerns": [
    "Minor dietary difference (vegetarian vs. eggetarian) — may need discussion",
    "Slightly different financial planning horizons"
  ],
  "narrative": "A one-paragraph description of why these two profiles might be a good match, written in warm, natural language that the team can review and, if approved, share with the applicants.",
  "recommendation": "strongly_recommend"
}
```

### 5.4 Scoring Weights (Configurable)

Not all factors carry equal weight. The algorithm applies configurable weights:

| Factor | Weight | Rationale |
|--------|--------|-----------|
| Values alignment | High | Foundational to relationship success |
| Career & timeline alignment | High | Critical for medical professionals |
| Relocation compatibility | High | Frequent relocation is reality |
| Communication compatibility | High | Predicts long-term success |
| Lifestyle compatibility | Medium | Important but negotiable |
| Family orientation match | Medium | Matters in Indian context |
| Financial alignment | Medium | Prevents future conflicts |
| Emotional compatibility | Medium | From AI conversation signals |
| Demographic match (age, height) | Low | Preference, not predictor |
| Specialty match | Low | Same specialty ≠ better match |

**Critical principle**: A match that meets all criteria except one non-critical factor (e.g., willing to go to Australia instead of UK) should still score high (e.g., 82–85%) with a note explaining the difference. The algorithm should surface near-matches, not just perfect matches.

### 5.5 Self-Improving Feedback Loop

The algorithm improves over time through structured feedback:

1. **Match feedback**: After every match presentation, both applicants provide feedback (rating, what worked, what didn't, specific concerns)
2. **Introduction outcomes**: After video introductions, both parties report outcomes (want to continue, not a match, need more time)
3. **Feedback analysis**: Periodically, Claude analyzes accumulated feedback to identify patterns — which compatibility dimensions best predict positive outcomes, which factors were overweighted or underweighted
4. **Prompt refinement**: Scoring rubric and weights are updated based on feedback analysis
5. **Model version tracking**: Every scoring run is tagged with the prompt/model version so performance can be compared across versions

### 5.6 Cost Management

- Aggressive pre-filtering narrows candidates before expensive AI scoring
- Use cost-effective Claude model (Sonnet) for batch scoring
- Cache compatibility scores — only rescore if profiles are significantly updated
- Maximum pairs per day configurable in `system_config`
- Monitor API spend

---

## 6. Admin Dashboard — Specification

### 6.1 Purpose

The admin dashboard is the operational backbone of Samvaya. It's where the team manages everything: applicants, verification, matches, introductions, and platform operations.

### 6.2 Access Roles

| Role | Users | Access |
|------|-------|--------|
| Super Admin | Ashwini, Santosh, Ejaz | Everything including financial data, system config, user management |
| Admin | Same as above (for now) | Full operational access |
| Team Member | Future hires | Limited access (TBD when needed) |

### 6.3 Dashboard Home

A single-glance overview of platform health:

**Key Metrics (Cards)**:
- Total waitlist applicants
- Total onboarding (in progress + completed)
- Total verified members (verification complete)
- Total active matches (pending review + presented)
- Total introductions (scheduled + completed)
- Conversion funnel: waitlist → onboarding → verified → matched

**Action Items (Priority Queue)**:
- Applicants awaiting verification review
- Match suggestions awaiting team approval
- Introductions pending scheduling
- Feedback to review
- Expiring match presentations (approaching 7-day deadline)

**Recent Activity Feed**:
- New waitlist signups
- Onboarding completions
- Verification status changes
- Match responses
- Introduction outcomes

### 6.4 Applicant Management

**List View**:
- Searchable, filterable, sortable table of all applicants
- Filters: status, membership tier, verification status, career stage, specialty, location, date range
- Quick actions: view profile, change status, add note, send communication

**Individual Applicant View**:
- Full profile (all onboarding form data)
- AI conversation transcript and extracted compatibility profile
- Verification status (each check independently)
- Photos and documents
- Match history
- Communication history
- Internal team notes
- Activity timeline

**Status Management**:
- Change membership status (with audit trail)
- Pause/unpause profile
- Flag for review
- Suspend/delete (with confirmation)

### 6.5 Verification Workflow

**Basic Verification Queue**:
- List of applicants with submitted documents awaiting review
- Side-by-side view: submitted documents + profile data
- Actions: approve, reject (with reason template), request additional documents
- Batch processing support

**Verification Tracker** (powered by OnGrid — for all fee-paying members):
- 13-check tracker per applicant (as specified in Section 4B)
- Status per check: ⬜ Pending / 🔄 In Progress / ✅ Verified / 🚩 Flagged
- BGV may only be initiated after payment confirmed AND consent given (enforced in UI — initiate button locked otherwise)
- Admin toggles each check status independently
- Upload field per check for OnGrid reports/documents
- Notes field per check (internal only)
- Profile-level summary badge (e.g., "BGV: 4/13 verified") visible on applicant list without opening profile
- Final "BGV Complete" status requires all 13 checks to be Verified (none Flagged or Pending)

### 6.6 Match Management

**AI Suggestions Queue**:
- List of AI-generated match suggestions sorted by compatibility score
- Paired card view: both profiles side by side with compatibility report
- Dimension-by-dimension breakdown
- AI narrative and recommendation
- Actions: approve, reject (with reason), flag for discussion, add notes

**Presented Matches Tracker**:
- List of matches sent to applicants
- Status of each party's response (pending, interested, not interested, expired)
- Countdown to expiry
- Mutual interest alerts

**Match History**:
- Full history of all suggestions, presentations, and outcomes
- Filterable by applicant, status, score range, date

### 6.7 Introduction Management

- Calendar view of upcoming introductions
- Scheduling interface (select time slots, generate Google Meet links)
- Status tracking per introduction
- Post-introduction feedback logging
- Outcome recording

### 6.8 Communication Tools

- Send individual or bulk SMS/email to applicants
- Template library with variable substitution (name, status, next step)
- Communication log per applicant
- Scheduled sends

### 6.9 Analytics

- Funnel visualization: waitlist → onboarding → verified → matched → introduced → successful
- Conversion rates at each stage
- Geographic distribution
- Specialty distribution
- Average time through each stage
- Match success rate (correlation between AI score and positive outcomes)
- Algorithm performance over time

### 6.10 System Configuration

- Pricing (view/update membership fees)
- Match presentation expiry time
- Introductions included per membership (standard tier)
- AI prompt management (update Claude system prompts without redeploying)
- Feature flags

---

### 6.11 Profile Card Specifications

Two distinct profile card types exist in Samvaya. They serve different audiences and contain different information. Both are specced here as they directly inform the admin dashboard build (the admin card) and the PWA build (the member card).

---

#### 6.11A — Admin Profile Card (Internal Team Use)

**Purpose:** Give the Samvaya team a complete, visually structured view of an applicant's full profile. Replaces the need to read raw database rows or export CSVs. Used when reviewing applications, preparing matches, briefing founders for premium concierge calls, and tracking verification status.

**Format:** Multi-page. No single-page constraint. Optimised for screen reading and for printing. On screen: scrollable, sticky header. For print: clean A4 layout with page breaks between major sections.

**Access:** Admin dashboard only. Never visible to applicants.

---

**BLOCK 1 — Header (sticky on scroll, printed at top)**

| Element | Content |
|---|---|
| Primary photo | Full-resolution, not blurred |
| Full name | First + last |
| Age | Calculated from DOB |
| Location | Current city, state, country |
| Medical status | e.g. "PG Resident — Cardiology, AIIMS Delhi" |
| BGV badge | "BGV: X/13 verified" — colour coded: green (all clear), amber (in progress), red (flagged) |
| Membership status | Unverified / In pool / Active member / Expired |
| GooCampus flag | Shown if `is_goocampus_member = true` |
| Application date | Date form was submitted |

---

**BLOCK 2 — Identity Snapshot**
Displayed as a compact horizontal row of labelled tags — designed to be read in under 10 seconds.

Religion · Observance level · Mother tongue · Languages spoken · Marital status · Blood group · Referral source

---

**BLOCK 3 — Family Background**
Father name + occupation, Mother name + occupation, Siblings count.

Below the structured fields, displayed as a pull-quote in larger text:

> **Key quote** — the single most revealing sentence the applicant said during the family background conversation (extracted from `key_quote` field in `compatibility_profiles`).

---

**BLOCK 4 — Education & Career**
Medical status and specialty, additional qualifications (as tags), work experience (rendered as a visual mini-timeline with org name, designation, and dates — not a table).

Monthly remuneration range shown if provided (from post-onboarding prompt).

LinkedIn URL as a clickable link. Instagram handle if provided.

---

**BLOCK 5 — Lifestyle Snapshot**
Rendered as an icon row with labels below each — fast to scan.

Diet · Attire · Fitness · Smoking · Drinking · Tattoos/Piercings · Disabilities (if disclosed) · Allergies (if disclosed)

---

**BLOCK 6 — Interests**
Hobbies selected (grouped by category, as tags). Below that, in slightly larger text: their answer to Q53 — *"what I actually spend time on"* — shown verbatim.

---

**BLOCK 7 — Goals & Values**
Displayed as a two-column grid of labelled value pairs — easy to cross-reference against a potential match.

Marriage timeline · Long-distance comfort · Post-marriage family arrangement · Both-partners-working expectation · Wants children (+ how many + when) · Open to partner with children · Settlement countries · Open to immediate relocation · Abroad plans (+ countries)

---

**BLOCK 8 — Compatibility Profile (Spider Web + Dimension Scores)**
The full 8-axis spider web graph displayed at a generous size. Each axis labelled with the dimension name and score.

Below the graph: all 8 dimensions listed with their score (0–100) and the AI qualitative note for each. Also shown: communication style, conflict approach, partner role vision, financial values, personal meaning framework.

---

**BLOCK 9 — AI Personality Summary**
Full 2–3 paragraph narrative from the extraction model. Set in comfortable body text size, not compressed. This is what the team reads to understand the person as a human.

Below it: `ai_compatibility_keywords` shown as tags.

---

**BLOCK 10 — Partner Preferences**
Age range · Height range · Specialty preference · Career stage preference · Location preference (states + countries) · Mother tongue preference · Body type · Attire · Diet · Fitness · Smoking · Drinking · Tattoos · Family type · Religious observance · Partner career expectation · Partner qualities (up to 7, shown as tags)

---

**BLOCK 11 — BGV Verification Status**

| Check | Status | Notes |
|---|---|---|
| Aadhaar | ✅ / 🔄 / ⬜ / 🚩 | |
| PAN | ✅ / 🔄 / ⬜ / 🚩 | |
| Bank Account | ... | |
| Credit Check | ... | |
| Employment | ... | |
| Education | ... | |
| Professional Reference | ... | |
| Court Records | ... | |
| Criminal Records | ... | |
| Global Database | ... | |
| Address (Digital) | ... | |
| Address (Physical) | ... | |
| Social Media | ... | |

Any 🚩 flagged check highlighted in amber with space for a note.

---

**BLOCK 12 — Team Notes**
AI red flags (if any) shown first, clearly labelled "AI flagged".
Below: free-text editable area for the team to add their own observations. These are saved to `admin_notes` in the database.

---

**BLOCK 13 — Closing Note**
The verbatim response to Q100 — the closing single-exchange prompt. Shown in its own box, clearly labelled "In their own words".

---

#### 6.11B — Member-Facing Match Card (Applicant View)

**Purpose:** Show a matched applicant enough about a potential match to make a genuine yes/no decision — without revealing identifying information. Designed for trust, not completeness. The goal is a considered decision, not a browse.

**Format:** Two versions:
- **In-app (PWA):** Single scrollable screen, mobile-first. Optimised for a phone in one hand.
- **PDF:** Cleanly formatted document the team can also generate manually and share via email for the period before the full PWA is live. Same content, print-friendly layout.

**Access:** Visible to the matched applicant only, for the duration of the 7-day match presentation window. After mutual interest and payment confirmed, the full profile is unlocked.

**Hidden from this card at all times:** Full name, email, phone number, exact city, parents' names, parents' occupations, weight, caste details, BGV status, financial information, team notes, AI red flags, the closing freeform note, work history (organisation names and institutions — place of work is never shown).

**Shown despite being career-related:** Current designation, total years and months of post-MBBS experience, career stage, and specialty. These are compatibility signals, not identifying information. For this audience, knowing someone is a Senior Resident with 4 years of experience is as relevant as knowing their age.

---

**SECTION 1 — Top of card**

| Element | Content | Notes |
|---|---|---|
| Photo | Blurred thumbnail | Server-generated at upload using Sharp. Stored as `blurred_path` in photos table. Unblurred only after mutual interest confirmed AND payment captured. |
| Age | e.g. "28" | Not date of birth |
| Location | State + country only | e.g. "Maharashtra, India" or "London, UK" |
| Medical status | Career stage + specialty | e.g. "PG Resident — Cardiology" |
| Current designation | Job title only | e.g. "Senior Resident" or "Consultant". Place of work is hidden. |
| Experience | Total post-MBBS experience in years and months | e.g. "4 years, 2 months". Calculated from work timeline entries in the form. |
| Height | In cm | |
| Religion + observance | e.g. "Hindu · Culturally observant" | |

---

**SECTION 2 — Match Rationale (most prominent section)**

This is Samvaya's core value on this card. It should be displayed prominently — above the fold where possible — not buried at the bottom.

Headline: *"Here's why we think this could work"*

Content: 3–4 specific, plain-language reasons drawn from the algorithm output and team review notes. Written in warm, direct prose — not bullet points of data. Each reason cites something real.

Examples of the kind of language used:
- *"You're at similar stages in your careers — both building toward a specialty rather than already established. That shared rhythm tends to matter more than people expect."*
- *"Your settlement preferences overlap meaningfully — you're both open to the UK and have Australia as a secondary option."*
- *"You've both described wanting a partner who is a co-builder rather than a complement — someone charging at the same things, not filling gaps."*

One honest note of difference: e.g. *"She's from a close-knit joint family background; you've described preferring a nuclear setup. It's worth a conversation — but it's the kind of thing people navigate."* This builds trust in Samvaya's process.

**Implementation note:** The match rationale is generated by the team in the admin dashboard when approving a match, using the `match_narrative` field in `match_suggestions` and their own review notes. The AI produces a draft; the team edits before it's presented to the applicant. This is not fully automated.

---

**SECTION 3 — Compatibility Graph**

Both spider webs overlaid on a single graph — the applicant's web and the match's web. Axes labelled. Where the two webs overlap, the overlap area is shaded in the Samvaya brand colour.

Below the graph: a single line of text summarising alignment, e.g. *"Strong alignment on family orientation, life pace, and relocation openness."*

**Note:** The applicant's own web scores must already exist (from their own completed onboarding) for this to render correctly. If scores are missing, display the match's web only with a note that the overlay will appear once their own profile processing is complete.

---

**SECTION 4 — About them**

An AI-generated paragraph written in warm, first-person-adjacent prose — not a list of facts. This is produced during the extraction call from the applicant's conversations. It should read as if someone who knows this person well wrote a brief introduction.

Example register: *"She's a PG resident in Cardiology at a government hospital in Delhi — driven, but clear-eyed about what the career costs. Outside medicine, she's genuinely invested in reading and travel, not as status hobbies but as things she actually makes time for. She's described wanting a partner who is building something of their own, not someone to come home to at the end of the day but someone to share the whole thing with."*

---

**SECTION 5 — Life snapshot**
A concise set of labelled fields — shown as a clean two-column grid.

Marriage timeline · Wants children (yes/no/open + timing) · Settlement preference (countries) · Family arrangement preference · Both-partners-working expectation · Diet · Smoking · Drinking

---

**SECTION 6 — Interests**
What they actually spend time on (Q53 answer), displayed as 2–3 short phrases. Not the full checkbox list.

---

**SECTION 7 — Response prompt**
At the bottom of the card, before the CTA:

> *"Take your time. There's no right answer — just an honest one. If you're interested, we'll share your response with them (without your name or details). If you're both interested, we'll introduce you properly."*

Two buttons: **I'm interested** · **Not for me**

Below the buttons, in smaller text: *"This match expires in X days."*

---

#### 6.11C — Photo Upload & Blurring — Implementation Note for Claude Code

**Guided Photo Upload (Q95):** Applicants upload photos into named slots that guide diverse angles:

| Slot | Photo Type | Required | is_primary |
|------|-----------|----------|------------|
| 1 | `face_closeup` | Yes | Yes |
| 2 | `full_length` | Yes | No |
| 3 | `professional` | Yes | No |
| 4 | `casual` | No | No |
| 5–10 | `additional` | No | No |

Minimum 3, maximum 10 photos. Q96 is grouped into Q95 via `groupWith` and never renders as a separate form step (Q-numbers are locked at 100).

**Client-side compression:** Uses `browser-image-compression` (~30 KB). Files larger than 3 MB are compressed in the browser to ~3 MB / max 2048px before upload. A toast notification shows "Optimized from X MB to Y MB". The original uncompressed file never reaches the server — only the compressed version is uploaded. Upload accept limit is 25 MB (safety margin). If the applicant is unhappy with the compression, they can compress externally and re-upload.

**Server-side processing:**

```
On photo upload (after client-side compression):
1. Compressed file uploaded to: storage/photos/{user_id}/original/{filename}
2. Sharp safety resize to max 2048px (withoutEnlargement: true) — overwrites if smaller
3. Sharp generates blurred copy (Gaussian blur, sigma 20)
4. Blurred copy stored at: storage/photos/{user_id}/blurred/{filename}
5. Both paths + photo_type written to photos table

Storage per photo: compressed original (~1–3 MB) + blurred copy (~0.5–1 MB)
No full-size original is stored — only the compressed version.

On member card render:
- If match_presentations.is_mutual_interest = false OR payment not captured:
    → serve blurred_path
- If is_mutual_interest = true AND payment status = captured:
    → serve storage_path (compressed original)

Both paths are in private Supabase Storage buckets.
Signed URLs are generated server-side per request — never exposed directly.
The blur is not CSS. It cannot be removed by inspecting the DOM.
```

**Post-onboarding photo management:** Applicants can manage photos at `/app/profile/photos` — add, delete, replace, reorder. Minimum 3 enforced. Same compression + blur pipeline. PATCH API at `/api/app/photos` for reorder/set-primary.

**Admin view:** All photos displayed in a gallery grid with photo_type labels. Admin always sees unblurred originals.

---

## 6B. Pricing Model & Payment Communication

### 6B.1 Pricing — Locked

| Payment | Amount | When triggered | Who pays |
|---|---|---|---|
| Verification fee | ₹6,000 + 18% GST = **₹7,080 total** | After completing the detailed onboarding form | All applicants except GooCampus members |
| Membership fee | ₹35,000 + 18% GST = **₹41,300 total** | When Samvaya presents a compatible match AND both applicants express mutual interest in proceeding | All applicants including GooCampus members |
| Premium concierge | ₹1,50,000–₹2,00,000 (price on enquiry) | On enquiry only — not publicly displayed | Self-selected applicants seeking founder-led service |

**GooCampus members:** Verification fee waived. Documents already on file from GooCampus onboarding. Membership fee applies in full when triggered.

---

### 6B.2 Payment Communication — Touchpoints

Every time a payment is relevant, Samvaya must communicate it clearly — what it is, why it's being charged, and what happens next. Below are the exact moments, the channel, and the required message content for each.

---

#### TOUCHPOINT 1 — After form submission, before BGV (Verification Fee)
**Trigger:** Applicant submits the complete onboarding form and their application passes internal review.
**Channel:** In-app screen (full page) + email confirmation
**Purpose:** Collect the verification fee and explain clearly what it covers and why it exists.

**In-app screen copy:**
> **One last step before we get started.**
>
> Before we add you to our candidate pool, we carry out a comprehensive background verification — the same check that every single Samvaya member goes through. This covers your identity, education, employment history, address, financial standing, and court and criminal records.
>
> We do this because every person you could potentially be matched with has been through this same process. It's how we make sure Samvaya is a pool of verified, genuine applicants — and nothing less.
>
> **Verification fee: ₹6,000 + GST (₹7,080 total)**
> This is a one-time, non-refundable fee. Work begins as soon as your payment is confirmed.
>
> **What happens next:** Once verification is complete (typically 7–10 working days), your profile enters our candidate pool and our matching process begins. You don't need to do anything — we'll be in touch when we have a compatible match for you.
>
> *If you have already completed verification through GooCampus, this step is not required for you.*
>
> [Pay ₹7,080 and complete verification →]

**Email subject:** Your Samvaya application — one step remaining
**Email body:** Same content as above, with payment link button.

---

#### TOUCHPOINT 2 — After verification completes, entering the candidate pool
**Trigger:** OnGrid returns results and the team marks verification as complete in the admin dashboard.
**Channel:** Email + in-app dashboard notification
**Purpose:** Confirm the applicant is now in the pool, set expectations on what happens next, and proactively mention the membership fee so it is never a surprise.

**Email subject:** You're in — your Samvaya verification is complete
**Email body:**
> Hi [First Name],
>
> Your background verification is complete. You're now part of the Samvaya candidate pool.
>
> From here, our team will work through your profile and begin looking for compatible matches. This takes time — we don't rush it, and we don't send you profiles just to send them. When we find someone genuinely suitable, we'll reach out.
>
> **One thing to know before that happens:**
> When we do find a match, we'll share a compatibility summary with both you and your potential match — independently. If you both want to proceed, we'll ask you to complete your Samvaya membership at that point.
>
> **Membership fee: ₹35,000 + GST (₹41,300 total)**
> This gives you six months of active membership, starting from the day you both agree to move forward. During that time, we'll continue working with you — introductions, feedback, and further matches if needed.
>
> You won't be asked to pay anything until we've found someone worth your time.
>
> We'll be in touch.
> — The Samvaya Team

**In-app dashboard banner (persistent until first match is presented):**
> ✅ Verification complete. You're in our candidate pool.
> We're looking for your match. When we find someone compatible, we'll share their profile with you — and only ask for payment if you'd like to proceed.

---

#### TOUCHPOINT 3 — When a match is ready to be presented
**Trigger:** Admin approves a match in the dashboard and initiates a match presentation to both applicants.
**Channel:** Email (primary) + in-app notification + SMS (optional, via MSG91)
**Purpose:** Present the match clearly, explain what the applicant needs to do, and confirm that payment comes only after they say yes.

**Email subject:** We found someone for you.
**Email body:**
> Hi [First Name],
>
> We've found a match we'd like to share with you.
>
> We've reviewed both your profiles carefully — your backgrounds, your goals, your values, and what you're each looking for. We think there's something genuinely worth exploring here.
>
> [View compatibility summary →]
>
> Take your time reading through it. If you're interested in taking this further, let us know. We'll share your response with them (without identifying you), and if they feel the same way, we'll introduce you properly.
>
> **You don't need to pay anything right now.** If both of you want to proceed, we'll ask you to complete your membership at that point. Not before.
>
> This match will be available for your review for **7 days**. After that it will expire.
>
> — The Samvaya Team

**In-app notification:**
> We've found a compatible match for you. Review their compatibility summary and let us know if you'd like to proceed.

---

#### TOUCHPOINT 4 — When mutual interest is confirmed (Membership Fee)
**Trigger:** Both applicants have independently indicated they wish to proceed with the match.
**Channel:** Email + in-app screen
**Purpose:** Collect the membership fee. At this point the applicant has already seen the match summary and said yes — the payment request is completely expected.

**In-app screen copy:**
> **You're both interested. Here's what happens next.**
>
> Both you and your match have indicated you'd like to take this further. We'll now introduce you properly.
>
> To proceed, please complete your Samvaya membership.
>
> **Membership fee: ₹35,000 + GST (₹41,300 total)**
>
> Your six-month membership starts today — the day you've both agreed to move forward, not the day you first heard about them. During these six months:
> - We'll facilitate your first introduction
> - We'll stay in touch and support you through the process
> - If this match doesn't work out, we'll continue looking and present further compatible profiles
> - We guarantee a minimum of 3 match presentations within your membership period. If we're unable to deliver that, we'll extend your membership at no charge.
>
> [Complete membership — ₹41,300 →]

**Email subject:** You're both interested — complete your membership to proceed
**Email body:** Same content as above, with payment link.

---

#### TOUCHPOINT 5 — Payment confirmation
**Trigger:** Payment confirmed — either via Razorpay capture (v2) or team manually marking payment as received (v1).
**Channel:** Email + in-app screen
**Purpose:** Confirm payment, set expectations for the introduction.

**Email subject:** Payment confirmed — your introduction is being arranged
**Email body:**
> Hi [First Name],
>
> Your membership payment has been received. Thank you.
>
> We're now arranging your introduction. One of our team will be in touch shortly with next steps — this will typically be a facilitated video call between you and your match.
>
> Your membership is active until [expiry date]. We'll be with you throughout.
>
> — The Samvaya Team

#### Event-Driven Notification Emails

Beyond the 5 core touchpoints above, the system also sends event-driven notification emails that respect user preferences in the `notification_preferences` table:

- **New match presented** (`email_new_match`): Sent when a match presentation is created for this user.
- **Match response received** (`email_match_response`): Sent when the other party responds (interested or not interested).
- **Status update** (`email_status_update`): Sent on payment_status transitions (verification_pending → in_pool → active_member, etc.).

These are implemented in `src/lib/email/notifications.ts` and check the user's preferences before sending.

---

### 6B.3 Implementation Notes for Claude Code

The following payment state machine must be implemented and reflected in the user's dashboard at all times:

```
STATES (stored in users.payment_status):

unverified          → Form complete, not yet paid verification fee
verification_pending → Verification fee paid, BGV in progress
in_pool             → BGV complete, in candidate pool, awaiting match
match_presented     → Match shared, awaiting response from this user
awaiting_payment    → Mutual interest confirmed, membership fee not yet paid
active_member       → Membership fee paid, membership active
membership_expired  → 6-month window closed, no active membership
```

Every communication touchpoint above maps to a state transition. The dashboard UI must reflect the current state clearly at all times, with the next action always visible.

**Critical payment rules (must be enforced in code):**
1. BGV must not be initiated until `payments.verification_fee_paid = true` (v1: set manually by team) AND `users.bgv_consent = 'consented'`
2. Membership fee must not be requested until `is_mutual_interest = true` on the `match_presentations` record
3. `membership_start_date` on the payment record must be set to the date of mutual interest confirmation — not the payment date
4. `membership_expiry_date` = `membership_start_date` + 6 months
5. GooCampus members (`is_goocampus_member = true`) skip the verification fee entirely — their `payment_status` moves directly from `unverified` to `in_pool` once the team manually confirms documents are in order

---

### 6B.4 Refund Policy

Samvaya operates a no-refund policy, consistent with the standard across Indian matrimony platforms. The policy applies to both payment stages.

**Verification fee (₹6,000 + GST) — non-refundable**
Background verification is conducted by a third-party provider (OnGrid) and costs are incurred immediately upon initiation. No refunds will be issued once verification has begun, regardless of outcome or circumstances.

**Membership fee (₹35,000 + GST) — non-refundable**
Payment is only requested after both applicants have independently reviewed a compatibility summary and expressed mutual interest in proceeding with a specific match. By completing payment, the applicant acknowledges they have received and accepted the basis for the match introduction. No refunds will be issued for:
- Change of mind after payment
- Unsatisfactory match outcomes
- A match being found through another platform or service
- Unused or partially used membership periods

**GooCampus members**
No verification fee is charged. The membership fee applies equally if and when triggered. All other terms above apply.

**The only exception — technical error**
Refunds are processed only in the case of a verified technical failure resulting in a duplicate or incorrect charge. Refund requests of this nature must be raised within 7 days of the transaction date, with the transaction ID included. Approved refunds are processed within 7–14 business days via the original payment method.

*Note: This policy should be reviewed and formalized by Samvaya's legal counsel before launch. The above is the agreed operational position for PRD purposes.*

---

## 7. User-Facing PWA — Specification

> **⚠️ Scope Note (March 2026) — Razorpay Removed from Phase 2C**
>
> Razorpay payment gateway integration is explicitly **OUT OF SCOPE** for Phase 2C. The founder confirmed that for v1, all payments (verification fee ₹7,080 and membership fee ₹41,300) will be collected manually — via phone, UPI, or bank transfer. The team will toggle payment status in the admin dashboard after confirming receipt. All payment CTAs in the PWA show "Contact us to complete payment" with WhatsApp/phone links instead of a payment button.
>
> **Why this decision was made:**
> 1. **Razorpay Business KYC** can take days to weeks for approval — this would block the entire Phase 2C launch timeline.
> 2. **Webhook signature verification and idempotency** adds significant complexity (retries, duplicate prevention, failure reconciliation).
> 3. **GST invoice generation** is required for ₹7,080 and ₹41,300 transactions — building this correctly is a project in itself.
> 4. **Refund handling** edge cases (partial refunds, failed captures, bank processing delays) add untested failure modes.
> 5. **At Samvaya's current scale** (invite-only, curated, <100 users), manual payment collection provides more control and a human touchpoint that is consistent with the premium, concierge-style service positioning.
> 6. **The founder explicitly confirmed** they are comfortable collecting payments outside the platform and manually updating payment status in the admin dashboard.
>
> Razorpay integration is deferred to a future phase when user volume justifies the automation investment. When that time comes, the payment state machine (`users.payment_status`) and manual flag infrastructure are already built and will serve as the foundation — Razorpay will simply automate the toggle that the team currently does manually.

> ✅ **Phase 2C — COMPLETE** (March 2026). The full PWA is built: member dashboard, match card view with spider chart, response interface, profile reveal after mutual interest, feedback forms. Phase 2D added: pause/resume, notification preferences, push notifications, service worker, edit profile, photo management, introduction scheduling.

### 7.1 Purpose

A mobile-first progressive web app that serves as the applicant's interface with Samvaya. It is NOT a native iOS/Android app. It runs in the browser and can be installed on the home screen.

### 7.2 Key Capabilities

| Feature | Priority | Description |
|---------|----------|-------------|
| Fill onboarding form | Must-have (v1) | Multi-step form with save-and-resume, conditional logic |
| AI conversation | Must-have (v1) | Chat interface for Claude-powered onboarding conversation |
| Track progress | Must-have (v1) | View current status, verification progress, what's next |
| View curated matches | Must-have (v1) | See anonymized match summaries presented by the team |
| Accept/reject matches | Must-have (v1) | Express interest or decline |
| Give feedback on matches | Must-have (v1) | Structured feedback form after each match |
| View full profile after mutual interest | Must-have (v1) | Unblurred photos, full details |
| Schedule introductions | Must-have (v1) — **built** | 14-day calendar with time slots (morning/afternoon/evening) at `/app/settings`. Stored in `introduction_availability` table. |
| Edit profile | Must-have (v1) — **built** | Update location, lifestyle, goals at `/app/profile/edit`. Manage photos (add, delete, replace, reorder) at `/app/profile/photos`. |
| Notification preferences | Must-have (v1) — **built** | Email + push toggles (new match, match response, status update, promotions) at `/app/settings`. Stored in `notification_preferences` table. |
| Pause/resume profile | Must-have (v1) — **built** | Toggle at `/app/settings`. Sets `users.is_paused`. Paused users excluded from matching via `get_prefiltered_candidates()`. |
| Push notifications | Must-have (v1) — **built** | Service worker handles push events. Subscriptions stored in `push_subscriptions` table. API at `/api/app/push-subscription`. |
| Photo management | Must-have (v1) — **built** | Add, delete, replace, reorder photos at `/app/profile/photos`. Same compression + blur pipeline as onboarding. Min 3, max 10. |
| Payment (upgrade) | **Deferred — manual collection for v1** | Razorpay removed from Phase 2C scope. All payments collected manually (phone/UPI/bank transfer). Team toggles status in admin dashboard. See scope note above. |

### 7.3 Design Principles

- **Mobile-first**: Designed for phones. Large touch targets, vertical scrolling, bottom navigation
- **Minimal and warm**: Clean UI consistent with Samvaya brand. Not cluttered.
- **Progress-oriented**: Always show the user where they are and what's next
- **Instant feedback**: Every action confirms immediately (form saved, response recorded, etc.)
- **Offline-capable** (built): Service worker caches core assets, handles push notification events, and provides offline fallback page

### 7.4 User Screens

1. **Login / OTP**: Email address + OTP authentication (invited applicants only)
2. **Home / Status**: Current status card, progress bar, next action prompt
3. **Onboarding Form**: Multi-step wizard (same form as described in Section 4)
4. **AI Conversation**: Chat interface
5. **My Profile** (`/app/profile`): View profile, edit location/lifestyle/goals (`/app/profile/edit`), manage photos (`/app/profile/photos`)
6. **My Matches** (`/app/matches`): List of presented matches with anonymized summaries
7. **Match Detail** (`/app/matches/[id]`): Full compatibility summary, blurred photo, spider chart, interest buttons
8. **Full Profile Reveal**: After mutual interest — unblurred photos, name, email, phone, full details
9. **Feedback Form** (`/app/matches/[id]/feedback`): Post-match feedback (rating, what worked, what didn't)
10. **Settings** (`/app/settings`): Notification preferences (email + push toggles), pause/resume profile, schedule introduction availability (14-day calendar)

### 7.5 Connection to Admin Dashboard

Everything the user does in the PWA is reflected in real-time on the admin dashboard:

- User fills form → admin sees completion progress
- User responds to match → admin sees response immediately
- User gives feedback → admin can read it
- Admin approves match → user sees it in their matches list
- Admin changes status → user sees updated status

This is achieved through Supabase as the shared data layer with real-time subscriptions.

---

## 8. Security & Privacy

### 8.1 Authentication

- **Primary**: Email address + OTP (via Supabase Auth). Applicants are invited by email and authenticate via a one-time code sent to that address. No passwords.
- JWT-based sessions, 30-day persistence
- Rate limiting on OTP requests
- Account lockout after 5 failed attempts

### 8.2 Data Protection

- Row-Level Security (RLS) on every Supabase table
- Applicants can only access their own data
- Admins have role-based access
- All API routes validate JWT and check roles
- Environment variables for all API keys (Vercel)
- TLS encryption in transit
- Database encryption at rest (Supabase default)

### 8.3 Photo Privacy

- Client-side compression before upload — original uncompressed files never reach the server
- Server-side blurring (Sharp, sigma 20) for anonymized match presentations
- Full (compressed) photos only served after mutual interest is confirmed
- All photos in private Supabase Storage bucket with signed URLs (short expiry)
- Storage per user: ~2–4 MB per photo (compressed + blurred). No full-size originals retained.

### 8.4 Document Security

- Verification documents in private Supabase Storage bucket
- Signed URLs with short expiry for admin access
- Never exposed to other applicants

### 8.5 Privacy Principles (from Samvaya Values)

- Data collected only for matchmaking and verification purposes
- No advertising, no third-party data sharing
- Applicants can pause, delete, and export their data at any time
- Background verification consent is required to proceed. If consent is not given (`bgv_consent = 'not_given'`), the applicant's profile is deleted within 30 working days. BGV completion is required to enter the matching pool (`is_bgv_complete = true` needed for `in_pool` status).
- Transparency about what data is collected and why

---

## 9. Deployment & Infrastructure

### 9.1 Hosting

- **Vercel** for Next.js deployment (both admin and PWA routes)
- Git-based deployment pipeline
- Preview deployments for testing before production
- **Domain structure: subdomain-based** — `app.samvayamatrimony.com/app` for members, `app.samvayamatrimony.com/admin` for the team. Root domain (`samvayamatrimony.com`) and `www` remain on Framer (marketing site). `apply.samvayamatrimony.com` remains on Netlify (Phase 1 waitlist).

### 9.2 Environments

- **Development**: Local development with Supabase local or development project
- **Staging**: Vercel preview deployments with staging Supabase project
- **Production**: Vercel production with production Supabase project

### 9.3 Monitoring

- Vercel Analytics for performance
- Sentry for error tracking
- Supabase dashboard for database monitoring
- Anthropic dashboard for AI API spend

---

## 10. Build Plan — Phased Execution

The full detailed day-by-day build plan is maintained in `CLAUDE.md` (the Claude Code context file at the project root). The summary below reflects the locked build order. Always refer to `CLAUDE.md` for the current task, day number, and daily scope.

---

### Phase 2A — Form + Dashboard + Sync ✅ COMPLETE

**Part 1: Form Only** — 100-question form across 13 sections (A–M), 3 embedded Claude AI chats (Q38, Q75, Q100), auto-save, save-and-resume, conditional logic, photo upload with guided slots + Sharp blur, document upload, BGV consent, form submission with completion email.

**Part 2: Admin Dashboard** — Applicant list with filters, individual profile view (all form data + chat transcripts), BGV tracker (13 checks), manual payment flag toggle, team notes, status management, communication tools (individual + bulk email), email templates, dashboard home with metrics.

**Part 3: Airtable Sync + Dashboard Completion** — Supabase → Airtable read-only sync, analytics dashboard (funnel, specialty/geo distribution, stage timing), system configuration UI, activity log.

---

### Phase 2B — Matching Algorithm ✅ COMPLETE

- Pre-filtering SQL via `get_prefiltered_candidates()` RPC (hard constraints: gender, age, location, lifestyle)
- Claude API compatibility scoring (structured JSON output, 9 dimensions)
- Match suggestion queue in admin dashboard
- Match presentation to applicants (anonymized, blurred photos)
- Member-facing match card with 8-axis spider chart (custom SVG)
- Atomic match response handling via `handle_match_response()` RPC
- Feedback collection with structured form

---

### Phase 2C — User-Facing PWA ✅ COMPLETE

- Mobile-first PWA shell (installable via web manifest)
- Member dashboard — payment/verification status, pending matches count, next actions
- Match card view with spider chart, rationale, life snapshot, interest section
- Response interface (interested / not interested, with feedback form)
- Full profile reveal after mutual interest + payment (unblurred photos, name, contact info)
- Manual payment collection (Razorpay deferred to future phase)

---

### Phase 2D — PWA Polish + Features ✅ COMPLETE

- Edit profile (location, lifestyle, goals) at `/app/profile/edit`
- Photo management (add, delete, replace, reorder) at `/app/profile/photos`
- Pause/resume profile toggle (`users.is_paused`, excluded from matching)
- Notification preferences (email + push toggles) stored in `notification_preferences`
- Service worker (offline caching, push notification handling) at `public/sw.js`
- Push subscription API at `/api/app/push-subscription`
- Schedule introduction availability (14-day calendar with time slots) at `/app/settings`

---

### Phase 2E — Code Hardening & Production Readiness 🔧 IN PROGRESS

A dedicated hardening phase that takes the fully-built codebase (Phases 2A–2D) and systematically hardens it for production. Each day targets a specific category. The workflow for each day is:

1. **Build** — implement the day's hardening scope
2. **Audit** — deploy multiple agents (security, code review, UX) to review changes
3. **Fix** — address all audit findings
4. **Verify** — `tsc --noEmit` + `npm run build` must pass
5. **Commit** — push to remote

All audit results are logged in `AUDIT.md` under `Phase 2E, Day N`.

#### Day-by-Day Schedule

| Day | Date | Focus | Status |
|-----|------|-------|--------|
| 1-2 | Mar 16 | Security hardening (CSP, server-only guards, rate limiting on 5 routes, input validation, MIME checks) + Design system foundation (tokens, animations, typography) | ✅ COMPLETE |
| 3 | Mar 17 | Login page redesign with micro-interactions + security (open redirect fix, OTP hardening, race condition guards, WCAG contrast) | ✅ COMPLETE |
| 4 | Mar 17 | Form input focus animations (15 components), progress bar polish, accessibility (reduced motion, focus contrast ≥2.5:1) | ✅ COMPLETE |
| 5 | Mar 17 | Section intro cards with descriptions + time estimates, MC card animations, chat bubble redesign, save status indicator | ✅ COMPLETE |
| 6 | Mar 18 | E2E testing expansion: critical flows (payment toggle, GooCampus, save-and-resume, double-submit), accessibility audits (axe-core), API security tests | ✅ COMPLETE |
| 7 | Mar 18 | API security sweep: rate limiting on all 40 routes, shared validation utility, input validation gaps (UUID, length caps, enum checks), server page error handling (6 pages) | ✅ COMPLETE |
| 8 | TBD | Admin dashboard UX (see details below) | PLANNED |
| 9 | TBD | PWA UX polish (see details below) | PLANNED |
| 10 | TBD | E2E test expansion (see details below) | PLANNED |
| 11 | TBD | Performance audit (see details below) | PLANNED |
| 12 | TBD | Production deployment (see details below) | PLANNED |

#### Day 8 — Admin Dashboard UX

Focus: Make the admin dashboard resilient and polished for daily team use.

**Scope:**
- **Loading skeletons** — Add shimmer/skeleton states to all admin pages that fetch data (applicant list, applicant detail, dashboard metrics, verification tracker). Use the existing skeleton CSS classes from `globals.css`.
- **Empty states** — When tables have zero rows (no applicants, no matches, no activity), show a helpful empty state instead of a blank table. Include context-appropriate message (e.g., "No applicants yet. Invite users from the waitlist to get started.").
- **Component error boundaries** — Fix `TeamNotes` silent error swallowing (P0 from Day 7 UX audit): show inline error when POST to notes endpoint fails. Fix `SuggestionQueue` approve/reject unhandled promise rejection: wrap in try/catch with user feedback.
- **SettingsPage silent revert** — When pause toggle or notification preference PATCH fails, show an error message instead of silently reverting the toggle (P2 from Day 7 UX audit).
- **Table pagination polish** — Ensure applicant list, activity log, and communication history have consistent pagination controls with proper disabled states.

**Key files:** `src/components/admin/` (all admin components), `src/components/app/SettingsPage.tsx`, `src/app/admin/` (page files)

#### Day 9 — PWA UX Polish

Focus: Polish the user-facing PWA for mobile reliability and installability.

**Scope:**
- **Offline fallback UI** — When the service worker detects no network, show a branded offline page instead of the browser's default. Register a fallback route in `public/sw.js`.
- **Push notification testing** — Verify end-to-end push flow: subscription → server stores endpoint → server sends notification → service worker displays. Test with real browser.
- **Install prompt** — Add a dismissible "Add to Home Screen" banner on the user dashboard (`/app`) that triggers the browser's install prompt. Store dismissal in localStorage.
- **Photo upload error cases** — Improve error UX when photo upload fails: MIME rejection ("This file type isn't supported. Please upload a JPEG, PNG, or WebP image."), oversized file, storage quota exceeded, network timeout.
- **Service worker validation** — Verify caching strategies (cache-first for static assets, network-first for API), ensure sw.js updates propagate, test skipWaiting + clients.claim flow.

**Key files:** `public/sw.js`, `src/lib/app/use-service-worker.ts`, `src/components/form/inputs/GuidedPhotoUpload.tsx`, `src/app/app/page.tsx`

#### Day 10 — E2E Test Expansion

Focus: Close test coverage gaps for critical admin and user workflows.

**Scope:**
- **Admin matching flow** — E2E test covering: pre-filter → score → create suggestion → review suggestion → create presentation → user responds → mutual interest → introduction scheduling. This is the core business flow.
- **Bulk messaging** — Test template creation, variable substitution, recipient filtering, send confirmation.
- **Photo upload failures** — Test MIME rejection (upload a .txt file), oversized file handling, Sharp blur verification (upload succeeds and blurred copy exists).
- **BGV consent flow** — Test all 3 consent states: `consented`, `consented_wants_call`, `declined`. Verify BGV cannot start without both fee paid AND consent.
- **Profile edit persistence** — Test edit → save → reload → verify changes persisted. Test concurrent edit detection if applicable.

**Key files:** `e2e/` directory, `playwright.config.ts`

#### Day 11 — Performance Audit

Focus: Measure and optimize for production-grade performance.

**Scope:**
- **Bundle analysis** — Run `@next/bundle-analyzer` to identify oversized chunks. Target: no single page JS bundle > 200KB gzipped. Check if `@anthropic-ai/sdk` is being tree-shaken (should only be in API routes, never in client bundles).
- **Image optimization** — Verify all user-uploaded photos serve optimized formats via Supabase Storage. Check if Next.js `<Image>` component is used where appropriate.
- **Lazy loading** — Ensure below-the-fold admin dashboard components (charts, activity log) use dynamic imports. Verify form sections load on-demand, not all at once.
- **API response times** — Benchmark key endpoints: form auto-save (<200ms), chat message (<3s), photo upload (<5s), admin applicant list (<1s). Log any that exceed targets.
- **Lighthouse scores** — Run Lighthouse on `/auth/login`, `/app`, `/admin` pages. Target: Performance ≥80, Accessibility ≥90, Best Practices ≥90.

**Key files:** `next.config.ts`, `package.json` (add bundle-analyzer), all page files

#### Day 12 — Production Deployment

Focus: Deploy to production on Vercel and validate with real data.

**Scope:**
- **Vercel production config** — Set up production environment on Vercel dashboard. Configure build settings, Node.js version, region (Mumbai for India-first).
- **Environment variables** — Set all production env vars on Vercel: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `RESEND_API_KEY`, `AIRTABLE_API_KEY`, `AIRTABLE_BASE_ID`, `AIRTABLE_WEBHOOK_SECRET`, `TEAM_NOTIFICATION_EMAIL`.
- **Domain CNAME** — Configure `app.samvayamatrimony.com` CNAME to point to Vercel. Verify SSL certificate auto-provisioning. Test that root domain (`samvayamatrimony.com`) still serves Framer marketing site.
- **Smoke tests** — Run through the full user flow on production: login via OTP → fill form (first 5 questions minimum) → auto-save → logout → re-login → resume. Verify data in Supabase dashboard.
- **Admin smoke test** — Login as admin → view applicant list → open detail page → toggle payment status → add team note. Verify all admin pages load without errors.
- **Invite first users** — Send invites to 3-5 people from the waitlist that the founders know personally. Monitor for errors in Vercel logs.

---

## 11. Success Metrics

### Phase 2A Metrics

| Metric | Target |
|--------|--------|
| Onboarding form completion rate | 70%+ |
| AI conversation completion rate | 60%+ |
| Average form completion time | <35 minutes |
| Save-and-resume usage rate | Track (no target) |
| Admin dashboard usable for daily operations | Yes/No |

### Phase 2B Metrics

| Metric | Target |
|--------|--------|
| Pre-filtering reduces pool by | >80% |
| AI scoring consistency (re-run same pair) | >90% similar |
| Team match approval rate | 40–60% of suggestions |
| Time from suggestion to presentation | <48 hours |

### Phase 2C Metrics

| Metric | Target |
|--------|--------|
| PWA installability | Working on iOS + Android |
| Mobile form completion rate | 65%+ |
| Match response rate (within 7 days) | 80%+ |
| Feedback submission rate | 70%+ |

---

## 12. Open Questions

### Resolved (as of v8.0)

| # | Question | Resolution |
|---|----------|------------|
| 1 | Onboarding form questions | ✅ Finalized — 100 questions, 13 sections, full conditional logic documented in Section 4. Includes referral source Q6 added in v8.0 audit. |
| 2 | Third-party form filling | ✅ Removed — applicant-only. No parents, siblings, or guardians may fill the form on behalf of the applicant. |
| 3 | Marital status policy | ✅ Divorced and widowed applicants are welcome. Form captures this explicitly in Q7. |
| 4 | BGV provider and services | ✅ OnGrid — 13 checks defined in Section 4B. Triggered by verification fee payment + consent. |
| 5 | BGV payment prerequisite | ✅ BGV only initiated after verification fee confirmed AND consent given (Q99). |
| 6 | Social media handles | ✅ Collected post-onboarding: LinkedIn (mandatory), Instagram (optional). |
| 7 | Profile cards | ✅ Two types fully specced: Admin card (Section 6.11A) + Member-facing match card (Section 6.11B). |
| 8 | Pricing | ✅ Locked. Verification fee ₹7,080. Membership fee ₹41,300. GooCampus members skip verification fee. |
| 9 | Razorpay integration | ✅ Deferred to v2. v1 uses manual payment flag. Team collects payment offline. |
| 10 | Domain structure | ✅ Subdomain-based. app.samvayamatrimony.com/app + /admin. Root domain on Framer (marketing). |
| 11 | SMS provider | ✅ MSG91. |
| 12 | AI chat question positions | ✅ Q38 (family background, Section D), Q75 (goals & values, Section J), Q100 (closing, Section M). |

### Pre-Deployment Action Items

> **Review these at the start of every session until completed.**

| # | Item | Status | Details |
|---|------|--------|---------|
| 1 | Set `NEXT_PUBLIC_WHATSAPP_NUMBER` env var | **DONE** (2026-03-12) | Set to `919742811599` in `.env.local` and `.env.local.example`. Vercel env var pending `vercel login`. |
| 2 | Push `handle_match_response` RPC migration | **DONE** (2026-03-12) | Deployed via `supabase db push`. `handle_match_response()` RPC active in production database. |
| 3 | Push user match RLS migration | **DONE** (2026-03-12) | Deployed (policies already existed; migration marked as applied). RLS active on `match_presentations`, `match_suggestions`, `match_feedback`. |

### Deferred to Future Phases

- Native iOS and Android apps
- WhatsApp Business API integration
- Family sharing features
- In-app messaging between matched members
- Astrological compatibility scoring
- Doctor + non-doctor matching
- Voice input for AI conversations (flagged as v2)
- Wedding planning adjacencies
- Referral program
- CMS for blog / resources
- Profile card PDF / image export
- Razorpay full payment integration (flagged as v2)

---

## 13. Brand Reference

### Colors

| Name | Hex | Usage |
|------|-----|-------|
| Samvaya Red | #A3171F | Primary accent, CTAs, key UI elements |
| Charcoal Black | #18181B | Text, headers, dark backgrounds |
| Samvaya Gold | #FFBA34 | Secondary accent, highlights, badges |
| Mist Grey | #F4F4F6 | Backgrounds (admin dashboard) |
| Pale Blush | #FFF4F4 | Backgrounds (user-facing, warm feel) |

### Voice & Tone

- Warm, empathetic, validating
- Speaks to the human experience behind credentials
- Never clinical, corporate, or condescending
- Acknowledges sacrifice and honors the medical calling
- Straightforward, respectful of time

---

---

## 14. Legal & Compliance Placeholders

Legal documentation (Terms of Service, Privacy Policy, Refund Policy) will be drafted by external legal counsel and provided separately. The following URL structure should be implemented at build time with placeholder pages. Final content will be dropped in without requiring URL changes.

| Document | URL | Status |
|---|---|---|
| Terms of Service | `app.samvayamatrimony.com/legal/terms` | Placeholder — awaiting legal draft |
| Privacy Policy | `app.samvayamatrimony.com/legal/privacy` | Placeholder — awaiting legal draft |
| Refund Policy | `app.samvayamatrimony.com/legal/refunds` | Placeholder — operational position in Section 6B.4 above |
| Cookie Policy | `app.samvayamatrimony.com/legal/cookies` | Placeholder — awaiting legal draft |

**Implementation note for Claude Code:** Build each of these as a simple static page that renders markdown content fetched from a CMS field or a plain `.md` file in the repo. When legal provides the final documents, they drop into the file — no code changes required.

All four URLs must be linked in:
- The website footer
- The onboarding form welcome screen (Terms of Service + Privacy Policy)
- The BGV consent screen (Privacy Policy)
- The payment confirmation screen (Refund Policy + Terms of Service)

---

## 15. Technical Decisions Log

| Decision | Choice | Rationale |
|---|---|---|
| Frontend framework | Next.js 16 (App Router) | SSR, file-based routing, excellent Vercel integration |
| Language | TypeScript | Type safety critical for complex form logic and schema |
| Styling | Tailwind CSS | Utility-first, fast to build with, consistent design system |
| Backend / database | Supabase | Postgres + Auth + Storage + Realtime in one. Row-level security for privacy. |
| AI / chat | Anthropic Claude API (claude-sonnet-4-20250514) | Powers onboarding conversations and compatibility extraction |
| Payments | Razorpay (v2) — deferred | v1 uses manual payment flag. Razorpay integration (UPI, cards, net banking via existing GooCampus account) is Phase 2 / v2. |
| SMS / OTP | MSG91 | Best-in-class Indian SMS gateway. Documentation in process. |
| Deployment | Vercel | Seamless Next.js deployment, edge functions, preview URLs |
| Domain structure | Subdomain-based | `app.samvayamatrimony.com/app` (members) + `/admin` (team). Root domain on Framer (marketing), `apply` on Netlify (waitlist). |
| BGV provider | OnGrid | Covers all 13 required checks. Cost passed through to applicant at ₹6,000 + GST. |


*Samvaya Phase 2 PRD v9.2 — March 2026 — Confidential*
