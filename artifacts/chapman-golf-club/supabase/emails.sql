-- =====================================================================
-- Chinhoyi Country Club: automated email (outbox, opt-outs, schedule)
-- Run ONCE in Supabase SQL Editor, after schema.sql.
-- Safe to run again.
--
-- How it works:
--   * The "mailer" function looks at the club's data every few minutes,
--     decides which emails are due, and writes each one to email_outbox.
--   * While the function's EMAIL_DRY_RUN secret is "true" (the default) the rows
--     are only RECORDED (status dry_run). Nothing is sent. You can read them in
--     Admin -> Emails to see exactly what members would receive.
--   * Set EMAIL_DRY_RUN to "false" (and add the provider key) to send for real.
-- Only staff can read these tables. Only the function (secret service key) writes.
-- =====================================================================

create table if not exists public.email_outbox (
  id           uuid primary key default gen_random_uuid(),
  dedupe_key   text not null,                  -- stops the same email being planned twice
  dry          boolean not null default true,  -- true = recorded only (dry run), false = real
  category     text not null,                  -- 'transactional' (receipts, bookings) | 'notice' (news, reminders)
  template     text not null,
  to_email     text not null,
  to_name      text,
  subject      text not null,
  html         text not null,
  text         text not null,
  status       text not null default 'queued', -- queued | sent | failed | dry_run | skipped
  attempts     int not null default 0,
  last_error   text,
  provider_id  text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  sent_at      timestamptz,
  unique (dedupe_key, dry)
);
create index if not exists email_outbox_status on public.email_outbox (status, created_at);
create index if not exists email_outbox_recent on public.email_outbox (created_at desc);

create table if not exists public.email_optout (
  email      text primary key,                 -- lower-case
  created_at timestamptz not null default now()
);

alter table public.email_outbox enable row level security;
alter table public.email_optout enable row level security;

drop policy if exists "staff read outbox" on public.email_outbox;
create policy "staff read outbox" on public.email_outbox for select using (public.is_staff());
-- staff may put a failed email back in the queue from Admin -> Emails
drop policy if exists "staff requeue outbox" on public.email_outbox;
create policy "staff requeue outbox" on public.email_outbox for update using (public.is_staff()) with check (public.is_staff());

drop policy if exists "staff read optout" on public.email_optout;
create policy "staff read optout" on public.email_optout for select using (public.is_staff());

-- ---------------------------------------------------------------------
-- SCHEDULE (do this AFTER the function is deployed and its secrets are set)
--
-- Easiest: Supabase Dashboard -> Integrations -> Cron -> Create job, type
-- "Supabase Edge Function", pick "mailer", method POST, path /run,
-- schedule every 10 minutes ("*/10 * * * *"), and add the HTTP header
--   x-cron-secret: <the same value as your CRON_SECRET secret>
--
-- Or by SQL (needs the pg_cron and pg_net extensions switched on; replace
-- the two placeholders, then remove the leading "--" from the lines below):
--
-- select cron.schedule(
--   'ccc-mailer', '*/10 * * * *',
--   $$ select net.http_post(
--        url     := 'https://YOUR-PROJECT-REF.supabase.co/functions/v1/mailer/run',
--        headers := jsonb_build_object('Content-Type','application/json','x-cron-secret','YOUR-CRON-SECRET'),
--        body    := '{}'::jsonb
--      ) $$
-- );
-- To stop it later:  select cron.unschedule('ccc-mailer');
-- ---------------------------------------------------------------------
