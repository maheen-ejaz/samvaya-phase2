# CLAUDE.md — Samvaya Build Context

> **Read this at the start of every session before writing a single line of code.**
> This file tells you what Samvaya is, what you're building right now, what decisions are locked, and what will break if you get them wrong. The PRD is the full specification. This file is the sequencer and the safety rail.

---

## Quick Reference — Most Commonly Needed Facts

| Fact | Value |
|------|-------|
| Form length | 100 base questions, 13 sections (A–M) |
| AI chats | 3, embedded mid-form: Q38, Q75, Q100 |
| Verification fee | ₹6,000 + 18% GST = **₹7,080 total** |
| Membership fee | ₹35,000 + 18% GST = **₹41,300 total** |
| Claude model | `claude-sonnet-4-20250514` |
| Payment v1 | Manual flag only — NO Razorpay yet |
| Auth method | Email OTP via Supabase Auth — no passwords |
| Photo blur | Sharp, sigma 20, server-side at upload time — never CSS |
| BGV provider | OnGrid, 13 checks |
| Current build phase | **Phase 2A, Part 1 — Form only** |

## Toolchain
Read TOOLCHAIN.md before starting any session. Install anything listed there that is not yet installed before writing any code.

---

## What Is Samvaya

A premium, curated matrimony platform exclusively for medical professionals in India. Doctors only — no exceptions. Founded by Ashwini, Santosh, and Ejaz. Backed by GooCampus — an existing client base of paying medical professionals who get their verification fee waived.

Phase 1 is live: waitlist landing page at `apply.samvayamatrimony.com`, waitlist form, Supabase data, n8n automation, Airtable sync. Phase 1 is closed.

**You are building Phase 2.**

---

## Reference Documents

| Document | Filename | What It Contains |
|----------|----------|-----------------|
| PRD v9.0 | `Samvaya_Phase2_PRD_v9.md` | Full product spec — every schema table, every form question, matching algorithm, admin dashboard, pricing, comms, profile cards. **This is the authority.** |
| Claude Chat Prompts v1 | `Samvaya_Claude_Chat_Prompts_v1.md` | Full system prompts, branching logic, extraction JSON format, and exchange limits for all 3 AI conversations |
| This file | `CLAUDE.md` | Build order, current task, locked decisions, gotchas |

When in doubt about a spec detail, read the PRD. When in doubt about what to build next, read this file.

---

## Tech Stack — Locked

Do not introduce new dependencies or swap any of these without an explicit instruction from the founder.

| Layer | Technology | Why it was chosen |
|-------|------------|-------------------|
| Framework | Next.js 14+ App Router, TypeScript | SSR, file-based routing, seamless Vercel integration. Shared codebase for admin + PWA. |
| Styling | Tailwind CSS | Utility-first, fast to build with, consistent design system |
| Database | Supabase (PostgreSQL + Auth + Storage + Realtime) | Already in use for waitlist. RLS for privacy. Auth built in. The founder can inspect data via dashboard. |
| AI | Anthropic Claude API (`claude-sonnet-4-20250514`) | All onboarding conversations and compatibility extraction. Always use this exact model string. |
| Payments | **v1: Manual flag only.** Razorpay = v2, deferred | Saves 2 build days. Team collects offline, sets `payments.verification_fee_paid = true` manually. |
| SMS / OTP | MSG91 | Best-in-class Indian SMS gateway. Documentation in process. |
| Email | Resend | Transactional emails |
| Hosting | Vercel | Next.js deployment, edge functions, preview deployments |
| BGV | OnGrid (13 checks) | Full identity, financial, employment, legal, address, social media verification |

---

## Architecture — Locked

```
Single Next.js codebase, single Vercel deployment, single domain:

samvayamatrimony.com/app/*     → User-facing (mobile-first)
samvayamatrimony.com/admin/*   → Admin dashboard (desktop-first)
samvayamatrimony.com/api/*     → API routes (server-side, Claude API calls, webhooks)
samvayamatrimony.com/legal/*   → Static placeholder legal pages
```

- Supabase = source of truth. Airtable = read-only team copy synced from Supabase. Never write primary data to Airtable.
- Auth: Supabase Auth, **email OTP only** (no passwords, no phone OTP). Role-based routing via Next.js middleware.
- Admin users → `/admin/*`. Applicant users → `/app/*`. Middleware enforces this.

