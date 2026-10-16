# Chinhoyi Country Club: setup and switch-on guide

This is the one place that says what to set, where, and in what order. Everything is built so
that missing pieces (the club's domain, a Paynow account, real contact details) are just
**blanks you fill in later**. Until you fill them, the site keeps working safely:

| Missing piece | What happens until you add it |
| --- | --- |
| Supabase not connected | Demo mode: data stays in each visitor's own browser. |
| Paynow not connected | Event entries stay "awaiting payment"; the club follows up. |
| Email provider / domain not set | Emails run in **dry run**: recorded in Admin → Emails, never sent. |
| Real club phone / email not set | Placeholders are never printed on PDFs or emails. |

## The parts

| Part | Lives on | Built from |
| --- | --- | --- |
| Website | Vercel | this project |
| Database, logins, files | Supabase | `supabase/schema.sql` |
| Online payment | Supabase Edge Function `paynow` | `supabase/functions/paynow/index.ts`, `supabase/payments.sql` |
| Automated email | Supabase Edge Function `mailer` | `supabase/functions/mailer/index.ts`, `supabase/emails.sql` |
| PDFs and calendar files | Built in the visitor's browser | `src/lib/documents.ts`, `src/lib/ics.ts` |

## Order of setup

### 1. Supabase (the database and logins)
1. Create a project at supabase.com. Keep the database password somewhere safe.
2. SQL Editor → run, in this order: `supabase/schema.sql`, then `supabase/payments.sql`, then `supabase/emails.sql`. Each is safe to run again.
3. Authentication → Users → add your own user. Then in the SQL Editor run the `update public.profiles set role='super_admin' where email='YOU@...'` line shown at the bottom of `schema.sql`.
4. Project Settings → API: copy the **Project URL** and the **anon public** key (never the service_role key).

### 2. Vercel (the website)
Settings → Environment Variables, then redeploy:

| Name | Value | When |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | the Project URL | step 1 |
| `VITE_SUPABASE_ANON_KEY` | the anon public key | step 1 |
| `VITE_ONLINE_PAYMENTS` | `on` | only after the Paynow function works (step 3) |

### 3. Paynow (online payment)
Needs a Paynow merchant account. You can test with your own.
1. Paynow → create an integration in **test mode**. Note the Integration ID and Key. Ask Paynow whether it can settle in **USD**.
2. Supabase → Edge Functions → create `paynow`, paste `supabase/functions/paynow/index.ts`, and **turn "Verify JWT" off** (Paynow calls it without a login).
3. Edge Functions → Secrets:

| Secret | Value |
| --- | --- |
| `PAYNOW_ID`, `PAYNOW_KEY` | from Paynow |
| `SITE_URL` | the website address, e.g. `https://chinhoyi-country-club.vercel.app` |
| `PAYNOW_MODE` | `test` first; `live` only after Paynow approves the integration |
| `PAYNOW_TEST_EMAIL` | your Paynow merchant email (test mode requires it) |

4. Set `VITE_ONLINE_PAYMENTS=on` in Vercel and redeploy. Test with 0771111111 (success), 0772222222 (delayed), 0773333333 (cancelled), 0774444444 (insufficient balance).

### 4. Email (do this when you have a domain)
Until then, skip this: dry run already records what would be sent.

1. **A domain the club controls**, e.g. `chinhoyicountryclub.co.zw` or a `.com`. Gmail or `vercel.app` senders land in spam.
2. **A sending service**: Resend or Brevo (both are supported; pick one). Add your domain there. It shows DNS records (SPF, DKIM, and a DMARC suggestion); add them at wherever the domain's DNS is managed, then press Verify.
3. Supabase → Edge Functions → create `mailer`, paste `supabase/functions/mailer/index.ts`, and **turn "Verify JWT" off**. (The function checks its own passwords. The schedule and the one-click unsubscribe link cannot send a login.)
4. Secrets for `mailer`:

| Secret | Value | Notes |
| --- | --- | --- |
| `EMAIL_DRY_RUN` | `true` | **Leave as `true` until you have read the dry-run emails.** Only the exact word `false` sends. |
| `EMAIL_PROVIDER` | `resend` or `brevo` | |
| `EMAIL_PROVIDER_KEY` | the provider's API key | |
| `EMAIL_FROM` | e.g. `info@yourdomain` | must be on the verified domain |
| `EMAIL_FROM_NAME` | `Chinhoyi Country Club` | default already |
| `EMAIL_REPLY_TO` | where replies should go | optional |
| `SITE_URL` | the website address | links and logo inside emails |
| `CRON_SECRET` | a long random password | the timer sends this |
| `UNSUBSCRIBE_SECRET` | another long random password | signs unsubscribe links; keep it constant |
| `EMAIL_DAILY_CAP` | `50` | most emails per day; protects against mistakes |
| `EMAIL_INACTIVITY` | `off` | see "Known limits" before turning on |

5. Schedule: follow the comments at the bottom of `supabase/emails.sql` (every 10 minutes, header `x-cron-secret`).
6. Admin → Emails: press **Record test email**, then **Run now**, then read the rows (Preview shows each email as the recipient sees it). The page lists anything still missing.
7. Going live: set `EMAIL_DRY_RUN` to `false`. Send a real test email to yourself first. The first live run sends everything currently due, up to the daily cap; the rest wait for tomorrow.

## What the mailer sends

| Email | When | Opt-out applies? |
| --- | --- | --- |
| Entry received | an event entry is made (last 3 days only) | no |
| Payment receipt | an entry is paid (last 3 days only) | no |
| Payment reminder | entry still unpaid after 24 hours, event not yet past | no |
| Event reminder to entrants | event is 2 days away or less | no |
| Tee time received / confirmed / cancelled | booking changes (recent only) | no |
| Fee due / overdue | a `fees` record is due within 7 days / up to 30 days late (weekly) | no |
| Event announcement to members | event is within 7 days (members who entered are skipped) | **yes** |
| "We would love to see you back" | member idle 60+ days, at most once per 30 days; **off by default** | **yes** |

Every club-news email has a one-click unsubscribe link. Receipts and booking messages never do.

## When you get the missing pieces

| You get… | Do this |
| --- | --- |
| The club's real phone, email, address | Edit them in `src/data/club.ts` (`club` object). PDFs and emails pick them up. Placeholders are hidden until then. |
| A domain | Section 4 above. Also point the website at it in Vercel → Domains, then update `SITE_URL` in both functions. |
| A Paynow merchant account | Section 3, then switch `PAYNOW_MODE` to `live`. |
| The club's real photos | Replace the files in `public/images` and update the entries in `src/data/club.ts`. |
| A WhatsApp number | Set it in `src/data/club.ts` (`whatsapp`). |

## Switching things off (if something goes wrong)

- **Stop all email at once:** set `EMAIL_DRY_RUN` back to `true` (takes effect on the next run). Or `select cron.unschedule('ccc-mailer');`.
- **Stop online payment:** set `VITE_ONLINE_PAYMENTS` to anything but `on` and redeploy. Entries go back to "awaiting payment".
- **Stop one member's news emails:** insert their lower-case address into `email_optout`.

## Known limits (read before launch)

1. **Provider details are from memory.** The Resend and Brevo request formats and Paynow's status names were written from documentation recalled from memory and tested only against fakes. Treat the first real test email and first real test payment as the real check.
2. **"We miss you" emails use confirmed bookings** as the only record of play. If staff do not mark visits as confirmed, active members will look idle. Leave `EMAIL_INACTIVITY` off until round records exist (member portal phase).
3. **Fees** have no admin screen yet. The mailer reads a `fees` collection (`id, email, name, description, amount, dueDate`, `status` `due` or `paid`). Until that screen exists, fee emails are inactive because nothing creates those records.
4. **No attachments.** Emails link to the website; the PDFs are generated in the browser. Server-made PDFs are a later step.
5. **The Contact page** still opens the visitor's own email app (`mailto:`). Messages do not reach a club inbox by themselves. Storing them and emailing the club is a small next step.
6. **Free-plan limits.** Supabase's free plan pauses inactive projects (as far as I know; check the current terms) and Vercel's Hobby plan is non-commercial. Check both before taking real money.
7. **Form spam guard** (hidden field + minimum time) stops cheap bots only. If the club is ever targeted, add a CAPTCHA.
