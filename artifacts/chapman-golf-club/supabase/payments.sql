-- =====================================================================
-- Chinhoyi Country Club: payments table (Paynow)
-- Run ONCE in Supabase SQL Editor, after schema.sql.
-- Nobody can read or write this from the website: only staff can read it,
-- and only the Paynow function (which uses the secret service key) writes it.
-- =====================================================================
create table if not exists public.payments (
  reference         text primary key,                 -- what we send to Paynow
  kind              text not null,                    -- 'event-entry' (later: bookings, membership)
  target_collection text not null,
  target_id         text not null,
  amount            numeric(10,2) not null,
  currency          text not null default 'USD',
  method            text not null,                    -- ecocash | onemoney | web
  status            text not null default 'created',  -- created | pending | paid | failed | refunded | review
  paynow_reference  text,
  poll_url          text,
  browser_url       text,
  payer_phone       text,
  payer_email       text,
  note              text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index if not exists payments_target on public.payments (target_collection, target_id);

alter table public.payments enable row level security;
drop policy if exists "staff read payments" on public.payments;
create policy "staff read payments" on public.payments for select using (public.is_staff());
