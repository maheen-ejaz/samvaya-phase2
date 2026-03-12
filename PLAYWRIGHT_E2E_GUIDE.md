# Playwright MCP E2E Test Guide — Samvaya Onboarding Form

> **Reference this file whenever Playwright MCP is invoked for testing the Samvaya onboarding flow.**
> It documents every quirk, selector pattern, and flow detail so future runs complete faster.

---

## Quick Reference

| Fact | Value |
|------|-------|
| Dev server URL | `http://localhost:3000` |
| Login page | `/auth/login` |
| Onboarding form | `/app/onboarding` |
| Admin page | `/admin` |
| Total questions | 100 base + ~28 conditional |
| Sections | 13 (A through M) |
| Claude chats | 3 (Q38, Q75, Q100) |
| File uploads | 4 (Q95 passport photo, Q96 profile photos, Q97 ID doc, Q98 kundali) |

---

## Authentication

### Applicant Login (Email OTP)
1. Navigate to `http://localhost:3000/auth/login`
2. Fill email in `textbox "Email address"`
3. Click `button "Send verification code"`
4. **To get OTP programmatically** (requires service role key):
```js
// Use admin.generateLink to get email_otp
const {data} = await supabase.auth.admin.generateLink({
  type: 'magiclink',
  email: 'user@example.com',
});
const otp = data.properties.email_otp; // 6-digit code
```
5. Fill OTP in `textbox "6-digit code"`
6. Click `button "Verify code"`
7. Middleware routes: applicants → `/app/onboarding`, admins → `/admin`

### Admin Login
- Same OTP flow, but the user's `role` in `public.users` must be `admin` or `super_admin`
- Create admin user via service role: `auth.admin.createUser()` then `update({role: 'admin'})`
- **Rate limit**: OTP requests are rate-limited to 1 per ~30 seconds. Wait between attempts.

### Creating Test Users (Node.js script pattern)
```js
const { createClient } = require('@supabase/supabase-js');
// Load env vars: export $(grep -v '^#' .env.local | xargs)
const c = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});
// Create user
const { data } = await c.auth.admin.createUser({
  email: 'test@example.com', password: 'test123456', email_confirm: true
});
// Set role
await c.from('users').update({ role: 'admin' }).eq('id', data.user.id);
```

### Resetting Test User Progress
```js
// Reset to beginning of form
await c.from('users').update({
  onboarding_section: 1, onboarding_last_question: 'Q1',
  membership_status: 'onboarding_pending', payment_status: 'unverified',
  gate_answers: null
}).eq('id', userId);
// Delete related records
await c.from('profiles').delete().eq('user_id', userId);
await c.from('medical_credentials').delete().eq('user_id', userId);
await c.from('partner_preferences').delete().eq('user_id', userId);
await c.from('compatibility_profiles').delete().eq('user_id', userId);
await c.from('photos').delete().eq('user_id', userId);
await c.from('documents').delete().eq('user_id', userId);
await c.from('payments').delete().eq('user_id', userId);
```

---

## Navigation Pattern

The form is single-page — questions load one at a time within `/app/onboarding`. Navigation uses:
- `button "Next"` (or `button "Next" [disabled]`) — always ref-based, use snapshot ref
- `button "Back"` — to go to previous question
- Next button is **disabled** until required fields are filled
- Optional questions have Next enabled by default

### Progress Indicator
The top bar shows: `Section X of 13 — Section Name` and `XX%`

### Save Status
Shows "Saved" after auto-save completes (debounced 500ms). Wait for this before navigating if needed.

---

## Input Component Patterns

### 1. Radio Buttons (Single Select)
```yaml
radio "Option text" [ref=eXXX]
```
**Action**: `browser_click` on the radio ref
**Example**: `click ref=e334` for "Completed PG"

### 2. Checkboxes (Multi Select)
```yaml
checkbox "Option text" [ref=eXXX]
```
**Action**: `browser_click` on the checkbox ref
**Note**: Some multi-selects have a "No preference" option that may be exclusive

