# Samvaya Design Direction — Phase 2F

> **Finalized March 25, 2026** after a detailed design review session with the founder.
> This document captures the visual direction for the premium design overhaul. All component work in Phase 2F must follow these guidelines.

---

## General Aesthetic

| Principle | Description |
|-----------|-------------|
| **Mood** | Quiet luxury. Calm confidence. Not flashy, not trying hard. |
| **Glassmorphism** | Real, not decorative — backdrop-blur 20-40px, backgrounds genuinely show through (alpha 0.1-0.3, not 0.6-0.7) |
| **Colors** | Muted, sophisticated, not saturated. samvaya-red as ambient warmth, not primary UI color |
| **Numbers** | Large, thin-weight font — the number itself is the visual element |
| **Spacing** | Very generous — content breathes, never cramped |
| **Buttons** | Pill-shaped or high border-radius. Dark solid for primary, frosted glass for secondary |
| **Cards** | Edges defined by blur and transparency, not hard borders |
| **Icons** | Circular frosted glass backgrounds for icon buttons |

---

## Typography

**Font: Geist** (Vercel, via `geist` npm package)

Replaces ApfelGrotezk. Geist is the active font across the entire Next.js app. It is a variable font supporting weights 100–900, making it ideal for the thin-weight display numbers that define the premium aesthetic. The Framer landing page will be updated to Geist separately.

| Usage | Weight | CSS |
|-------|--------|-----|
| Display numbers (hero stats, countdowns) | Thin / Light (100-300) | `font-thin`, `font-light` |
| Large headings | Light (300) | `font-light` |
| Section headings, card titles | Medium (500) | `font-medium` |
| Labels, small headings, badges | SemiBold (600) | `font-semibold` |
| Body text | Regular (400) | `font-normal` |
| Bold emphasis | Bold (700) | `font-bold` |

**Key typography rules:**
- Large numbers should always use thin/light weight — this is the signature look
- Never use bold for large display numbers — it defeats the premium feel
- Body text stays at regular weight for readability
- Labels and badges use semibold for contrast at small sizes

---

## Color Application