---

## Pricing — Locked

Never change these numbers. They appear in UI copy, emails, and the database. One wrong number cascades everywhere.

| Fee | Calculation | Total | When triggered | Refundable |
|-----|-------------|-------|----------------|------------|
| Verification fee | ₹6,000 + 18% GST | **₹7,080** | After form submitted + payment confirmed | No |
| Membership fee | ₹35,000 + 18% GST | **₹41,300** | Both parties confirm mutual interest | No |
| Premium concierge | ₹1.5L–₹2L | Price on enquiry | Founder-led, never publicly displayed | — |
| GooCampus members | Verification fee waived | ₹0 verification | `is_goocampus_member = true` | — |

---

## Payment State Machine — Enforced in Code

Every screen the user sees is determined by `users.payment_status`. Always reflect the current state clearly. The next action must always be visible.

```
unverified
  │  Form submitted, verification fee not yet paid
  ▼
verification_pending
  │  Fee confirmed by team (manual flag), BGV being initiated
  ▼
in_pool
  │  BGV complete, in candidate pool, awaiting match
  │  (GooCampus members jump directly here — skip verification_pending)
  ▼
match_presented
  │  Match shared with this user, awaiting their response
  ▼
awaiting_payment
  │  Mutual interest confirmed, membership fee not yet paid
  ▼
active_member
  │  Membership fee paid, 6-month window active
  ▼
membership_expired
     6-month window closed
```

**Hard rules — enforce these in code, not just in copy:**

1. **BGV cannot start** unless BOTH: `payments.verification_fee_paid = true` AND `users.bgv_consent` is `consented` or `consented_wants_call`. One condition alone is not enough. If consent is `consented_wants_call`, the team must have the call first.
2. **Membership fee cannot be requested** until `match_presentations.is_mutual_interest = true`.
3. **`membership_start_date`** = date of mutual interest confirmation, never the payment date. The 6-month clock starts when both say yes.
4. **GooCampus members**: skip verification fee entirely. Their `payment_status` moves `unverified` → `in_pool` when the team manually confirms. The payment/verification screen must never appear for them.

---

## The Form — Critical Facts for Claude Code

- **100 base questions** across 13 sections (A through M)
- **~28–32 conditional questions** that appear based on answers
- **3 Claude AI chat moments embedded mid-form** — not a post-form screen:

| Chat | Triggers at | Exchange limit | What it captures |
|------|-------------|----------------|-----------------|
| Conv 1 — Family background | Q38, Section D | 4 exchanges max | Family emotional texture, childhood model of marriage, domestic expectations |
| Conv 2 — Goals & values | Q75, Section J | 6 exchanges max (richest) | Career vision, partner role vision, conflict style, financial values |
| Conv 3 — Closing | Q100, Section M | 1 exchange only | Anything unsaid — one prompt, one response, done |

**How the embedded chat works:** When the form reaches Q38, the normal question UI is replaced by the chat interface. The applicant has the conversation. When it ends, the form resumes at Q39. Same pattern at Q75 (resumes at Q76) and Q100 (form completes). Build this as an inline component that swaps in at these question numbers, then hands back to the form.

**Other form rules:**
- Every question auto-saves on answer (debounced Supabase upsert)
- Save-and-resume: load `users.onboarding_section` + `users.onboarding_last_question` on return
- Q3 (email) and Q4 (phone) are collected in the form UI but stored in `auth.users` — not duplicated to `profiles`
- Confidentiality callouts appear at Sections C, E, F, K (see PRD 4.2 for exact copy)
- One question or logical group per screen — mobile-first

---

## Build Order — Phase Sequence

### Phase 2A — What You Are Building Right Now

**Part 1: Form only** — target April 4, 2026 (18 working days from March 11)

The form is the entire product right now. No dashboard, no matching. Get the form live. Real applicants fill it. Team reads data in Supabase/Airtable directly. That is enough to start.

**Database tables needed for Part 1:**
`users`, `profiles`, `medical_credentials`, `partner_preferences`, `photos`, `documents`, `payments` (manual flag only — no Razorpay)

