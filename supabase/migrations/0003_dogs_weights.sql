-- ── Tables ────────────────────────────────────────────────────────────────────

create table public.dogs (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  name         text not null,
  breed        text,
  sex          text check (sex in ('male', 'female', 'male_neutered', 'female_spayed')),
  birthdate    date,
  photo_url    text,
  microchip    text,
  notes        text,
  created_at   timestamptz default now()
);

create table public.weights (
  id          uuid primary key default gen_random_uuid(),
  dog_id      uuid not null references public.dogs(id) on delete cascade,
  weight_kg   numeric(6,3) not null,
  measured_on date not null default current_date,
  note        text,
  recorded_by uuid references public.profiles(id),
  created_at  timestamptz default now()
);

-- ── RLS ───────────────────────────────────────────────────────────────────────

alter table public.dogs    enable row level security;
alter table public.weights enable row level security;

create policy "members_crud_dogs"
  on public.dogs for all
  using (public.is_member(household_id));

create policy "members_crud_weights"
  on public.weights for all
  using (
    exists (
      select 1 from public.dogs d
      where d.id = dog_id
        and public.is_member(d.household_id)
    )
  );
