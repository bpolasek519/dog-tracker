# Dog Tracker — Design Decisions

Captured from the planning interview on **2026-06-19**. Each entry: the decision, the
options considered, and why. These are the "why" behind the PRD/data model — revisit them if
requirements change.

## D1 — Platform: mobile web app / PWA, cloud data
**Decision:** Build one responsive Next.js web app, installable as a PWA; data lives in the
cloud and syncs across devices.
**Considered:** native phone app; local-only single-device app.
**Why:** Makes the "use it from my phone" goal essentially free (Add to Home Screen → app-like
icon) with no app-store friction and no separate codebase. Cloud data is required anyway for
household sharing. Native and local-only were rejected as more work / no sync, respectively.
**Trade-off accepted:** web push on iOS is limited (deferred to v2); app mostly needs internet.

## D2 — Users: shared household, individual logins
**Decision:** Data belongs to a household; multiple family members join and each has their own
account.
**Considered:** just me on multiple devices; me + vet/outsiders with roles.
**Why:** Family will log data for the same dogs. Individual identity is needed so we can record
*who* performed an action. Outsider/role-based access was rejected as overkill for now.

## D3 — Extra scope: vet visits + documents/photos in; general non-vaccine reminders and
feeding/activity out
**Decision:** Beyond the core, include vet visits/notes and document/photo attachments.
**Why:** High value, natural history home; documents let you keep certificates/lab results.
General recurring reminders and feeding/activity logging were not selected (can revisit).
**Consequence:** Documents require file storage (Supabase Storage) — added to the stack.

## D4 — Reminders: in-app dashboard + daily email (push deferred)
**Decision:** Reminders surface via an in-app "Due soon" dashboard and a daily email.
**Considered:** phone push; calendar feed.
**Why:** Email is reliable on every device with the app closed and easy to send to the whole
household; the dashboard needs zero notification infrastructure. Push has iOS caveats and more
infra — deferred to v2. Calendar feed is clever but has awkward per-person setup.
**Consequence:** Phase 2 needs a daily scheduled job + an email provider.

## D5 — Medications: record + per-dose logging + auto-dose-from-weight
**Decision:** Full medication model: track meds/history, log each individual dose (who/when),
and optionally auto-calculate dose from the dog's weight via a mg/kg rule.
**Why:** Per-dose logging prevents double-dosing in a shared household; auto-dose removes mental
math for weight-based meds.
**Trade-off accepted:** Per-dose logging is higher-frequency; auto-dose involves medical math, so
it ships with guardrails and disclaimers (see DATA_MODEL.md). User owns formula accuracy.

## D6 — Vaccines: built-in presets + auto next-due, overridable
**Decision:** Ship a preset catalog of common dog vaccines with typical intervals; logging a
date auto-suggests the next-due date, always editable; custom vaccines allowed.
**Considered:** fully manual; manual-now-presets-later.
**Why:** Faster logging and fewer date-math errors, while staying flexible. Cost is maintaining a
small preset list.

## D7 — Household join: invite link/email, own login
**Decision:** Owner invites family by link/email; each person creates their own account.
**Considered:** shared single login with a "who" dropdown; single-user now, sharing later.
**Why:** A shared login would break the "who gave the dose" requirement (D5) and weaken security.
Individual accounts give real attribution and easy add/remove.

## D8 — Stack: Next.js + Supabase on Vercel
**Decision:** Next.js (PWA) on Vercel; Supabase for Postgres, auth (email + Google), file
storage, and cron; row-level security per household.
**Considered:** Firebase (NoSQL); "you choose."
**Why:** Maps 1:1 to our needs (accounts, household sharing via RLS, file storage, daily email
job) with the least custom plumbing. Our data is relational (dogs↔meds↔doses), which fits
Postgres better than Firestore. All free tiers cover personal-use volume.

## D9 — Weight units: pounds shown, kilograms stored
**Decision:** Enter/display pounds; store kilograms canonically; convert for display.
**Why:** Pounds are familiar to the user; kilograms keep weight-based dose math (mg/kg) correct.
A per-user unit toggle was considered but deemed unnecessary complexity for now.

## D10 — Phasing: usable MVP first
**Decision:** Phase 1 = auth/household + dogs + weights + vaccines + Due-soon dashboard;
Phase 2 = meds (per-dose + auto-dose) + email reminders; Phase 3 = vet visits + documents.
**Considered:** meds in Phase 1; build everything then launch.
**Why:** Get the vaccine/weight tracking you most want into real use within weeks, and learn
before building the heavier meds/records features. "Build it all first" was rejected as slow and
risky for a first project.

## D11 — Repo: single full-stack Next.js app, no Turborepo (yet)
**Decision:** One repository with a single full-stack Next.js app; Supabase config (migrations +
edge functions) colocated under `supabase/`. No monorepo tooling.
**Considered:** Turborepo monorepo; separate frontend/backend repos.
**Why:** With Next.js + Supabase there is effectively one deployable app, not a frontend and a
separate backend (Supabase is the backend; custom server logic lives inside Next.js). Shared
types come from Supabase's generated DB types, so there's no shared-package problem for a monorepo
to solve. Turborepo earns its place only with ≥2 deployable apps sharing code.
**Trigger to revisit:** if the deferred native (Expo) app is built — then split into
`apps/web`, `apps/mobile`, `packages/shared` and introduce Turborepo. To make that cheap,
keep pure business logic (unit conversion, mg/kg dose calc, vaccine-interval math) as
framework-free functions in `lib/` now. See [ARCHITECTURE.md](ARCHITECTURE.md).