**Part 2: Admin Dashboard** — after ≥5 real applicants confirm data quality
Applicant list, individual profile view, BGV tracker (13 checks), payment flag toggle, team notes, admin profile card, match suggestions queue, match presentations tracker, communication tools, dashboard home.

**Part 3: Sync + Completion** — Airtable sync, analytics, system config, activity log.

### Phase 2B — Matching Algorithm
*Do not build during Phase 2A.* Pre-filtering SQL, Claude API compatibility scoring, match suggestion queue. See PRD Section 5.

### Phase 2C — User-Facing PWA + Razorpay
*Do not build during Phase 2A or 2B.* Installable PWA, member dashboard, match card view, Razorpay payment flow. See PRD Section 7.

---

## Day-by-Day Build Plan (Part 1 — Form)

| Day | Date | Task |
|-----|------|------|
| 1 | Mar 11 | Project setup — Next.js 14 + TypeScript + Tailwind + Supabase client + Vercel pipeline confirmed working. Folder structure: `/app/(form)`, `/app/api`, `/components/form`, `/components/ui`, `/lib/supabase`, `/lib/claude`, `/types`. No UI yet. Foundation only. |
| 2 | Mar 12 | Database schema — form tables only. Write migrations, apply RLS policies, generate TypeScript types from Supabase. |
| 3 | Mar 13 | Authentication — email OTP via Supabase Auth. Protected routes. Session persistence. Middleware: role check + route unauthenticated users to login. |
| 4 | Mar 14 | **Form architecture — hardest day.** Auto-save engine (debounced upsert on every answer). Save-and-resume (loads section + last question on return). Conditional logic engine (rule evaluation, show/hide). Progress indicator. Do not rush this. Everything depends on it. |
| Buffer | Mar 15 | Catch-up if Day 4 spills. It usually does. |
| 5 | Mar 17 | Section A (Q1–Q17) — Basic Identity. First real questions into the form shell. |
| 6 | Mar 18 | Sections B + C (Q18–Q31) — Location + Religion. Build city autocomplete here — reused throughout. |
| 7 | Mar 19 | Section D (Q32–Q39) + Claude Chat 1 (Q38). Build inline chat UI component here — reused for Q75 and Q100. |
| 8 | Mar 20 | Sections E + F (Q40–Q52) — Physical + Lifestyle. Build illustrated MC component here — reused in Section K. |
| 9 | Mar 21 | Section G (Q53–Q55) — Interests. Hobbies grid with category groupings and illustrations. |
| 10 | Mar 24 | Sections H + I (Q56–Q62) — Education + Career. Work experience timeline (LinkedIn-style, multiple entries, add/remove). |
| 11 | Mar 25 | **⚠️ BEFORE STARTING: Review `Samvaya_Claude_Chat_Prompts_v1.md` with the founder. Conv 2 prompts are DRAFT v0.1 — confirm tone, branching, and extraction fields before building.** Section J (Q63–Q75) + Claude Chat 2 (Q75). Budget extra time — richest conversation, extraction maps to multiple schema fields. |
| 12 | Mar 26 | Section K (Q76–Q94) — Partner Preferences. Dual location selector, specialty checkboxes, quality tag grid. |
| 13 | Mar 27 | Section L (Q95–Q99) — Documents & Verification. File uploads (Supabase Storage). Photo blurring (Sharp, server-side, at upload). BGV consent screen. |
| 14 | Mar 28 | Section M (Q100) + Claude Chat 3. Form submission flow. Completion email to applicant (Resend). Notification email to team. |
| 15 | Mar 31 | Manual payment flag — `verification_fee_paid` boolean toggle in a bare-bones admin page (not the full dashboard). Payment state transitions wired in. |
| 16 | Apr 1 | End-to-end test — fill the entire form yourself as a test applicant. Every section, all 3 chats, file uploads, submission, email receipt. |
| Buffer | Apr 2 | Fix everything Day 16 surfaces. There will be things. |
| Buffer | Apr 3 | Mobile responsiveness check. Email delivery confirmed. Edge cases. |
| 17 | Apr 4 | First real invites — 3–5 people from waitlist you know personally. |

---

## Current Task