### 3. Text Input
```yaml
textbox "Label or placeholder" [ref=eXXX]
```
**Action**: `browser_fill_form` with type "textbox"

### 4. Autocomplete Text Input (Cities)
- Appears for city questions (Q8 current city, Q9 hometown)
- Placeholder: `"Start typing your city name"` (NOT `"e.g. Bengaluru"`)
- Fill text, then wait for dropdown suggestions to appear
- Click the matching suggestion from the dropdown list
- **Quirk**: Use `browser_fill_form` to type, then `browser_snapshot` to see suggestions, then `browser_click` on the suggestion

### 5. Illustrated MC (Single Select Cards)
```yaml
button "Option text" [aria-pressed] [ref=eXXX]
```
- These are **buttons with `aria-pressed`**, NOT radio inputs
- Click the button to select; it toggles `[pressed]` state
- Examples: Q43 exercise frequency, Q46 smoking, Q47 drinking
- **Label quirk**: Labels differ from what you might expect:
  - Exercise: "Regular (4+ times/week)", "Moderate (2-3 times/week)", "Light (Once a week)", "Rarely"
  - Smoking: "No", "Occasional", "Regular" (NOT "Never")
  - Drinking: "No", "Social", "Regular" (NOT "Never")

### 6. Grouped Multi-Select (Accordion + Buttons)
Used for Q53 (hobbies) and Q93 (partner qualities).
```yaml
button "Category Name" [expanded] [ref=eXXX]  — accordion header
button "Item Name" [ref=eYYY]                  — selectable item inside
```
- Categories start expanded or collapsed — check `[expanded]` attribute
- Click category button to toggle expand/collapse
- Click item buttons to select — they show `[pressed]` when selected
- Counter shows in category header: `"Category Name 2"` = 2 selected
- Bottom text shows: `"3 items selected"` or `"3 / 7 selected"` (for max-limited)
- **These are buttons, NOT checkboxes** — use `browser_click` on the item ref
- Q93 (qualities) has a max of 7 selections

### 7. Range Input (Min/Max)
```yaml
spinbutton [ref=eXXX]  — Min
spinbutton [ref=eYYY]  — Max
```
- Two number inputs side by side
- Use `browser_fill_form` with type "textbox" and the spinbutton ref
- Examples: Q76 age range (25-32), Q77 height range (155-175 cm)

### 8. Timeline Input (Work Experience)
```yaml
textbox "Organisation / Hospital" [ref=eXXX]
textbox "Designation / Role" [ref=eYYY]
combobox "Start month" [ref=eZZZ]
combobox "Start year" [ref=eAAA]
checkbox "I currently work here" [ref=eBBB]
combobox "End month" [ref=eCCC]
combobox "End year" [ref=eDDD]
```
- Fill all fields using `browser_fill_form`
- Check "I currently work here" to hide end date fields
- Has "Add another role" button for multiple entries
- **Validation**: Requires org_name, designation, start date, and either is_current or end date

### 9. Dual Location Selector (Q80)
```yaml
button "No location preference" [ref=eXXX]
button "Indian States" [ref=eYYY]
button "Countries (outside India)" [ref=eZZZ]
```
- Click "No location preference" for the simplest path
- Or expand Indian States / Countries sections and select checkboxes within

### 10. File Upload
```yaml
button "Upload photo" [ref=eXXX]  — or "Upload document"
```
- Click the upload button → file chooser opens
- Use `browser_file_upload` with absolute file paths
- Accepted formats: JPEG, PNG, WebP (photos), + PDF (documents)
- **Create test files** before uploading (Python PNG generator works):
```python
import struct, zlib
def create_png(width, height, color):
    def chunk(chunk_type, data):
        c = chunk_type + data
        crc = struct.pack('>I', zlib.crc32(c) & 0xffffffff)
        return struct.pack('>I', len(data)) + c + crc
    header = b'\x89PNG\r\n\x1a\n'
    ihdr = chunk(b'IHDR', struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0))
    raw_data = b''
    for y in range(height):
        raw_data += b'\x00'
        for x in range(width):
            raw_data += bytes(color)
    idat = chunk(b'IDAT', zlib.compress(raw_data))
    iend = chunk(b'IEND', b'')
    return header + ihdr + idat + iend
```
- Q96 (profile photos) requires **minimum 2** uploads — upload 2 different files

