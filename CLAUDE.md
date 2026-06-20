# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev             # Start dev server (http://localhost:3000)
npm run build           # Production build
npm run lint            # ESLint check
npm run generate-icons  # Regenerate PWA icons from public/paw.svg (uses sharp)
```

No test suite is configured yet (Phase 2+).

## Architecture

**Stack:** Next.js 16 (App Router, TypeScript) + Supabase (Postgres, Auth, Storage) + Tailwind CSS 4, deployed on Vercel.

**Security boundary is the database, not API code.** Supabase PostgREST auto-generates CRUD endpoints; access control is enforced by PostgreSQL Row-Level Security (RLS) policies. Every new household-scoped table must have a corresponding RLS policy in the same migration — missing one fails open (any user can read the table with the anon key).

**Key architectural layers:**
- `app/` — Next.js App Router pages, server actions, and route handlers
- `app/actions/` — Server Actions for dogs, weights, vaccines, and household/invite operations
- `components/` — React UI components; shadcn/ui components go in `components/ui/`
- `components/app-shell.tsx` — App chrome: header + bottom tab nav (Dashboard / Dogs / Household)
- `lib/` — Framework-free business logic; `lib/units.ts` (lbs ↔ kg), `lib/utils.ts` (`cn()` helper), `lib/vaccines.ts` (due-date logic)
- `lib/db/` — Typed Supabase query helpers (dogs, weights, vaccines); keeps DB calls out of page files
- `supabase/migrations/` — SQL DDL + RLS policies (applied via Supabase CLI)
- `supabase/functions/` — Deno edge functions (cron jobs, webhooks)
- `scripts/` — Node.js dev scripts (excluded from ESLint; use CommonJS `require`)

**Supabase client usage:**
- Browser / Client Components: `createClient()` from `lib/supabase/client.ts` — uses `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- Server Components / Server Actions / Route Handlers: `createClient()` from `lib/supabase/server.ts` — session-aware via cookies, RLS still applies
- Admin/service client: `lib/supabase/admin.ts` uses `SUPABASE_SECRET_KEY` to bypass RLS — currently used by the `acceptInvite` server action (must write `household_members` before the invitee has a session). Never import this from a Client Component

**API keys:** Using Supabase's new non-JWT key format (`sb_publishable_...` / `sb_secret_...`). The legacy `anon` and `service_role` JWT keys are not used. Exception: Supabase Edge Functions (Phase 2 cron) only support JWT verification — when we add those, we'll need the legacy `service_role` key as an additional env var.

**Route protection:** `proxy.ts` (Next.js 16 convention — previously `middleware.ts`) refreshes the session cookie on every request and redirects unauthenticated users to `/login`.

## Data & Units

Weights are stored in **kilograms** (for correct mg/kg medication math) but displayed in **pounds** in the UI. `lib/units.ts` provides `lbsToKg()`, `kgToLbs()`, and `roundTo()`.

The full database schema (entities, columns, RLS policies) is in `docs/DATA_MODEL.md`.

## Design Decisions

Key decisions are recorded in `docs/DECISIONS.md`. Read this before proposing architectural changes — most trade-offs (PWA vs native, household model, email-only reminders, mono-repo, lbs/kg split) have been deliberately resolved.

## UI Components

shadcn/ui is configured (`components.json`). Add components with:
```bash
npx shadcn@latest add <component>   # e.g. button, card, dialog
```
Components land in `components/ui/`. Use the `cn()` helper from `lib/utils.ts` for conditional class merging. Dark/light mode is handled by `next-themes` via `components/theme-provider.tsx`.

## PWA Icons

Icon source is `public/paw.svg`. After editing the SVG, run `npm run generate-icons` to regenerate the three PNG sizes (`public/icons/`). The maskable icon gets a blue-100 background with the paw at 72% scale to satisfy the W3C safe-zone requirement.

## Project Status

**Phase 1 is complete.** All Phase 1 tables deployed with RLS (`households`, `household_members`, `invites`, `dogs`, `weights`, `vaccine_types`, `vaccinations`). Full UI is live: dog CRUD, weight logging + Recharts trend chart, vaccination logging with auto next-due, household invite flow (generate link / accept / revoke), onboarding, and a color-coded "Due soon" dashboard. Phase 2 (medications, per-dose logging, auto-dose from weight, daily email reminders via Edge Function + Resend) is next. See `docs/ROADMAP.md`.
