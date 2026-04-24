# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

---

# CLAUDE.md — Samvaya Build Context

> Read at the start of every session before writing any code. This is the sequencer and safety rail — not the spec (PRD) or status tracker (plan.md).

---

## Quick Reference

| Fact | Value |
|------|-------|
| Form | 99 base questions, 14 sections (A–N), 3 Claude chats (Q38, Q75, Q100 in Section N — sequential, one at a time) |
| Verification fee | ₹3,500 + 18% GST = **₹4,130** |
| Membership fee | ₹35,000 + 18% GST = **₹41,300** |
| Claude model | `claude-sonnet-4-20250514` |
| Payment v1 | Manual flag only — no Razorpay |
| Auth | Email OTP via Supabase — no passwords |
| Photo blur | Sharp sigma 20, server-side at upload — never CSS |
| BGV | Third-party provider, 13 checks |
| Current phase | **Phase 2F — Premium Design Overhaul & Launch Prep** |

## Toolchain
Read TOOLCHAIN.md before starting any session. Install anything listed there before writing code.

---

## What Is Samvaya

Premium matrimony platform for medical professionals in India. Doctors only. Founded by Ashwini, Santosh, and Ejaz. GooCampus members get the verification fee waived.

All phases built: 2A (form), 2B (matching), 2C (PWA), 2D (polish), 2E (hardening). Phase 2F is the final pre-launch design overhaul.

---

## Reference Documents

| Document | What It Contains |
|----------|-----------------|
| `Samvaya_Phase2_PRD_v9.md` | Full spec — schema, form questions, matching, pricing. **Authority on all details.** |
| `Samvaya_Claude_Chat_Prompts_v1.md` | System prompts, branching logic, extraction JSON for all 3 AI chats |
| `AUDIT.md` | Audit results across all phases: agents, issue counts, fixes |
| `design.md` | Phase 2F design direction: Geist font, glassmorphism, cards, colors. **Read before any design work.** |
| `plan.md` | **Living status tracker.** What's done, pending, priority queue. Read at session start. |

---

## Tech Stack — Locked

No new dependencies without founder approval.

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16+ App Router, TypeScript |
| Styling | Tailwind CSS |
| Database | Supabase (PostgreSQL + Auth + Storage + Realtime) |
| AI | Anthropic Claude API (`claude-sonnet-4-20250514`) |
| Payments | v1: Manual flag only. Razorpay = v2 (deferred) |
| SMS | MSG91 |
| Email | Resend |
| Hosting | Vercel |
| BGV | Third-party provider (13 checks) |

---

## Architecture — Locked

```
app.samvayamatrimony.com/app/*     → User-facing (mobile-first)
app.samvayamatrimony.com/admin/*   → Admin dashboard (desktop-first)
app.samvayamatrimony.com/api/*     → API routes
app.samvayamatrimony.com/legal/*   → Static legal pages

Root domain + www → Framer. apply.* → Netlify (Phase 1, closed).
Vercel fallback: samvaya-phase2.vercel.app
```

- Supabase = source of truth. Airtable = read-only, one-way sync. Never write to Airtable.
- Auth: email OTP only. Admin → `/admin/*`. Applicant → `/app/*`. Enforced by middleware.

---

## Pricing — Locked

Never change these numbers. One wrong figure propagates silently into legal copy, emails, and DB.

| Fee | Total | When triggered |
|-----|-------|----------------|
| Verification | **₹4,130** (₹3.5K + 18% GST) | After form submitted + payment confirmed |
| Membership | **₹41,300** (₹35K + 18% GST) | Both parties confirm mutual interest |
| Premium concierge | ₹1.5L–₹2L | Founder-led, never publicly displayed |
| GooCampus members | ₹0 verification | `is_goocampus_member = true` |

---

## Payment State Machine

`users.payment_status` determines every screen the user sees.

```
unverified → verification_pending → in_pool → match_presented → awaiting_payment → active_member → membership_expired
```

