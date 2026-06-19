# Dog Tracker — Product Requirements

_Last updated: 2026-06-19. Source: planning interview (see [DECISIONS.md](DECISIONS.md))._

## 1. Vision

A simple, private app the household uses to stay on top of each dog's health — never miss
a vaccine, always know the current weight and what meds a dog is on, and avoid
double-dosing. Usable primarily from a phone (installed PWA) but also any browser.

## 2. Users & access

- **Household model.** Data is owned by a *household*. Each dog belongs to one household.
- **Members.** Multiple people (e.g. you + partner/family) belong to a household. The
  creator is the **owner**; others are **members**. (Roles can stay minimal for now —
  owner can manage membership; everyone can read/log data.)
- **Joining.** The owner invites people by link/email. Each person creates their own login
  (email+password or Google). Individual identity is required so the app can record *who*
  logged each dose/weight/visit.
- **Privacy.** A household only ever sees its own dogs and records (enforced in the database
  via row-level security, not just the UI).

## 3. Features

### 3.1 Dog profiles
Name, breed, sex (incl. neutered/spayed), birthdate (→ age), optional photo, microchip #,
free-text notes. Multiple dogs per household.

### 3.2 Weights
- Log a weight with a date and optional note; records who entered it.
- **Units:** entered/displayed in **pounds**, stored canonically in **kilograms**.
- Show a **trend chart** over time and the latest weight on the dog's profile.
- Latest weight feeds the medication dose calculator.

### 3.3 Vaccines (a reminder source)
- **Presets:** built-in common dog vaccines with typical intervals (e.g. rabies 1yr/3yr,
  DHPP, bordetella, leptospirosis, Lyme, canine influenza). Households can add custom types.
- Logging a vaccination (vaccine + date given) **auto-suggests the next-due date** from the
  interval; the user can always override it.
- Next-due dates feed the Due-soon dashboard and email reminders.

### 3.4 Medications & dosing
- **Record meds:** name, dose amount + unit, frequency/schedule, start date, end date
  (nullable = ongoing), active flag, notes.
- **Per-dose logging:** mark each administration with timestamp + which member gave it, so
  a shared household can see "already given today?" and avoid double-dosing.
- **Auto-dose from weight (optional per med):** if a mg/kg rule is entered, the app computes
  the dose from the dog's latest weight and shows it. **Safety:** see
  [DATA_MODEL.md §Medical safety](DATA_MODEL.md#medical-safety-auto-dose). The app never
  administers anything; it only displays a calculated suggestion with its inputs, and is not
  a substitute for veterinary advice.

### 3.5 Vet visits _(Phase 3)_
Date, vet name, reason, notes, cost. A natural home for visit history; vaccines given at a
visit can link back to it.

### 3.6 Documents & photos _(Phase 3)_
Attach files (PDF/image) — vaccine certificates, lab results — to a dog or a vet visit.
Stored in Supabase Storage, access-controlled to the household.

## 4. Reminders

- **In-app "Due soon" dashboard (Phase 1):** the home screen lists what's due/overdue,
  color-coded (overdue, due soon, upcoming). Computed from vaccine next-due dates (and later
  medication refill/next-dose). No notification infrastructure required.
- **Daily email (Phase 2):** a scheduled job runs once a day, finds items due within a
  configurable lead time (default 7 days), and emails the household. Requires an email
  provider (e.g. Resend free tier).
- **Phone push (v2/future):** web push to installed PWAs. iOS requires the PWA be added to
  the Home Screen (iOS 16.4+). Deferred.

## 5. Non-goals (for now)

- Feeding/diet/activity logging (high-frequency, deferred).
- Vet/outside-party logins with limited permissions (deferred; would add role complexity).
- Native app-store apps (the PWA covers phone use).
- Multi-species / general pet support (dog-focused).

## 6. Key constraints & dependencies

- **Email provider** account needed for Phase 2 reminders.
- **Medical-math responsibility:** auto-dose feature requires careful validation, bounds,
  rounding, and disclaimers (Phase 2).
- **Cost:** target $0 using free tiers (Vercel, Supabase, Resend) at personal-use volume.