**Shift from current approach:** samvaya-red (#A3171F) moves from being a primary UI element color (buttons, badges) to an atmospheric/ambient tone used in gradients and backgrounds.

| Element | Color Approach |
|---------|---------------|
| Primary buttons | Dark charcoal/black (#18181B), pill-shaped |
| Secondary buttons | Frosted glass (semi-transparent white with blur) |
| Background atmosphere | samvaya-red gradients, subtle and warm |
| Status accents | Muted versions of green/blue/amber — not saturated |
| Text hierarchy | #18181B (primary) → gray-600 (secondary) → gray-400 (tertiary) |
| Active/highlight | samvaya-red used sparingly for active states, not broadly |

---

## Glassmorphism Refinement

The existing glass classes in `globals.css` need adjustment to match the founder's vision:

| Property | Current | Target |
|----------|---------|--------|
| `backdrop-blur` | 12-16px (light/medium) | 20-40px for real glass feel |
| Background alpha | 0.35-0.6 | 0.1-0.3 so backgrounds show through |
| Border | 1px solid rgba(255,255,255,0.2-0.3) | Subtle or absent — blur defines the edge |
| Card feel | Semi-opaque panels | Genuinely transparent, frosted |

**Frosted glass tooltip pattern** (from Visitors Insights reference): Small floating cards with high blur, minimal border, used for hover states and contextual info.

---

## Dashboard Card Designs

### Card 1 — Profile Summary

```
┌─────────────────────────┐
│                         │
│   ┌─────────────────┐   │
│   │                 │   │
│   │     PHOTO       │   │
│   │   (blurred or   │   │
│   │    revealed)    │   │
│   │                 │   │
│   └─────────────────┘   │
│                         │
│   Dr. Priya Sharma ✓    │  ← name + verified badge
│   Cardiology · SR       │  ← specialty · designation
│   Mumbai, Maharashtra   │  ← location
│                    ✏️    │  ← edit icon (subtle)
└─────────────────────────┘
```

**Design principles:**
- Photo is the hero — takes up 50-70% of the card
- Large rounded corners on both card and photo (16-24px)
- Photo inset with ~12px padding between photo edge and card edge
- Name in bold/medium, subtitle in muted regular weight
- Verified badge as small green pill next to name
- Glassmorphic card surface with subtle border
- Edit icon: subtle, top-right or bottom-right

**Inspired by:** Clean white profile cards (Emma Collins, Muhammad Emon, Benjamin Turner light variant), pill-style verified badges, inset photo with rounded corners.

---

### Card 2 — Status Card (Hero Card)

```
┌─────────────────────────────────┐
│  ┌──────┐                       │
│  │ ICON │  Status Badge ●       │  ← icon + colored pill badge
│  └──────┘                       │
│                                 │
│  Title (large, bold)            │  ← e.g. "Verification In Progress"
│  Description text, 2-3 lines   │
│  of supporting context.         │
│                                 │
│  ┌─────────────────────────┐   │
│  │ ✓ Profile Submitted     │   │
│  │ ✓ Payment Received      │   │  ← progress steps checklist
│  │ ● Background Verification│   │
│  │ ○ Added to Pool          │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │     View Details  →     │   │  ← CTA button
│  └─────────────────────────┘   │
└─────────────────────────────────┘
```

**Design principles:**
- Colored accent on the left or top — samvaya-red or gold depending on status
- Glassmorphic card surface with frosted background
- Progress as a visual checklist — green checkmarks for done, samvaya-red accent for active, gray for future
- Single clear CTA at the bottom (pill-shaped, dark for primary action)
- Status badge as a colored pill, top-right area

**Inspired by:** Construction app progress phases, Task Management app card structure, Fitness app hero card with CTA, Tesla auto workshop "CURRENT STATUS" glassmorphic cards.

---

### Card 3 — Match Stats

```
┌──────────────────────────────────┐
│  Matches                         │
│                                  │
│  ┌─────────────┐ ┌─────────────┐ │
│  │  👥          │ │  ⏳          │ │
│  │  5           │ │  2          │ │  ← large, THIN weight numbers
│  │  total       │ │  pending    │ │
│  └─────────────┘ └─────────────┘ │
│                                  │
│  View Matches →                  │
└──────────────────────────────────┘
```

**Design principles:**
- Two equal-width glassmorphic sub-cards inside the parent card
- Sub-cards at slightly different opacity from parent (depth layering)
- Small icon top-left of each sub-card, color-coded
- Number is the hero — large, thin/light weight (Urbanist 200-300)
- Label below in muted text
- "View Matches →" as subtle link, not a big button

**Inspired by:** Finance app paired metric cards (dark teal savings app $190/$40), side-by-side stat widgets, construction dashboard grid.

---

### Card 4 — Membership Countdown

```
┌──────────────────────────────────┐
│  MEMBERSHIP                ↗     │  ← small caps label + arrow icon
│                                  │
│  142 days remaining    180 Total │  ← hero number + context
│                         38 Used  │
│                                  │
│  ████████████░░░░░░░░░░░░░░░░░  │  ← glassmorphic progress bar
│                                  │
│  Started Mar 15  ·  Expires Sep  │  ← date range, muted text
└──────────────────────────────────┘
```

**Design principles:**
- Small-caps category label top-left
- Arrow icon top-right (links to details)
- Large thin-weight number as focus ("142")
- Show both remaining AND total (gives context to the progress bar)
- Glassmorphic progress bar with branded fill (samvaya-red or gold gradient)
- Supporting date text below in muted color

**Inspired by:** Construction Budget Used card (glassmorphic grid), calorie tracking cards (1,493 Consumed / 2000 Target / 507 Remaining pattern), Spring declutter challenge progress card.

---

### Card 5 — Activity Timeline

```
┌──────────────────────────────────┐
│  Timeline                        │
│                                  │
│  ✓ ── Profile Submitted          │
│  │    15 Mar 2026                │
│  │                               │
│  ✓ ── Payment Received           │
│  │    18 Mar 2026                │
│  │                               │
│  ◉ ── Background Verification    │  ← active step: branded glow
│  │    In progress                │
│  │                               │
│  ○ ── Added to Pool              │
│       Upcoming                   │
└──────────────────────────────────┘
```

**Design principles:**
- Completed steps: Green filled circle with white checkmark
- Active step: samvaya-red circle with subtle pulse/glow animation — larger than others
- Future steps: Empty/outlined circle in gray
- Connecting line: Thin (1-2px), green between completed, gray from active onward
- Bold title for each step, muted small date or status below
- Generous whitespace between steps

**Inspired by:** CONVX onboarding stepper (icon dots + title + subtitle), MicroLab booking flow (numbered steps with checkmarks), Application Progress tracker (expandable steps with green checkmarks).

---

## Key Reference Designs

These apps were reviewed with the founder and represent the target aesthetic:

| Reference | What to Take From It |
|-----------|---------------------|
| **Projector config app** (warm amber) | Ultra-thin typography on deep glassmorphic backgrounds. Warm, cinematic feel. Frosted glass buttons. |
| **Visitors Insights analytics** (steel blue/mint) | Large thin-weight numbers as hero elements. Glassmorphic floating tooltips. Semi-circular progress arcs. Two-tone backgrounds. |
| **Construction dashboard** (glassmorphic grid) | The gold standard for card layout — 4 glassmorphic metric cards on blurred background. Each card is a distinct data type. |
| **Dark teal savings app** | Layered glassmorphism — outer card glow → card surface → inner sub-cards. Teal accents (swap for samvaya-red/gold). |
| **Clean white profile cards** (Emma Collins, Muhammad Emon) | Photo-dominant, minimal info below, verified badges, generous padding. |
| **Task Management app** | Status badges ("Ongoing", "High"), progress bars, checklist items inside cards. |
| **Fitness hero card** | Category badge + title + meta info + CTA + circular progress — compact and information-rich. |
| **Urbanist font spec** | The chosen font shown on glassmorphic gradient backgrounds. Geometric sans-serif with excellent thin weights. |
| **ORRISO AI Agent app** | Dark/light contrast panels. Pill-shaped buttons. Large rounded corners everywhere. Frosted glass toolbars. |

---

## What NOT to Do

- **Don't use bold for large display numbers** — thin/light weight only
- **Don't use samvaya-red for primary buttons** — use dark charcoal/black pills instead
- **Don't use hard borders to define cards** — let blur and transparency do the work
- **Don't use high-alpha backgrounds** (0.6+) — keep them transparent (0.1-0.3)
- **Don't make animations bouncy or playful** — calm, smooth, elegant only
- **Don't over-saturate status colors** — use muted greens, blues, ambers
- **Don't cram information** — when in doubt, add more whitespace
- **Don't use low-alpha glass on light backgrounds** — on light/warm backgrounds, glass cards need alpha 0.5-0.7 to look frosted. Low alpha (0.1-0.3) only works on dark backgrounds.

---

## Implementation Progress (updated March 26, 2026)

### What's Already Done
- **Font:** Geist (via `geist` npm package) — active across all 266 component files. Semantic type utilities defined in `globals.css` (`.type-display-*`, `.type-heading-*`, `.type-subheading`, `.type-body*`, `.type-label`, `.type-caption`, `.type-stat`).
- **Design tokens in globals.css:**
  - `.card-glass` — alpha 0.6, blur 24px, inset white highlight, elevated shadow, rounded-2xl
  - `.glass-sub-card` — warm-tinted sub-card for depth layering inside parent cards
  - `.glass-pill` — frosted glass pill button for secondary actions
  - `.active-glow` — pulse animation with samvaya-red glow (for timeline active step)
  - `.btn-primary` — dark charcoal (#18181B), pill-shaped (border-radius: 9999px)
  - `.btn-secondary` — frosted glass with backdrop-blur, pill-shaped
  - `.bg-page-warm` — rich warm gradient with visible rose/gold tones (not near-white)
  - Badge system (6 variants), animation utilities, hover-lift, press-scale all defined
- **App layout:** `src/app/app/layout.tsx` uses `bg-page-warm` for user-facing pages
- **Dashboard data:** `src/app/app/page.tsx` now fetches primary photo URL for profile card
- **Dashboard v1 structure:** `src/components/app/StatusDashboard.tsx` has initial implementations of all 5 cards — but these need founder review and iteration

### What's NOT Done Yet
- Each card needs founder review with screenshot references and back-and-forth iteration
- Match card components (9 files) — untouched
- App components (settings, profile, photos, etc.) — untouched
- Form shell + inputs — untouched
- Admin components — untouched
- Navigation (AppHeader, BottomNav) — untouched

### Card-by-Card Status

| Card | Status | Notes |
|------|--------|-------|
| Card 1 — Profile Summary | **NEXT** | Has photo area + name/badge. Needs founder review with screenshot references. |
| Card 2 — Status Card | Pending | Has left accent bar + frosted icon + badge system. Needs founder review. |
| Card 3 — Match Stats | Pending | Has two sub-cards with thin numbers. Needs founder review. |
| Card 4 — Membership Countdown | Pending | Has thin hero number + gradient progress bar. Needs founder review. |
| Card 5 — Activity Timeline | Pending | Has checkmarks + active glow. Needs founder review. |

---

## Workflow: Card-by-Card Iteration

The founder will work on each card one at a time in separate Claude sessions:

1. **Start session** — tell Claude which card number you're working on
2. **Share screenshots** — reference images showing the exact look you want
3. **Iterate** — back and forth until the card matches the vision
4. **Finalize** — founder confirms the card is done
5. **Clear context** — start fresh session for the next card

**IMPORTANT — Claude must do this at the END of every card session when the founder confirms a card is done:**
1. Update the "Card-by-Card Status" table above: change the completed card's status from **NEXT** → **DONE**
2. Set the next card in sequence to **NEXT**
3. If ALL 5 cards are DONE, update the status to note that dashboard cards are complete and the next phase is match card components, app components, form, and admin (in that order)

This ensures the next session (after context is cleared) knows exactly where to pick up.

**Key file:** `src/components/app/StatusDashboard.tsx` — all 5 cards are sub-components in this single file.

**Test URL:** http://localhost:3000/app (requires `npm run dev` + logged in as test user maheenejaz@goocampus.in)

**Test user setup:** `onboarding_section` set to 13, `payment_status` = `verification_pending`, profile = Dr. Ejaz Maheen, Cardiology, Senior Resident, Bangalore. To test other cards (Match Stats, Membership Countdown), change `payment_status` in Supabase to `in_pool` or `active_member`.
