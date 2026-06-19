# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev             # Start dev server (http://localhost:3000)
npm run build           # Production build
npm run lint            # ESLint check
npm run generate-icons  # Regenerate PWA icons from public/paw.svg (uses sharp)
```

No test suite is configured yet (Phase 1+).

## Architecture

**Stack:** Next.js 16 (App Router, TypeScript) + Supabase (Postgres, Auth, Storage) + Tailwind CSS 4, deployed on Vercel.

**Security boundary is the database, not API code.** Supabase PostgREST auto-generates CRUD endpoints; access control is enforced by PostgreSQL Row-Level Security (RLS) policies. Every new household-scoped table must have a corresponding RLS policy in the same migration — missing one fails open (any user can read the table with the anon key).

**Key architectural layers:**
- `app/` — Next.js App Router pages, server actions, and route handlers
- `components/` — React UI components; shadcn/ui components go in `components/ui/`
- `lib/` — Framework-free business logic; `lib/units.ts` (lbs ↔ kg), `lib/utils.ts` (`cn()` helper)
- `supabase/migrations/` — SQL DDL + RLS policies (applied via Supabase CLI)
- `supabase/functions/` — Deno edge functions (cron jobs, webhooks)
- `scripts/` — Node.js dev scripts (excluded from ESLint; use CommonJS `require`)

**Supabase client usage:**
- Browser code: anon key (public, RLS applies automatically via user JWT)
- Server actions / Route Handlers: service-role key (bypasses RLS — keep server-side only, never expose to browser)

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
Components land in `components/ui/`. Use the `cn()` helper from `lib/utils.ts` for conditional class merging. Dark/light mode is handled by `next-themes` via `components/theme-provider.tsx` — theme toggle component to be added in Phase 1.

## PWA Icons

Icon source is `public/paw.svg`. After editing the SVG, run `npm run generate-icons` to regenerate the three PNG sizes (`public/icons/`). The maskable icon gets a blue-100 background with the paw at 72% scale to satisfy the W3C safe-zone requirement.

## Project Status

Phase 0 PWA config is complete (manifest, service worker, icons, shadcn/ui, dark mode). Still to do: Supabase project + `lib/supabase/` clients + Vercel deploy. Phase 1 (MVP: auth, households, dogs, weights, vaccines, dashboard) is next. See `docs/ROADMAP.md`.
