# Dog Tracker — Data Model

_Postgres (Supabase). Phase 1 tables are deployed and final. Phase 2+ entries are still a design sketch._

## Conventions

- All IDs are `uuid` (default `gen_random_uuid()`).
- All tables have `created_at timestamptz default now()`.
- "Who did it" columns reference `auth.users(id)` (via the `profiles` mirror below).
- **Weights are stored in kilograms** (`*_kg`). UI converts to/from pounds
  (`lbs = kg * 2.2046226`, `kg = lbs / 2.2046226`).
- Every household-owned row is protected by **row-level security** (see below).

## Entities

### `profiles`
Mirror of `auth.users` for app-facing data.
`id` (= auth uid, PK), `display_name`, `email`, `created_at`.

### `households`
`id`, `name`, `created_at`.

### `household_members`
`household_id → households`, `user_id → profiles`, `role` (`owner` | `member`),
`joined_at`. PK = (`household_id`, `user_id`).

### `invites`
`id`, `household_id`, `email`, `token` (unguessable), `invited_by → profiles`,
`status` (`pending` | `accepted` | `revoked`), `expires_at`, `created_at`.

### `dogs`
`id`, `household_id → households`, `name`, `breed`, `sex`, `birthdate`,
`photo_url`, `microchip`, `notes`, `created_at`.

### `weights`
`id`, `dog_id → dogs`, `weight_kg numeric`, `measured_on date`, `note`,
`recorded_by → profiles`, `created_at`.

### `vaccine_types`
Preset + custom catalog. `id`, `household_id` (null = global preset),
`name`, `default_interval_months int`, `is_preset bool`, `created_at`.

### `vaccinations`
`id`, `dog_id → dogs`, `vaccine_type_id → vaccine_types` (nullable),
`custom_name` (when no type), `given_on date`, `next_due_on date`,
`vet_visit_id → vet_visits` (nullable, Phase 3), `notes`,
`recorded_by → profiles`, `created_at`.
_Next-due is auto-suggested from `given_on + default_interval_months`, but stored as its own
overridable value._

### `medications`
`id`, `dog_id → dogs`, `name`, `dose_amount numeric`, `dose_unit` (e.g. `mg`),
`frequency` (e.g. `once_daily`, `twice_daily`, `weekly`, `as_needed`),
`mg_per_kg numeric` (nullable — set to enable auto-dose),
`start_on date`, `end_on date` (nullable = ongoing), `is_active bool`,
`notes`, `recorded_by → profiles`, `created_at`.

### `medication_doses`
Per-administration log. `id`, `medication_id → medications`,
`given_at timestamptz`, `given_by → profiles`, `amount_given numeric`,
`note`, `created_at`.

### `vet_visits` _(Phase 3)_
`id`, `dog_id → dogs`, `visited_on date`, `vet_name`, `reason`, `notes`,
`cost numeric`, `recorded_by → profiles`, `created_at`.

### `documents` _(Phase 3)_
`id`, `household_id`, `dog_id` (nullable), `vet_visit_id` (nullable),
`storage_path`, `filename`, `content_type`, `uploaded_by → profiles`, `created_at`.
File bytes live in Supabase Storage; this table is metadata + access scoping.

### `reminder_settings`
`household_id` (PK), `lead_time_days int default 7`, `email_enabled bool default true`.

## Derived: "Due soon" and reminders

There is **no `reminders` table**. Due items are computed on read:
- **Vaccines (deployed):** `latest_vaccinations_for_household()` stored function returns the
  most recent record per (dog, vaccine name). `lib/vaccines.ts` classifies each into
  `overdue` / `due_soon` (within 7 days) / `upcoming`. Dashboard displays all three buckets.
- **Medications (Phase 2):** ongoing meds and their next-dose/refill logic.

The **daily email job** (Phase 2) will run the same query server-side and email the household
anything within `lead_time_days`.

## Row-level security (RLS)

Core rule: a user may read/write a row only if they belong to that row's household.

**Deployed helper** (`security definer`, fixed `search_path` to prevent RLS recursion):
```sql
create function public.is_member(h uuid) returns boolean language sql stable security definer
set search_path = '' as $$
  select exists (
    select 1 from public.household_members m
    where m.household_id = h and m.user_id = auth.uid()
  );
$$;
```

**Deployed stored function** (atomic household + owner-membership insert, `security definer`
so the insert doesn't self-block on RLS before the row exists):
```sql
create function public.create_household(p_name text) returns uuid ...
```

**Deployed dashboard function** (`latest_vaccinations_for_household`) — returns the most
recent vaccination per (dog, vaccine name) for a household. Uses `DISTINCT ON`, which can't
be expressed in the PostgREST fluent API, so it lives in a stored function.

**Policies (deployed):**
- `households`: members can SELECT; owner can UPDATE.
- `household_members`: members can SELECT their household's list; owner can INSERT/UPDATE/DELETE.
- `invites`: owner can manage; acceptance is handled server-side via admin client (bypasses RLS).
- `dogs`, `documents`, `reminder_settings`: `using (is_member(household_id))`.
- Child tables (`weights`, `vaccinations`, `medications`, `medication_doses`, `vet_visits`):
  policy joins up to the owning `dog`/`medication` → `dogs.household_id` → `is_member(...)`.
- `vaccine_types`: readable if `is_preset = true` OR `is_member(household_id)`; custom types
  can only be inserted/updated/deleted by members of the owning household.

## Medical safety (auto-dose)

The weight-based dose calculator is a convenience, **not** medical authority.
- Always display the **inputs and formula** used (latest weight, mg/kg, result) so a human
  can sanity-check it.
- Apply **rounding** and **sane min/max bounds**; refuse to show absurd results.
- Snapshot the weight + formula used at calculation time so logged doses are auditable.
- Show a persistent disclaimer: *not a substitute for veterinary advice; confirm doses with
  your vet.* The app never administers — it only suggests.
