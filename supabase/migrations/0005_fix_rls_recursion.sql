-- Fix infinite RLS recursion on household_members.
--
-- The original "owner_manage_members" policy (for all) had a direct subquery
-- back on household_members. PostgreSQL evaluates both sides of the OR in the
-- combined policy expression, so when any row exists the subquery re-enters RLS
-- and recurses infinitely. The fix mirrors the pattern already used by is_member():
-- wrap the ownership check in a security definer function so RLS is bypassed for
-- the inner lookup.

create or replace function public.is_owner(h uuid)
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.household_members m
    where m.household_id = h
      and m.user_id = auth.uid()
      and m.role = 'owner'
  );
$$;

drop policy "owner_manage_members" on public.household_members;

create policy "owner_manage_members"
  on public.household_members for all
  using (public.is_owner(household_id));
