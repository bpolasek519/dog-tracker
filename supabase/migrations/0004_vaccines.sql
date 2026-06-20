-- ── Tables ────────────────────────────────────────────────────────────────────

create table public.vaccine_types (
  id                      uuid primary key default gen_random_uuid(),
  household_id            uuid references public.households(id) on delete cascade,
  name                    text not null,
  default_interval_months int,
  is_preset               bool not null default false,
  created_at              timestamptz default now()
);

create table public.vaccinations (
  id              uuid primary key default gen_random_uuid(),
  dog_id          uuid not null references public.dogs(id) on delete cascade,
  vaccine_type_id uuid references public.vaccine_types(id) on delete set null,
  custom_name     text,
  given_on        date not null,
  next_due_on     date,
  notes           text,
  recorded_by     uuid references public.profiles(id),
  created_at      timestamptz default now(),
  constraint vaccination_name_check check (
    vaccine_type_id is not null or custom_name is not null
  )
);

-- ── RLS ───────────────────────────────────────────────────────────────────────

alter table public.vaccine_types  enable row level security;
alter table public.vaccinations   enable row level security;

-- Presets (household_id is null) are readable by any authenticated user;
-- custom types (household_id is set) are readable only by household members.
create policy "read_vaccine_types"
  on public.vaccine_types for select
  using (
    is_preset = true
    or (household_id is not null and public.is_member(household_id))
  );

create policy "members_insert_custom_vaccine_type"
  on public.vaccine_types for insert
  with check (
    household_id is not null and public.is_member(household_id)
  );

create policy "members_update_custom_vaccine_type"
  on public.vaccine_types for update
  using (household_id is not null and public.is_member(household_id));

create policy "members_delete_custom_vaccine_type"
  on public.vaccine_types for delete
  using (household_id is not null and public.is_member(household_id));

create policy "members_crud_vaccinations"
  on public.vaccinations for all
  using (
    exists (
      select 1 from public.dogs d
      where d.id = dog_id
        and public.is_member(d.household_id)
    )
  );

-- ── Preset seed data ──────────────────────────────────────────────────────────

insert into public.vaccine_types (name, default_interval_months, is_preset)
values
  ('Rabies (1-year)',          12, true),
  ('Rabies (3-year)',          36, true),
  ('DHPP (Distemper combo)',   12, true),
  ('Bordetella',               12, true),
  ('Leptospirosis',            12, true),
  ('Canine Influenza (H3N2)', 12, true),
  ('Canine Influenza (H3N8)', 12, true);

-- ── Dashboard query function ──────────────────────────────────────────────────
-- Returns the most recent vaccination record per (dog, vaccine name) for a
-- household. Used by the dashboard because DISTINCT ON can't be expressed
-- in the PostgREST fluent API.
create or replace function public.latest_vaccinations_for_household(p_household_id uuid)
returns table (
  dog_id       uuid,
  dog_name     text,
  vaccine_name text,
  given_on     date,
  next_due_on  date
)
language sql stable security definer
set search_path = ''
as $$
  select distinct on (v.dog_id, coalesce(vt.name, v.custom_name))
    d.id                             as dog_id,
    d.name                           as dog_name,
    coalesce(vt.name, v.custom_name) as vaccine_name,
    v.given_on,
    v.next_due_on
  from public.vaccinations v
  join public.dogs d          on d.id = v.dog_id
  left join public.vaccine_types vt on vt.id = v.vaccine_type_id
  where d.household_id = p_household_id
    and v.next_due_on is not null
  order by
    v.dog_id,
    coalesce(vt.name, v.custom_name),
    v.given_on desc;
$$;
