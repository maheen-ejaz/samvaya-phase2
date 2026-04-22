# Samvaya Phase 2 — Toolchain Setup

> This file is referenced by CLAUDE.md. Read it once at the start of every session.
> It defines the CLIs, MCPs, and agent skills available in this project.
> If any CLI or MCP listed here is not yet installed, install it before proceeding with any task.

---

## Philosophy

- **Prefer CLI over MCP** where both exist. CLIs are faster, use fewer context tokens, and have no auth overhead.
- **Keep MCPs minimal.** Each MCP's tool descriptions consume context window tokens. Only the MCPs listed below are approved for this project.
- **Skills inform behaviour.** The agent skills listed below encode best practices from Supabase and Vercel Engineering. They are auto-applied when writing code in their respective domains.

---

## 1. CLIs — Install and Verify on First Session

### Supabase CLI
Used for: writing and running migrations, generating TypeScript types, managing RLS policies, linking dev and prod projects.

```bash
# Install (macOS — npm global install is NOT supported)
brew install supabase/tap/supabase

# Login
supabase login

# Link to dev project (run from project root)
supabase link --project-ref YOUR_DEV_PROJECT_REF

# Verify
supabase --version
```

**Daily usage:** `supabase db push`, `supabase gen types typescript --local > types/supabase.ts`

---

### GitHub CLI
Used for: creating commits, opening PRs, checking CI/CD and Vercel deployment status — all without leaving the terminal. Also provides the git workflow commands (`gh pr create`, `gh repo view`) that replace any need for separate commit/push plugins.

```bash
# Install (macOS)
brew install gh

# Login
gh auth login

# Verify
gh --version
```

**Daily usage:** `gh pr create`, `gh run list`, `gh repo view`, `git commit`, `git push`

---

### Vercel CLI
Used for: pulling environment variables into `.env.local`, checking deployment logs, linking the project.

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

**Daily usage:** `vercel env pull`, `vercel logs`, `vercel deploy`

---

## 2. MCP Servers — Install Where No CLI Equivalent Exists

> Only install MCPs listed here. Do not add others without updating this file.
> Each MCP consumes context window tokens. Keep the list short.

### Context7 MCP — Installed
**Status:** Installed (user-scoped)
**Purpose:** Fetches live, version-specific documentation for any library directly into the prompt. Prevents hallucinated APIs and outdated patterns for Next.js, Supabase, Tailwind, Resend, and Sharp.

**Pre-requisite:** Get a free API key at https://context7.com/dashboard

```bash
# Install (user-scoped so it persists across sessions)
claude mcp add --scope user context7 -- npx -y @upstash/context7-mcp --api-key YOUR_API_KEY
```

**How to use:** Append `use context7` to any prompt involving a library:
```
Implement email OTP authentication with Supabase Auth. use context7
Set up Sharp for server-side image blurring. use context7
```

---

### Playwright MCP — Not Yet Installed *(Install Before Day 16)*
**Status:** Not yet needed
**Purpose:** Lets Claude Code control a real Chrome browser for end-to-end testing. Used on Day 16 to run through all 100 form questions as a test applicant automatically.

**Pre-requisite:** Node.js 18+ required. Run `node --version` to confirm.

```bash
# Install (project-scoped — runs from this project only)
claude mcp add --scope project playwright npx @playwright/mcp@latest

# Install browser binaries if not already installed
npx playwright install chromium
```

---

### Airtable MCP — Not Yet Installed *(Install When Build Tracking Begins)*
**Status:** Not yet needed
**Purpose:** Lets Claude Code mark tasks as complete directly in Airtable after finishing each day's work.

**Pre-requisite:** Create a Personal Access Token at https://airtable.com/create/tokens with `data.records:read` and `data.records:write` scopes.

```bash
claude mcp add airtable \
  -e AIRTABLE_API_KEY=your-personal-access-token \
  -- npx -y @domdomegg/airtable-mcp-server
```

---

## 3. Agent Skills — Installed

Agent skills are installed via the `npx skills` CLI tool. They live in `.agents/skills/` and are symlinked into `.claude/skills/` for Claude Code to pick up automatically. Skills are auto-applied when writing code in their respective domains — no explicit instruction needed.

### Installed skills:

```bash
# Supabase: PostgreSQL and RLS best practices (1 skill)
npx skills add supabase/agent-skills -y

# Vercel: React and web design best practices (2 skills)
npx skills add vercel-labs/agent-skills --skill vercel-react-best-practices -y
npx skills add vercel-labs/agent-skills --skill web-design-guidelines -y

# Next.js: App Router, caching, and upgrade patterns (3 skills)
npx skills add vercel-labs/next-skills -y
```

### What each skill enforces:

| Skill | Source | Enforces |
|---|---|---|
| `supabase-postgres-best-practices` | supabase/agent-skills | RLS on every table, proper indexing, migration hygiene, query performance |
| `vercel-react-best-practices` | vercel-labs/agent-skills | Component composition, hook usage, avoiding unnecessary re-renders |
| `web-design-guidelines` | vercel-labs/agent-skills | Accessibility, responsive design, Tailwind usage patterns |
| `next-best-practices` | vercel-labs/next-skills | App Router patterns, Server Components by default, correct `use client`, data fetching |
| `next-cache-components` | vercel-labs/next-skills | Caching strategies, ISR, revalidation patterns |
| `next-upgrade` | vercel-labs/next-skills | Migration patterns between Next.js versions |

---

## 4. Verification Checklist

Run this in the terminal at the start of each session:

```bash
supabase --version      # Should return a version number
gh --version            # Should return a version number
vercel --version        # Should return a version number
claude mcp list         # Should show: context7
ls .claude/skills/      # Should list 6 skill directories
```

If anything is missing, install it before proceeding.

---

## 5. Token Budget Note

Context7, Playwright, and Airtable are the only approved MCPs. Do not enable additional MCPs mid-session without disabling one first. If context feels tight during a long session, disable the Playwright MCP — it is only needed on Day 16.
