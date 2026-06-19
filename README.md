# Dog Tracker

A private web app for tracking your dogs' health: weights, vaccines (with reminders),
medications and dosing, vet visits, and records. Built as a mobile-friendly PWA so it
works from your phone's home screen without a separate "app."

Status: **Phase 0 in progress — app scaffolded.** Next.js 16 (App Router, TypeScript,
Tailwind) is set up and builds clean; design docs are complete. Still to do in Phase 0:
PWA config, Supabase project + client wiring, and a first Vercel deploy. See
[`docs/ROADMAP.md`](docs/ROADMAP.md).

## What it does (agreed scope)

- **Households & accounts** — you create a household; family members join by invite and
  each has their own login, so the app always knows *who* did what.
- **Dog profiles** — one record per dog (name, breed, sex, birthdate, photo, notes).
- **Weights** — log weights over time with a trend chart. You enter/see **pounds**; the
  app stores **kilograms** internally so dose math is correct.
- **Vaccines** — pick from built-in presets (rabies, DHPP, bordetella, lepto, …); the app
  auto-suggests the next-due date, which you can override. Custom vaccines allowed.
- **Medications** — record what each dog is on, log **each individual dose** ("who gave it,
  when") to prevent double-dosing, and optionally **auto-calculate dose from weight** using
  a mg/kg rule you enter.
- **Vet visits** — date, vet, reason, notes, cost.
- **Documents/photos** — attach certificates, lab results, etc. to a dog or visit.
- **Reminders** — an in-app **"Due soon"** dashboard plus a **daily email**. (Phone push
  notifications are a possible v2 add-on.)

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | Next.js (React), built as an installable **PWA** |
| Hosting | Vercel (free tier) |
| Database | Supabase **Postgres** |
| Auth | Supabase Auth (email + Google), with household invites |
| File storage | Supabase Storage (documents/photos) |
| Scheduled email | Supabase cron (pg_cron / Edge Function) + email provider (e.g. Resend) |
| Access control | Postgres **row-level security**, scoped per household |

## Docs

- [`docs/PRD.md`](docs/PRD.md) — product requirements: vision, users, features, reminders.
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — how the app/API works (esp. for a React+FastAPI background): auto-API vs server actions vs edge functions, and why RLS is the security boundary.
- [`docs/DATA_MODEL.md`](docs/DATA_MODEL.md) — entities, schema sketch, units, RLS, safety.
- [`docs/ROADMAP.md`](docs/ROADMAP.md) — the three build phases and concrete tasks.
- [`docs/DECISIONS.md`](docs/DECISIONS.md) — every design decision + the rationale behind it.

## Local development

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

## Next step

Finish **Phase 0** (see the roadmap): add the PWA manifest/service worker, create the
Supabase project and wire up `lib/supabase/` clients, then deploy a hello-world to Vercel
and confirm "Add to Home Screen" works on your phone. Then on to **Phase 1**
(auth + household + invites → dogs, weights, vaccines, Due-soon dashboard).