> **YOU ARE HERE: Phase 2A, Part 1 — Day 11**
>
> **Task:** Section J (Q63–Q75) + Claude Chat 2 (Q75). Review `Samvaya_Claude_Chat_Prompts_v1.md` with founder first. Budget extra time — richest conversation, extraction maps to multiple schema fields.
>
> **When this day's work is done:** Update this block to show the next day number, date, and task. Do not change the plan above — only this block changes.

---

## Decisions Log

Add an entry here whenever a decision is made that isn't already in the PRD. Date every entry. This is your audit trail.

| Date | Decision | Rationale |
|------|----------|-----------|
| Mar 2026 | Razorpay deferred to v2 | Saves ~2 days. Team collects payment offline and marks manually. Adds no value until dashboard and matching exist. |
| Mar 2026 | Form-first build order | Getting form live with real applicants is highest priority. Dashboard and matching are secondary. Team can use Supabase directly in the interim. |
| Mar 2026 | 100 total base questions | Referral source Q6 was in schema but missing from form — added to Section A. All downstream Q numbers shifted +1 from Q6 onward. |
| Mar 2026 | Email OTP only | No passwords. No phone OTP. Applicants are invited by the team and authenticate via email code. Simpler auth flow, no password reset logic needed. |
| Mar 2026 | Single domain, route-based | `samvayamatrimony.com/app` + `/admin`. No subdomains. Simpler SSL, cookies, and Vercel config. |

---

## Rules That Must Never Be Broken

These are not preferences. Breaking any of these will cause real data integrity, safety, or trust failures.

| Rule | Why it exists |
|------|--------------|
| Pricing is ₹7,080 and ₹41,300 | These numbers appear in legal copy, emails, UI, and the database. One wrong figure propagates silently. Never change without explicit instruction. |
| Q-numbers are locked at 100 | Renumbering the form mid-build breaks save-and-resume, extraction JSON mapping, all schema annotations, and chat prompts simultaneously. Never renumber. |
| Claude model = `claude-sonnet-4-20250514` | Extraction prompt quality was calibrated against this model. Different models may produce structurally different JSON. Never swap silently. |
| Photo blur = Sharp sigma 20 at upload, server-side | CSS blur is DOM-inspectable and removable. The blur must live in the file itself, stored in Supabase as a separate path. No exceptions. |
| BGV requires BOTH conditions | Fee paid AND consent given. Either alone is not sufficient. Initiating BGV without consent is a trust and legal issue. |
| `membership_start_date` = mutual interest date | This date governs the 6-month window. Setting it to the payment date gives less time than the applicant was promised. |
| Supabase is source of truth | Airtable is a read-only copy. Never write structural data to Airtable and sync back. |

---

## Gotchas and Known Complexity

**Day 4 is the foundation for everything.** The auto-save engine and conditional logic engine are the hardest parts of the entire build. If Day 4 spills into the buffer day, stay on it. Do not move to Section A until the architecture actually works — bad form infrastructure creates cascading bugs in every subsequent section.

**Claude Chat Q75 is the most complex integration.** Six exchanges, branched paths, and the extraction call maps to fields across `compatibility_profiles`, `profiles`, and `partner_preferences`. Budget 50% more time than you expect on Day 11. Read the full system prompt in `Samvaya_Claude_Chat_Prompts_v1.md` before building.

**Photo uploads have two paths, not one.** Every upload must produce: (1) original at `storage/photos/{user_id}/original/{filename}`, and (2) Sharp-blurred copy at `storage/photos/{user_id}/blurred/{filename}`. Both paths written to the `photos` table. If you only store one, the member card will be broken before you even build it.

**The form is applicant-only.** This is a UX principle embedded in the copy, not just a rule. No third-party filling. No "fill on behalf of" mode. The questions are designed to be answered by the person themselves.

**GooCampus member flow skips the payment screen entirely.** If `is_goocampus_member = true`, the verification fee page must never render. Their status moves `unverified` → `in_pool` manually. Build the GooCampus gate early — do not let payment UI leak to them even briefly.

**Q100 is one exchange only.** Do not build branching logic or follow-up questions for it. One Claude prompt → one applicant response → one fixed closing message from Claude → stored verbatim. Done. It is not a third interview.

**Email is auth AND contact.** Q3 in the form collects email, which is the same email Supabase Auth uses for OTP. Do not create a separate `email` field in the `profiles` table — it lives in `auth.users`. Same for Q4 (phone) — store in `auth.users.phone`.
