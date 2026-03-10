# Samvaya Phase 2 — Toolchain Setup

> This file is referenced by CLAUDE.md. Read it once at the start of every session.
> It defines the CLIs, MCPs, official plugins, and skills available in this project.
> If any CLI or MCP listed here is not yet installed, install it before proceeding with any task.

---

## Philosophy

- **Prefer CLI over MCP** where both exist. CLIs are faster, use fewer context tokens, and have no auth overhead.
- **Keep MCPs minimal.** Each MCP's tool descriptions consume context window tokens. Only the MCPs listed below are approved for this project.
- **Skills inform behaviour.** The official skills listed below encode best practices from Supabase, Vercel, and the Next.js team. Apply them automatically when writing code in their respective domains.

---

## 1. CLIs — Install and Verify on First Session

### Supabase CLI
Used for: writing and running migrations, generating TypeScript types, managing RLS policies, linking dev and prod projects.
```bash
# Install
npm install -g supabase

# Login
supabase login

# Link dev project (run from project root)
supabase link --project-ref YOUR_DEV_PROJECT_REF

# Verify
supabase --version
```
**Daily usage:** `supabase db push`, `supabase gen types typescript --local > types/supabase.ts`

---

### GitHub CLI
Used for: creating commits, opening PRs, checking CI/CD status, managing issues — all without leaving the terminal.
```bash
# Install (if not already present)
# macOS:
brew install gh
# Windows:
winget install --id GitHub.cli

# Login
gh auth login

# Verify
gh --version
```
**Daily usage:** `gh pr create`, `gh run list`, `gh issue list`

---

### Vercel CLI
Used for: pulling environment variables into `.env.local`, checking deployment status, tailing build logs.
```bash
# Install
npm install -g vercel

# Login
vercel login

# Link to project (run from project root once)
vercel link

# Pull env vars from Vercel into local .env.local
vercel env pull .env.local

# Verify
vercel --version
```
**Daily usage:** `vercel env pull`, `vercel logs`, `vercel deploy --prebuilt`

---

## 2. MCPs — Install Where No CLI Equivalent Exists

> Only install MCPs listed here. Do not add others without updating this file.

### Context7 MCP *(Tier 1 — Install Before Day 1)*
**Purpose:** Fetches live, version-specific documentation for any library directly into the prompt. Prevents hallucinated APIs and outdated patterns for Next.js 14, Supabase, Tailwind, Resend, and Sharp.

```bash
claude mcp add context7 -- npx -y @upstash/context7-mcp@latest
```

**How to use:** Append `use context7` to any prompt that involves a library. Example:
```
Implement email OTP authentication with Supabase Auth. use context7
```
Or target a specific library:
```
Set up Sharp server-side image blurring. use library /lovell/sharp for API and docs.
```

---

### Playwright MCP *(Tier 2 — Install Before Day 16)*
**Purpose:** Lets Claude Code control a real Chrome browser for end-to-end testing. Used on Day 16 to run through the full 100-question form as a test applicant without manual input.

```bash
claude mcp add playwright -s local npx '@playwright/mcp@latest'
```

**How to use:** Ask Claude Code to "fill out the form as a test applicant using Playwright, starting at the login screen, and report any errors encountered."

---

### Airtable MCP *(Tier 2 — Install When Build Tracking Begins)*
**Purpose:** Lets Claude Code mark tasks as complete directly in Airtable after finishing each day's work. Keeps the build checklist in sync without manual updates.

```bash
claude mcp add airtable \
  -e AIRTABLE_API_KEY=your-personal-access-token \
  -- npx -y @domdomegg/airtable-mcp-server
```

**How to use:** After completing a task, ask Claude Code to "mark [task name] as Done in the Airtable build tracker."

---

## 3. Official Claude Code Plugins — Install on First Session

These are official plugins from Anthropic's marketplace. They bundle commands, agents, and MCP configs for common workflows.

```bash
# Inside Claude Code, run:
/plugin install vercel
/plugin install supabase
/plugin install commit-commands
```

- **vercel** — Deploys, checks build logs, manages environment variables via plugin commands
- **supabase** — Schema management, migration workflows, RLS audit commands
- **commit-commands** — Standardised `/commit`, `/push`, `/pr` slash commands for consistent Git workflow

---

## 4. Official Agent Skills — Apply Automatically

These are official skill files from Supabase and Vercel Labs. They define best practices that Claude Code should follow automatically when writing code in their domains — no explicit instruction needed.

### Install commands (run once from project root):

```bash
# Create the skills directory
mkdir -p .claude/skills

# Supabase official: PostgreSQL and RLS best practices
curl -o .claude/skills/supabase-postgres-best-practices.md \
  https://raw.githubusercontent.com/supabase/agent-skills/main/postgres-best-practices.md

# Vercel Labs official: Next.js best practices
curl -o .claude/skills/next-best-practices.md \
  https://raw.githubusercontent.com/vercel-labs/agent-skills/main/next-best-practices.md

# Vercel Labs official: React best practices
curl -o .claude/skills/react-best-practices.md \
  https://raw.githubusercontent.com/vercel-labs/agent-skills/main/react-best-practices.md

# Vercel Labs official: Web design guidelines
curl -o .claude/skills/web-design-guidelines.md \
  https://raw.githubusercontent.com/vercel-labs/agent-skills/main/web-design-guidelines.md
```

### What each skill enforces:

| Skill | Enforces |
|---|---|
| `supabase-postgres-best-practices` | RLS on every table, proper indexing, no raw SQL in client code, migration hygiene |
| `next-best-practices` | App Router patterns, Server Components by default, correct use of `use client`, data fetching patterns |
| `react-best-practices` | Component composition, avoiding unnecessary re-renders, proper hook usage |
| `web-design-guidelines` | Accessibility, responsive design, Tailwind usage patterns |

---

## 5. Token Budget Warning

> Running all MCPs simultaneously is expensive. Each MCP's tool list consumes context tokens.
> The approved MCPs for this project (Context7 + Playwright + Airtable) are lightweight.
> Never add additional MCPs mid-session without checking context usage first.
> If context feels tight, disable Playwright MCP — it's only needed on Day 16.

---

## 6. Verification Checklist

Run this at the start of Day 1 to confirm everything is ready:

```bash
supabase --version       # Should return a version number
gh --version             # Should return a version number
vercel --version         # Should return a version number
claude mcp list          # Should show context7 (and playwright/airtable if installed)
ls .claude/skills/       # Should list the four skill .md files
```

If anything is missing, install it before proceeding to Day 1 tasks.
