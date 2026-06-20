-- ── Tables ────────────────────────────────────────────────────────────────────

create table public.households (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  created_at timestamptz default now()
);

create table public.household_members (
  household_id uuid not null references public.households(id) on delete cascade,
  user_id      uuid not null references public.profiles(id)   on delete cascade,
  role         text not null default 'member'
                    check (role in ('owner', 'member')),
  joined_at    timestamptz default now(),
  primary key (household_id, user_id)
);

create table public.invites (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  email        text,
  token        uuid not null unique default gen_random_uuid(),
  invited_by   uuid not null references public.profiles(id),
  status       text not null default 'pending'
                    check (status in ('pending', 'accepted', 'revoked')),
  expires_at   timestamptz not null default (now() + interval '7 days'),
  created_at   timestamptz default now()
);

-- ── Helper function (defined after tables so the reference resolves) ───────────
-- Returns true if the calling user is a member of household h.
-- security definer + fixed search_path prevents RLS recursion and search-path attacks.
create or replace function public.is_member(h uuid)
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.household_members m
    where m.household_id = h and m.user_id = auth.uid()
  );
$$;

-- ── RLS ───────────────────────────────────────────────────────────────────────

alter table public.households       enable row level security;
alter table public.household_members enable row level security;
alter table public.invites           enable row level security;

-- households: any member can read; only the owner can update
create policy "members_read_household"
  on public.households for select
  using (public.is_member(id));

create policy "owner_update_household"
  on public.households for update
  using (
    exists (
      select 1 from public.household_members
      where household_id = id
        and user_id = auth.uid()
        and role = 'owner'
    )
  );

-- household_members: members can read their own membership list;
-- owner can insert/delete members
create policy "members_read_memberships"
  on public.household_members for select
  using (public.is_member(household_id));

create policy "owner_manage_members"
  on public.household_members for all
  using (
    exists (
      select 1 from public.household_members m2
      where m2.household_id = household_id
        and m2.user_id = auth.uid()
        and m2.role = 'owner'
    )
  );

-- invites: owner can manage their household's invites;
-- acceptance is handled by the acceptInvite server action (service role), not client RLS
create policy "owner_manage_invites"
  on public.invites for all
  using (
    exists (
      select 1 from public.household_members
      where household_id = invites.household_id
        and user_id = auth.uid()
        and role = 'owner'
    )
  );

-- ── Stored function: create_household ─────────────────────────────────────────
-- Atomically inserts the household and the owner membership row.
-- Must be security definer so the owner membership insert doesn't self-block on RLS.
create or replace function public.create_household(p_name text)
returns uuid
language plpgsql security definer
set search_path = ''
as $$
declare
  v_id uuid;
begin
  insert into public.households (name)
  values (p_name)
  returning id into v_id;

  insert into public.household_members (household_id, user_id, role)
  values (v_id, auth.uid(), 'owner');

  return v_id;
end;
$$;
