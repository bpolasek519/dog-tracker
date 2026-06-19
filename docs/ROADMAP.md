# Dog Tracker — Roadmap

Phased delivery so the app is usable early. Each phase ends with something you can actually
use day-to-day.

## Phase 0 — Foundation
- [x] Scaffold Next.js app (Next.js 16, App Router, TypeScript, Tailwind, ESLint, Turbopack);
      builds clean. _(2026-06-19)_
- [x] Project structure: `app/`, `components/`, `lib/`, `supabase/{migrations,functions}/`;
      seed framework-free `lib/units.ts` (lbs↔kg); git initialized with initial commit. _(2026-06-19)_
- [ ] Configure as an installable **PWA** (manifest + service worker + icons).
- [ ] Create Supabase project; wire up env vars locally and on Vercel.
- [ ] Scaffold `lib/supabase/` clients (browser + server).
- [ ] Deploy a hello-world to Vercel; confirm "Add to Home Screen" works on your phone.
- [ ] Set up the `profiles` mirror + base auth (email + Google).

## Phase 1 — Usable MVP (vaccines + weights)
**Goal: log dogs, weights, and vaccines; see what's due.**
- [ ] Households: create household; `household_members`; owner role.
- [ ] Invites: generate invite link/email; accept flow → join household.
- [ ] RLS policies for all Phase 1 tables (verify a second account can't see your dogs).
- [ ] Dog profiles: create/edit/list; photo upload optional.
- [ ] Weights: add weight (lbs in, kg stored), list, **trend chart**, latest-on-profile.
- [ ] Vaccine presets seed data + custom types.
- [ ] Vaccinations: log given date → **auto-suggest next-due** (overridable).
- [ ] **"Due soon" dashboard:** overdue / due-soon / upcoming, color-coded.
- [ ] Ship + use it.

## Phase 2 — Medications + email reminders
**Goal: manage meds and stop missing things even when the app is closed.**
- [ ] Medications: record meds (name, dose, frequency, start/end, active).
- [ ] **Per-dose logging:** "given today?" view, who/when, prevent double-dosing.
- [ ] **Auto-dose from weight:** mg/kg rule → computed dose, with the safety guardrails in
      [DATA_MODEL.md](DATA_MODEL.md#medical-safety-auto-dose).
- [ ] `reminder_settings` (lead time, email on/off).
- [ ] Email provider (e.g. Resend) integration.
- [ ] **Daily cron** (Supabase pg_cron / scheduled Edge Function) → email due items.

## Phase 3 — Records
**Goal: full history and documents.**
- [ ] Vet visits: date, vet, reason, notes, cost; link vaccines given at a visit.
- [ ] Documents/photos: upload to Supabase Storage, attach to dog or visit, access-scoped.

## Later / v2 candidates
- Phone **push notifications** (web push; iOS needs installed PWA, 16.4+).
- Calendar feed (subscribe due dates in Apple/Google Calendar).
- Feeding/diet/activity logging.
- Vet/outside-party limited-access accounts (roles & permissions).