### 11. Chat Interface (Claude AI Conversations)
```yaml
textbox "Your response" [ref=eXXX]
button "Send message" [disabled] [ref=eYYY]
```
- Send button is disabled when textarea is empty or waiting for response
- **Flow**: Fill textarea → click Send → wait for assistant response → repeat
- Exchange counter: `status "Exchange X of Y"` in the header
- After final exchange, conversation auto-completes:
  - Shows "Saving your conversation..." during extraction
  - Wait for extraction: `browser_wait_for` with `textGone: "Saving your conversation..."` (allow 15s)
  - Then "Continue to next question" button appears (or "Submit your application" for Q100)
- **Exchange counts**: Q38 = 4 max, Q75 = 6 max, Q100 = 1 only
- **Chat responses take 3-10 seconds** — the typing indicator shows while waiting
- NavigationButtons are hidden during chat questions

---

## Section-by-Section Flow

### Section A: Basic Identity (Q1-Q17)
| Q# | Type | Required | Notes |
|----|------|----------|-------|
| Q1 | text | yes | Full name |
| Q2 | radio | yes | Gender (Male/Female) |
| Q3 | text | yes | Email (auto-filled from auth) — **may be read-only** |
| Q4 | text | yes | Phone number |
| Q5 | radio | yes | Profile for self/family |
| Q6 | radio | yes | Referral source |
| Q7 | radio | yes | Date of birth — uses date input or selects |
| Q8 | autocomplete | yes | Current city — type then select from dropdown |
| Q9 | autocomplete | yes | Hometown — same pattern as Q8 |
| Q10 | radio | yes | **GATE**: Indian citizen? Must answer "yes" to proceed |
| Q11 | radio | yes | Marital status |
| Q12-Q14 | conditional | varies | Show if not "never_married" |
| Q15 | radio | yes | Willing to relocate |
| Q16 | checkbox (countries) | yes | Countries lived in |
| Q17 | text | no | Languages spoken |

### Section B: Location (Q18-Q22)
| Q# | Type | Required | Notes |
|----|------|----------|-------|
| Q18 | radio | yes | Currently living situation |
| Q19 | radio | yes | **GATE**: Are you a doctor? Must answer "yes" |
| Q20-Q22 | various | varies | Location details |

### Section C: Religion (Q23-Q31)
| Q# | Type | Required | Notes |
|----|------|----------|-------|
| Q23 | radio | yes | Religion |
| Q24 | radio | yes | **GATE**: Open to intercaste? |
| Q25-Q31 | various | varies | Caste, community details |

### Section D: Family Background (Q32-Q39)
| Q# | Type | Required | Notes |
|----|------|----------|-------|
| Q32-Q37 | various | varies | Family details |
| Q38 | **CHAT** | yes | Claude Chat 1 — 4 exchanges, family background |
| Q39 | follows chat | — | Resumes after chat |

### Section E: Physical (Q40-Q45)
| Q# | Type | Required | Notes |
|----|------|----------|-------|
| Q40 | number | yes | Height (cm) |
| Q41 | radio | yes | Body type |
| Q42 | radio | yes | Complexion |
| Q43 | illustrated_mc | yes | Exercise frequency — buttons with aria-pressed |
| Q44 | radio | yes | Diet |
| Q45 | text | no | Medical conditions |

### Section F: Lifestyle (Q46-Q52)
| Q# | Type | Required | Notes |
|----|------|----------|-------|
| Q46 | illustrated_mc | yes | Smoking — "No"/"Occasional"/"Regular" |
| Q47 | illustrated_mc | yes | Drinking — "No"/"Social"/"Regular" |
| Q48 | radio | yes | Tattoos |
| Q49 | radio | yes | Pets |
| Q50 | radio | no | Everyday attire |
| Q51 | radio | yes | Allergies |
| Q52 | conditional text | if Q51=yes | Allergy details |

