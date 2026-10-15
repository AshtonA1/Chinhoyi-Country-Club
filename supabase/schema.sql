-- =====================================================================
-- Chinhoyi Country Club: database setup
-- Run ONCE in Supabase: Dashboard -> SQL Editor -> New query -> paste -> Run.
-- Safe to run again: it only creates what is missing.
-- =====================================================================

-- 1. People: one profile per signed-up user. role = 'member' or a staff role.
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text,
  full_name  text not null default '',
  role       text not null default 'member',
  created_at timestamptz not null default now()
);

-- 2. Club content and submissions. One row per item, grouped by "collection"
--    (events, holes, facilities, event-entries, bookings, stories, ...).
create table if not exists public.ccc_docs (
  collection text not null,
  id         text not null,
  data       jsonb not null,
  owner      uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (collection, id)
);
create index if not exists ccc_docs_collection_created on public.ccc_docs (collection, created_at desc);

-- 3. Helper checks. SECURITY DEFINER so they can read profiles without
--    tripping the profiles policies below.
create or replace function public.is_staff() returns boolean
language sql security definer set search_path = public stable as $$
  select exists (select 1 from public.profiles p where p.id = auth.uid() and p.role <> 'member');
$$;

create or replace function public.is_super_admin() returns boolean
language sql security definer set search_path = public stable as $$
  select exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'super_admin');
$$;

-- 4. Every new sign-up gets a profile with the plain 'member' role.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- 5. Row level security: who may do what.
alter table public.profiles enable row level security;
alter table public.ccc_docs enable row level security;

drop policy if exists "read own profile" on public.profiles;
create policy "read own profile" on public.profiles for select using (id = auth.uid());
drop policy if exists "staff read profiles" on public.profiles;
create policy "staff read profiles" on public.profiles for select using (public.is_staff());
drop policy if exists "super admin edits profiles" on public.profiles;
create policy "super admin edits profiles" on public.profiles for update
  using (public.is_super_admin()) with check (public.is_super_admin());

-- Everyone (even signed out) may read the public site content.
drop policy if exists "public reads content" on public.ccc_docs;
create policy "public reads content" on public.ccc_docs for select using (
  collection in ('events','holes','facilities','pricing','addons','course','booking-settings','_meta')
);
-- ...and gallery stories once an admin has approved them.
drop policy if exists "public reads approved stories" on public.ccc_docs;
create policy "public reads approved stories" on public.ccc_docs for select using (
  collection = 'stories' and data ->> 'status' = 'approved'
);
-- A signed-in member reads their own bookings and entries.
drop policy if exists "owner reads own" on public.ccc_docs;
create policy "owner reads own" on public.ccc_docs for select using (
  owner = auth.uid() and collection in ('bookings','event-entries')
);
-- Staff can do everything.
drop policy if exists "staff full access" on public.ccc_docs;
create policy "staff full access" on public.ccc_docs for all
  using (public.is_staff()) with check (public.is_staff());
-- Visitors can submit, but only in the starting state. They can never
-- create an entry that is already "paid" or a story that is already "approved".
drop policy if exists "visitors submit" on public.ccc_docs;
create policy "visitors submit" on public.ccc_docs for insert with check (
  (owner is null or owner = auth.uid()) and (
    (collection = 'event-entries'    and data ->> 'status' = 'pending_payment') or
    (collection = 'sponsor-requests' and data ->> 'status' = 'new') or
    (collection = 'stories'          and data ->> 'status' = 'pending') or
    (collection = 'bookings'         and data ->> 'status' = 'Requested')
  )
);
-- A member may cancel their own booking (and nothing else about it).
drop policy if exists "member cancels own booking" on public.ccc_docs;
create policy "member cancels own booking" on public.ccc_docs for update
  using (owner = auth.uid() and collection = 'bookings')
  with check (owner = auth.uid() and collection = 'bookings' and data ->> 'status' = 'Cancelled');

-- =====================================================================
-- AFTER running this script, create the first staff account:
--   1. Dashboard -> Authentication -> Users -> Add user (email + password,
--      tick "Auto Confirm User").
--   2. Run this, with that email:
--        update public.profiles set role = 'super_admin' where email = 'you@example.com';
-- Staff roles: super_admin, golf_ops_manager, membership_manager,
-- events_manager, content_manager, pro_shop_manager, accountant.
-- =====================================================================