GooCampus members: `unverified` → `in_pool` directly (skip `verification_pending`).

**Hard rules — enforce in code:**
1. BGV requires BOTH: `verification_fee_paid = true` AND `bgv_consent = consented` or `consented_wants_call`.
2. Membership fee cannot be requested until `match_presentations.is_mutual_interest = true`.
3. `membership_start_date` = mutual interest date, not payment date.
4. GooCampus members: verification fee screen must never render for them.

---

## The Form

- 99 base questions, 14 sections (A–N), ~28–32 conditional questions
- 3 Claude AI chats in Section N "Conversations" (all grouped at the very end, after Section M Documents). Presented sequentially one at a time — user completes Chat 1 → auto-advances to Chat 2 → auto-advances to Chat 3 → form submits. Each chat opens full-screen at `/app/onboarding/chat/[chatId]`.

| Chat | Question ID | questionNumber | Exchanges |
|------|-------------|----------------|-----------|
| Conv 1 — Family | Q38 | 110 | 4 max |
| Conv 2 — Goals & values | Q75 | 111 | 6 max |
| Conv 3 — Closing | Q100 | 112 | 1 only |

- Auto-saves on every answer (debounced Supabase upsert)
- Save-and-resume via `users.onboarding_section` + `users.onboarding_last_question`
- Q3 (email) and Q4 (phone) stored in `auth.users` — not in `profiles`
- Confidentiality callouts at Sections C, E, F, J, L (see PRD 4.2 for exact copy)
- **Temporary testing state — MUST restore before launch:** All fields optional (`required: false`), some upload minFiles still > 0 (Q95: 3, Q97: 1) — verify before launch

---

## Current Phase

**Phase 2F — Premium Design Overhaul & Launch Prep** (target: April 4, 2026)

Design goals (tokens already exist in `globals.css` — deploy across ~130 components):
- Glassmorphism: backdrop-blur, semi-transparent bg, subtle borders on all cards
- Geist font — thin weights for display numbers, regular for body (variable font, weights 100–900)
- Hover lifts, fade transitions, loading shimmers on all interactions
- Unified button, card, and badge systems across user + admin pages

Admin dashboard overhaul is complete. User-facing PWA design is paused. See `plan.md` for full priority queue and pending items.

**Test user:** `maheenejaz@goocampus.in` | **Test URL:** `http://localhost:3000/app`

---

## Rules That Must Never Be Broken

| Rule | Consequence of breaking |
|------|------------------------|
| Pricing is ₹4,130 and ₹41,300 | Silently corrupts legal copy, emails, and DB |
| Q-numbers locked at 100 | Breaks save-and-resume, extraction JSON, chat prompts |
| Claude model = `claude-sonnet-4-20250514` | Extraction quality calibrated to this model — never swap silently |
| Photo blur = Sharp sigma 20, server-side, stored as separate file | CSS blur is DOM-removable; must live in the file |
| BGV requires BOTH conditions | Legal and trust issue — one condition alone is not enough |
| `membership_start_date` = mutual interest date | Payment date gives applicant less time than promised |
| Supabase is source of truth | Never write structural data to Airtable |
| **Schema check after any question change** | Missing/wrong-type columns cause silent save failures in prod |

---

## Mandatory: Adding or Modifying Questions

**ANY edit to `src/lib/form/questions.ts` — adding a question, changing `targetTable`, `targetColumn`, or `type` — MUST be followed by these two steps before the task is considered complete:**

### Step 1 — Validate columns exist with correct types
```bash
SUPABASE_ACCESS_TOKEN=<token from .env.local> npm run check:schema
```
- If errors are reported: add the missing columns to the prod Supabase project (`iqpcrjofhwollksgevqo`) before proceeding.
- Multi-select questions (`type: 'multi_select'`) MUST map to `text[]` columns, not `text`. Getting this wrong JSON-stringifies arrays, causing answers to silently disappear on re-hydration.
- Use the Supabase management API to add columns: `POST https://api.supabase.com/v1/projects/iqpcrjofhwollksgevqo/database/query`