### Section G: Personality & Interests (Q53-Q54)
| Q# | Type | Required | Notes |
|----|------|----------|-------|
| Q53 | grouped_multi_select | yes | Hobbies — accordion groups, min 1 selection |
| Q54 | text | yes | Regular hobbies (free text) |

### Section H: Education (Q55-Q57)
| Q# | Type | Required | Notes |
|----|------|----------|-------|
| Q55 | radio | yes | Current status (MBBS/PG/etc.) |
| Q56 | checkbox | no | Additional qualifications |
| Q57 | checkbox | no | Specialty |

### Section I: Career (Q58-Q62)
| Q# | Type | Required | Notes |
|----|------|----------|-------|
| Q58 | radio | yes | Have you worked? |
| Q59 | timeline | if Q58=yes | Work experience — fill org, role, dates |
| Q60-Q62 | various | varies | Career details |

### Section J: Goals & Values (Q63-Q75)
| Q# | Type | Required | Notes |
|----|------|----------|-------|
| Q63 | radio | yes | Marriage timeline |
| Q64 | radio | yes | Long distance |
| Q65 | radio | yes | Family arrangement |
| Q66 | radio | yes | Both partners work |
| Q67 | radio | yes | Want children |
| Q68 | conditional radio | if Q67=yes | How many children |
| Q69 | conditional radio | if Q67=yes | When to have children |
| Q70 | checkbox (countries) | yes | Settlement country |
| Q71 | radio | yes | Open to relocation |
| Q72 | radio | yes | Plans outside India |
| Q73 | conditional text | if Q72=yes | Details |
| Q74 | text | no | Additional goals |
| Q75 | **CHAT** | yes | Claude Chat 2 — 6 exchanges, goals & values |

### Section K: Partner Preferences (Q76-Q94)
| Q# | Type | Required | Notes |
|----|------|----------|-------|
| Q76 | range (spinbutton) | yes | Age range (min/max) |
| Q77 | range (spinbutton) | yes | Height range (min/max, cm) |
| Q78 | radio | yes | Specialty preference (Yes/No) |
| Q79 | conditional checkbox | if Q78=yes | Which specialties |
| Q80 | dual_location | yes | Partner location — has "No location preference" shortcut |
| Q81 | checkbox | no | Mother tongue preference |
| Q82 | checkbox | no | Body type preference |
| Q83 | radio | no | Attire preference |
| Q84 | checkbox | no | Diet preference |
| Q85 | radio | no | Fitness preference |
| Q86 | radio | no | Smoking preference |
| Q87 | radio | no | Drinking preference |
| Q88 | radio | no | Tattoo/piercing preference |
| Q89 | radio | no | Family type preference |
| Q90 | radio | no | Religious observance preference |
| Q91 | radio | yes | Career expectations |
| Q92 | checkbox | no | Acceptable career stages |
| Q93 | grouped_multi_select | yes | Qualities — max 7, accordion groups |
| Q94 | text | no | Dealbreakers |

### Section L: Documents & Verification (Q95-Q99)
| Q# | Type | Required | Notes |
|----|------|----------|-------|
| Q95 | file_upload | yes | Passport-size photo (1 file) |
| Q96 | file_upload | yes | Profile photos (**min 2**, max 6) |
| Q97 | file_upload | yes | Identity document (Aadhaar/Passport) |
| Q98 | file_upload | no | Kundali |
| Q99 | radio | yes | BGV consent — **pre-selected** to "I consent" |

### Section M: Closing (Q100)
| Q# | Type | Required | Notes |
|----|------|----------|-------|
| Q100 | **CHAT** | yes | Claude Chat 3 — 1 exchange only |

After Q100 chat completes:
- Button says **"Submit your application"** (not "Continue to next question")
- Clicking submit → POST to `/api/form/submit` → CompletionScreen renders
- CompletionScreen shows "Application submitted" with verification fee details

---

## Admin Page Testing

