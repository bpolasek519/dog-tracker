# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Production build
npm run lint     # ESLint check
```

No test suite is configured yet (Phase 1+).

## Architecture

**Stack:** Next.js 16 (App Router, TypeScript) + Supabase (Postgres, Auth, Storage) + Tailwind CSS 4, deployed on Vercel.

**Security boundary is the database, not API code.** Supabase PostgREST auto-generates CRUD endpoints; access control is enforced by PostgreSQL Row-Level Security (RLS) policies. Every new household-scoped table must have a corresponding RLS policy in the same migration — missing one fails open (any user can read the table with the anon key).

**Key architectural layers:**
- `app/` — Next.js App Router pages, server actions, and route handlers
- `components/` — React UI components (currently empty, Phase 1+)
- `lib/` — Framework-free business logic; `lib/units.ts` has weight conversion utilities (lbs ↔ kg)
- `supabase/migrations/` — SQL DDL + RLS policies (applied via Supabase CLI)
- `supabase/functions/` — Deno edge functions (cron jobs, webhooks)

**Supabase client usage:**
- Browser code: anon key (public, RLS applies automatically via user JWT)
- Server actions / Route Handlers: service-role key (bypasses RLS — keep server-side only, never expose to browser)

## Data & Units

Weights are stored in **kilograms** (for correct mg/kg medication math) but displayed in **pounds** in the UI. `lib/units.ts` provides `lbsToKg()`, `kgToLbs()`, and `roundTo()`.

The full database schema (entities, columns, RLS policies) is in `docs/DATA_MODEL.md`.

## Design Decisions

Key decisions are recorded in `docs/DECISIONS.md`. Read this before proposing architectural changes — most trade-offs (PWA vs native, household model, email-only reminders, mono-repo, lbs/kg split) have been deliberately resolved.

## Project Status

Currently completing Phase 0 (PWA config + Supabase wiring + Vercel deploy). Phase 1 (MVP: auth, households, dogs, weights, vaccines, dashboard) is next. See `docs/ROADMAP.md`.