### Step 2 — Regenerate TypeScript types
```bash
SUPABASE_ACCESS_TOKEN=<token from .env.local> npm run gen:types
```
Then run `npx tsc --noEmit` to confirm no type errors.

### Why this is mandatory
The prod DB and the TypeScript types can silently diverge from `questions.ts`. Past incidents:
- `profiles.free_time_preferences` — column missing in prod → every Section G save failed with HTTP 400
- `profiles.hobbies_regular` — column was `text` instead of `text[]` → array answers JSON-serialized to strings, Q54 appeared empty on every re-hydration
- 10 more columns were missing in prod across Sections H–L, discovered by running the schema check

The `SUPABASE_ACCESS_TOKEN` is in `.env.local` as `SUPABASE_ACCESS_TOKEN=sbp_...`.

---

## Critical Gotchas

**Photo uploads have two paths.** Every upload produces: original at `storage/photos/{user_id}/original/{filename}` AND Sharp-blurred copy at `storage/photos/{user_id}/blurred/{filename}`. Both rows written to `photos` table.

**GooCampus gate is a hard block.** If `is_goocampus_member = true`, the verification fee page must never render. Status goes `unverified` → `in_pool` manually. Do not let payment UI leak to them even briefly.

**Q100 is one exchange only.** One prompt → one response → one fixed closing message → stored verbatim. No branching, no follow-ups.

**Email is auth AND contact.** Q3 (email) and Q4 (phone) live in `auth.users` only. No separate fields in `profiles`.

**Claude Chat Q75 maps across 3 tables.** Extraction fields span `compatibility_profiles`, `profiles`, and `partner_preferences`. Read `Samvaya_Claude_Chat_Prompts_v1.md` before touching it.

**AI system prompts are server-only.** `prompts.ts` imports `server-only`. Client uses `chat-metadata.ts` only (title, maxExchanges, nudgeText). Never expose full prompts to the client.

---

## Decisions Log

| Date | Decision |
|------|----------|
| Mar 2026 | Razorpay deferred to v2 — team collects offline, flags manually |
| Mar 2026 | 100 base questions — Q6 (referral source) added to Section A; all downstream Q-numbers shifted |
| Mar 2026 | Email OTP only — no passwords, no phone OTP |
| Mar 2026 | Spider chart: custom SVG, zero deps — avoids Chart.js/Recharts bundle cost |
| Mar 2026 | No service worker for v1 — web manifest only; offline support = v2 |
| Mar 18 | AI system prompts moved to server-only (`prompts.ts`) |
| Mar 18 | Test pages (`/test/*`) gated behind admin auth |
| Mar 25 | Font: Geist (replaced ApfelGrotezk, then Urbanist) — variable font, full weight range. See `design.md`. |
| Mar 27 | Claude chats confirmed in Section N "Conversations" — all 3 grouped at end (after Section M Documents), not inline. Sequential full-screen flow: Q38 → Q75 → Q100 → form submit. questionNumbers 110, 111, 112. |
| Mar 27 | Form fields temporarily optional — must restore before real applicants |
| Mar 27 | `maheenejaz@goocampus.in` set as admin for testing |
| Apr 10 | Onboarding form mobile-first redesign — section-by-section routing (`/app/onboarding/[section]`), bento grid on desktop (`grid-auto-flow: dense`), pure white aesthetic, **Inter typeface** for `/app/onboarding/*` and `/app` shell only (overrides Geist there). Legacy single-page `FormShell` + sidebar/drawer/panel deleted. Auto-save engine, conditional rules, and upload pipeline (Sharp blur) untouched. `GuidedPhotoUpload` replaced with simple drag-drop multi-upload via `FileUploadInput`. Full-screen Claude chats at `/onboarding/chat/[chatId]`. |