### Prerequisites
- Admin user exists with `role: 'admin'` in `public.users`
- At least one applicant with `membership_status: 'onboarding_complete'`

### Admin Page Structure
```yaml
heading "Completed Applications"
paragraph "X applicant(s) completed the form"
combobox "Filter by payment status"  — All / Unverified / Verification Pending / In Pool
table:
  columns: Name, Email, Specialty, Submitted, Status, BGV Consent, GooCampus, Actions
```

### Payment Toggle Actions
- **Regular applicant (unverified)**: `button "Mark Fee Paid (₹7,080)"` → confirm dialog → status changes to "Pending"
- **GooCampus member (unverified)**: `button "Verify GooCampus"` → confirm dialog → status changes to "In Pool"
- **Already processed**: Shows read-only status badge ("Verification Pending" / "In Pool")
- Confirm dialog: Use `browser_handle_dialog` with `accept: true`
- After action: page refreshes automatically via `router.refresh()`

---

## Known Quirks & Gotchas

1. **Screenshot timeout**: `browser_take_screenshot` with `fullPage: true` and PNG format may timeout waiting for fonts. Use `jpeg` format without `fullPage` as fallback.

2. **OTP rate limiting**: Supabase limits OTP requests to 1 per ~30 seconds. If you get "For security purposes, you can only request this after Xs", wait and retry.

3. **Autocomplete cities**: The placeholder is `"Start typing your city name"`, NOT `"e.g. Bengaluru"`. Use the textbox ref directly.

4. **Illustrated MC labels**: Don't assume label text — take a snapshot first. Exercise options are "Regular (4+ times/week)" not "Regularly exercises". Smoking is "No" not "Never".

5. **Grouped multi-select items are buttons**: NOT checkboxes. Click the button ref. They show `[pressed]` when selected.

6. **BGV consent pre-selected**: Q99 radio "I consent..." is checked by default. Just click Next.

7. **Chat extraction takes 5-15 seconds**: After the final exchange in a chat, wait for "Saving your conversation..." to disappear before clicking "Continue".

8. **Q100 submit button label**: Shows "Submit your application" instead of "Continue to next question".

9. **CompletionScreen on re-entry**: If user has `membership_status: 'onboarding_complete'`, navigating to `/app/onboarding` shows the CompletionScreen directly.

10. **Middleware role routing**: Applicants accessing `/admin` get redirected to `/app/onboarding`. Admins accessing `/app/*` may redirect differently.

11. **env vars for Node scripts**: Use `export $(grep -v '^#' .env.local | xargs)` to load env vars — `source .env.local` doesn't work reliably with Node.

12. **Test file creation**: Use the Python PNG generator (no external deps) to create valid image files for upload testing. Create separate files for each upload (same file can be reused for different upload fields but Q96 needs 2+ unique files).

13. **Console errors**: Check with `browser_console_messages` level "error" at the end. The full flow should produce 0 errors.

---

## Optimal Test Execution Order

1. **Setup**: Create test users, reset progress if needed
2. **Auth**: Login via OTP (generate OTP via admin API)
3. **Sections A-C** (Q1-Q31): Straightforward radio/text/checkbox
4. **Section D** (Q32-Q38): Family + **Claude Chat 1** (4 exchanges)
5. **Sections E-F** (Q39-Q52): Illustrated MC pattern for exercise/smoking/drinking
6. **Section G** (Q53-Q54): **Grouped multi-select** (accordion + button clicks)
7. **Sections H-I** (Q55-Q62): Education + **Timeline input** for work experience
8. **Section J** (Q63-Q75): Goals + **Claude Chat 2** (6 exchanges — longest)
9. **Section K** (Q76-Q94): Partner prefs — range inputs, dual location, quality tags
10. **Section L** (Q95-Q99): **File uploads** (create test PNGs first) + BGV consent
11. **Section M** (Q100): **Claude Chat 3** (1 exchange) → **Submit**
12. **Verify**: CompletionScreen renders, check console for errors
13. **Admin**: Login as admin → verify applicant list → test payment toggle
