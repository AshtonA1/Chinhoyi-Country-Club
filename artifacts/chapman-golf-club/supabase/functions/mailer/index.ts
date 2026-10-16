// Automated email for Chinhoyi Country Club (Supabase Edge Function).
//
// Routes (all POST):
//   /mailer/run          plan + send the emails that are due. Called by the schedule (x-cron-secret) or by staff.
//   /mailer/status       what is switched on, how many were sent today (staff only)
//   /mailer/test         send (or, in dry run, record) a test email (staff only)
//   /mailer/unsubscribe  stop club news emails for an address (public, needs the signed token from the email)
//
// Safety rules this code follows:
//  - DRY RUN is the default. Nothing is sent unless EMAIL_DRY_RUN is exactly "false".
//  - A daily cap (EMAIL_DAILY_CAP, default 50) stops a mistake from emailing everybody at once.
//  - The same email is never planned twice (dedupe key). Old records are never emailed (recent-days limit).
//  - Club news ("notice") emails respect opt-outs; receipts and bookings ("transactional") do not.
//  - Every notice email carries a signed one-click unsubscribe link and the List-Unsubscribe header.
//  - Provider keys live only in this function's secrets, never in the website.
//
// What "plan" means: a pure function turns a snapshot of the club's data into a list of emails.
// It has no network or database calls, so it is fully tested.

export const RULES = {
  /** Receipts, booking and entry emails are only sent for things created or paid within this many days. */
  recentDays: 3,
  /** Announce an event to members once it is this many days away or less. */
  announceDays: 7,
  /** Remind people who entered, once the event is this many days away or less. */
  entrantReminderDays: 2,
  /** Remind someone who has not paid for an entry after this many hours. */
  payReminderAfterHours: 24,
  /** A member who has not played for this many days gets one "we miss you" email. */
  inactiveDays: 60,
  /** Fees: warn this many days before the due date; keep reminding weekly up to this many days overdue. */
  feeWarnDays: 7,
  feeOverdueMaxDays: 30,
};

export type Env = {
  dryRun: boolean;
  provider: 'resend' | 'brevo' | 'none';
  providerKey: string;
  fromEmail: string;
  fromName: string;
  replyTo: string;
  siteUrl: string;
  clubName: string;
  functionUrl: string;
  cronSecret: string;
  unsubscribeSecret: string;
  dailyCap: number;
  batchSize: number;
  inactivityOn: boolean;
};

export type Category = 'transactional' | 'notice';

export type Planned = {
  dedupeKey: string;
  category: Category;
  template: string;
  toEmail: string;
  toName: string;
  subject: string;
  data: Record<string, any>;
};

export type OutboxRow = {
  id?: string;
  dedupe_key: string;
  dry: boolean;
  category: Category;
  template: string;
  to_email: string;
  to_name: string;
  subject: string;
  html: string;
  text: string;
  status: 'queued' | 'sent' | 'failed' | 'dry_run' | 'skipped';
  attempts: number;
  last_error?: string | null;
};

export type Snapshot = {
  events: any[];
  entries: any[];
  bookings: any[];
  fees: any[];
  members: { id: string; email: string; fullName: string; createdAt: string }[];
};

export interface Store {
  snapshot(): Promise<Snapshot>;
  optedOut(): Promise<Set<string>>;
  addOptOut(email: string): Promise<void>;
  /** Inserts rows, ignoring any whose (dedupe_key, dry) already exists. Returns how many were new. */
  insertOutbox(rows: OutboxRow[]): Promise<number>;
  queued(limit: number): Promise<OutboxRow[]>;
  sentSince(iso: string): Promise<number>;
  counts(): Promise<Record<string, number>>;
  markSent(id: string, providerId: string): Promise<void>;
  markFailed(id: string, attempts: number, final: boolean, error: string): Promise<void>;
  markSkipped(id: string, reason: string): Promise<void>;
  staffFromToken(jwt: string): Promise<{ email: string } | null>;
}

type Fetch = typeof fetch;

export type OutMessage = {
  from: { name: string; email: string };
  replyTo?: string;
  to: { email: string; name?: string };
  subject: string;
  html: string;
  text: string;
  headers?: Record<string, string>;
};

export interface Provider {
  name: string;
  send(msg: OutMessage): Promise<{ id: string }>;
}

/* ------------------------------------------------------------------ small helpers */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });
const problem = (status: number, error: string) => json({ ok: false, error }, status);

const CLUB_OFFSET_MS = 2 * 3_600_000; // Chinhoyi, UTC+2
const DAY = 86_400_000;
/** Today's date at the club, YYYY-MM-DD. */
export const clubToday = (now: number): string => new Date(now + CLUB_OFFSET_MS).toISOString().slice(0, 10);
const dayNumber = (iso: string): number => Math.floor(new Date(`${iso}T12:00:00Z`).getTime() / DAY);
export const daysBetween = (fromIso: string, toIso: string): number => dayNumber(toIso) - dayNumber(fromIso);

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export function fmtDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return `${WEEKDAYS[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}
const money = (n: number) => (Number.isInteger(n) ? `$${n}` : `$${Number(n).toFixed(2)}`);
const emailOk = (e: unknown): e is string => typeof e === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());
const norm = (e: string) => e.trim().toLowerCase();
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** True when a record was created/paid within the last `days` days. */
function recent(iso: unknown, now: number, days: number): boolean {
  const t = typeof iso === 'string' ? Date.parse(iso) : NaN;
  return Number.isFinite(t) && now - t <= days * DAY && t <= now + DAY;
}

/* ------------------------------------------------------------------ signed unsubscribe token */

const b64url = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64url = (s: string) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));

async function hmac(secret: string, message: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message)));
}

export async function makeUnsubscribeToken(email: string, secret: string): Promise<string> {
  const e = norm(email);
  return `${b64url(new TextEncoder().encode(e))}.${b64url(await hmac(secret, e))}`;
}

/** Returns the email if the token is genuine, otherwise null. */
export async function readUnsubscribeToken(token: string, secret: string): Promise<string | null> {
  try {
    const [a, b] = token.split('.');
    if (!a || !b) return null;
    const email = new TextDecoder().decode(unb64url(a));
    const expected = await hmac(secret, email);
    const given = unb64url(b);
    if (given.length !== expected.length) return null;
    let diff = 0;
    for (let i = 0; i < given.length; i++) diff |= given[i] ^ expected[i];
    return diff === 0 && emailOk(email) ? email : null;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ planner (pure) */

export function planEmails(snap: Snapshot, now: number, opts: { inactivityOn: boolean }, rules = RULES): Planned[] {
  const out: Planned[] = [];
  const today = clubToday(now);
  const add = (p: Planned) => { if (emailOk(p.toEmail)) out.push({ ...p, toEmail: norm(p.toEmail) }); };

  const events = new Map<string, any>(snap.events.map((e) => [e.id, e]));

  // ---- event entries: received, reminder to pay, receipt, event coming up
  const entrantsByEvent = new Map<string, Set<string>>();
  for (const en of snap.entries) {
    if (!emailOk(en.email) || en.status === 'cancelled') continue;
    const ev = events.get(en.eventId);
    const evTitle = en.eventTitle ?? ev?.title ?? 'the event';
    const evDate = en.eventDate ?? ev?.date;
    (entrantsByEvent.get(en.eventId) ?? entrantsByEvent.set(en.eventId, new Set()).get(en.eventId)!).add(norm(en.email));
    const base = { toEmail: en.email, toName: en.contactName ?? '' };
    const data = { ref: en.ref, eventId: en.eventId, eventTitle: evTitle, eventDate: evDate, total: en.total, format: en.format, players: en.players ?? [], name: en.contactName ?? '' };

    if (en.status === 'paid') {
      if (recent(en.paidAt ?? en.createdAt, now, rules.recentDays)) {
        add({ ...base, dedupeKey: `receipt:${en.id}`, category: 'transactional', template: 'payment_receipt', subject: `Payment received: ${evTitle} (${en.ref})`, data: { ...data, paymentReference: en.paymentReference ?? '', paidAt: en.paidAt ?? '' } });
      }
    } else if (en.status === 'pending_payment') {
      if (recent(en.createdAt, now, rules.recentDays)) {
        add({ ...base, dedupeKey: `entry-received:${en.id}`, category: 'transactional', template: 'entry_received', subject: `Your entry for ${evTitle} (${en.ref})`, data });
      }
      const ageH = (now - Date.parse(en.createdAt)) / 3_600_000;
      if (ageH >= rules.payReminderAfterHours && ageH <= 24 * 7 && evDate && evDate >= today) {
        add({ ...base, dedupeKey: `pay-reminder:${en.id}`, category: 'transactional', template: 'payment_reminder', subject: `Reminder: pay for your ${evTitle} entry`, data });
      }
    }
    if (evDate && (en.status === 'paid' || en.status === 'pending_payment')) {
      const left = daysBetween(today, evDate);
      if (left >= 0 && left <= rules.entrantReminderDays && ev?.status !== 'cancelled') {
        add({ ...base, dedupeKey: `entrant-reminder:${en.id}`, category: 'transactional', template: 'entrant_reminder', subject: `${evTitle} is ${left === 0 ? 'today' : left === 1 ? 'tomorrow' : `on ${fmtDate(evDate)}`}`, data: { ...data, daysLeft: left, paid: en.status === 'paid' } });
      }
    }
  }

  // ---- tee-time bookings
  for (const b of snap.bookings) {
    if (!emailOk(b.email)) continue;
    const base = { toEmail: b.email, toName: b.name ?? '' };
    const data = { ref: b.reference, date: b.date, time: b.time, players: b.players, holes: b.holes, total: b.totalPrice, name: b.name ?? '' };
    if (b.status === 'Requested' && recent(b.createdAt, now, rules.recentDays)) {
      add({ ...base, dedupeKey: `booking-received:${b.id}`, category: 'transactional', template: 'booking_received', subject: `Tee time request received (${b.reference})`, data });
    } else if (b.status === 'Confirmed' && b.date >= today) {
      add({ ...base, dedupeKey: `booking-confirmed:${b.id}`, category: 'transactional', template: 'booking_confirmed', subject: `Your tee time is confirmed: ${fmtDate(b.date)} at ${b.time}`, data });
    } else if (b.status === 'Cancelled' && recent(b.createdAt, now, rules.recentDays + 4)) {
      add({ ...base, dedupeKey: `booking-cancelled:${b.id}`, category: 'transactional', template: 'booking_cancelled', subject: `Tee time cancelled (${b.reference})`, data });
    }
  }

  // ---- fees (a "fees" collection: { id, email, name, description, amount, dueDate, status: 'due'|'paid' })
  for (const f of snap.fees) {
    if (f.status !== 'due' || !emailOk(f.email) || !f.dueDate) continue;
    const left = daysBetween(today, f.dueDate);
    const base = { toEmail: f.email, toName: f.name ?? '' };
    const data = { description: f.description ?? 'Club fees', amount: f.amount, dueDate: f.dueDate, name: f.name ?? '', daysLeft: left };
    if (left >= 0 && left <= rules.feeWarnDays) {
      add({ ...base, dedupeKey: `fee-due:${f.id}`, category: 'transactional', template: 'fee_due', subject: `Payment due ${fmtDate(f.dueDate)}: ${data.description}`, data });
    } else if (left < 0 && -left <= rules.feeOverdueMaxDays) {
      add({ ...base, dedupeKey: `fee-overdue:${f.id}:${Math.floor(dayNumber(today) / 7)}`, category: 'transactional', template: 'fee_overdue', subject: `Overdue: ${data.description} (was due ${fmtDate(f.dueDate)})`, data });
    }
  }

  // ---- club news to members: events coming up
  for (const ev of snap.events) {
    if (ev.status === 'cancelled' || !ev.date) continue;
    const left = daysBetween(today, ev.date);
    if (left < 0 || left > rules.announceDays) continue;
    const entrants = entrantsByEvent.get(ev.id) ?? new Set<string>();
    for (const m of snap.members) {
      if (!emailOk(m.email) || entrants.has(norm(m.email))) continue;
      add({ toEmail: m.email, toName: m.fullName, dedupeKey: `event-announce:${ev.id}:${norm(m.email)}`, category: 'notice', template: 'event_announce', subject: `Coming up at the club: ${ev.title}`, data: { eventId: ev.id, eventTitle: ev.title, eventDate: ev.date, eventTime: ev.time ?? '', text: ev.text ?? '', hasEntry: ev.singlePrice !== undefined || ev.fourBallPrice !== undefined, name: m.fullName, daysLeft: left } });
    }
  }

  // ---- club news to members: "we miss you" (off unless EMAIL_INACTIVITY=on)
  if (opts.inactivityOn) {
    const lastPlayed = new Map<string, string>();
    for (const b of snap.bookings) {
      if (b.status === 'Confirmed' && emailOk(b.email) && b.date <= today) {
        const k = norm(b.email);
        if ((lastPlayed.get(k) ?? '') < b.date) lastPlayed.set(k, b.date);
      }
    }
    for (const m of snap.members) {
      if (!emailOk(m.email)) continue;
      const joined = String(m.createdAt).slice(0, 10);
      const last = lastPlayed.get(norm(m.email)) ?? joined;
      const idle = daysBetween(last, today);
      if (idle >= rules.inactiveDays) {
        add({ toEmail: m.email, toName: m.fullName, dedupeKey: `inactive:${m.id}:${Math.floor(dayNumber(today) / 30)}`, category: 'notice', template: 'inactive_member', subject: 'We would love to see you back on the course', data: { name: m.fullName, idleDays: idle } });
      }
    }
  }
  return out;
}

/* ------------------------------------------------------------------ templates (pure) */

const COLOR = { ink: '#202820', green: '#176B3A', gold: '#E8A418', tint: '#FDF5DE', grey: '#687068', line: '#DEE0D8' };

type Ctx = { siteUrl: string; clubName: string; unsubscribeUrl?: string };
type Block = { heading: string; paras: string[]; facts?: [string, string][]; button?: { label: string; path: string }; note?: string; preheader?: string };

function firstName(name: string): string {
  const n = (name ?? '').trim().split(/\s+/)[0];
  return n ? n : 'there';
}

function content(p: Planned, ctx: Ctx): Block {
  const d = p.data;
  const club = ctx.clubName;
  const hi = `Hello ${firstName(d.name)},`;
  switch (p.template) {
    case 'entry_received':
      return { heading: 'Your entry is reserved.', preheader: `${d.eventTitle}, reference ${d.ref}`, paras: [hi, `We have your entry for ${d.eventTitle}. Your place is held until payment is received.`],
        facts: [['Event', d.eventTitle], ['Date', fmtDate(d.eventDate)], ['Entry', d.format === 'fourball' ? 'Four-ball (team of four)' : 'Single player'], ['Reference', d.ref], ['Amount due', money(d.total)]],
        button: { label: 'Pay online', path: `/events/${d.eventId}#enter` }, note: 'You can also pay at the club. Quote your reference.' };
    case 'payment_receipt':
      return { heading: 'Payment received. Thank you.', preheader: `${money(d.total)} paid, reference ${d.ref}`, paras: [hi, `We have received your payment for ${d.eventTitle}. Keep this email as your receipt.`],
        facts: [['Event', d.eventTitle], ['Date', fmtDate(d.eventDate)], ['Entry reference', d.ref], ...(d.paymentReference ? [['Payment reference', d.paymentReference] as [string, string]] : []), ['Amount paid', money(d.total)]],
        button: { label: 'View the event', path: `/events/${d.eventId}` }, note: 'The club will confirm tee times and format before the event.' };
    case 'payment_reminder':
      return { heading: 'Your entry is still unpaid.', paras: [hi, `Your entry for ${d.eventTitle} on ${fmtDate(d.eventDate)} has not been paid yet. Pay online now, or pay at the club.`],
        facts: [['Reference', d.ref], ['Amount due', money(d.total)]], button: { label: 'Pay online', path: `/events/${d.eventId}#enter` } };
    case 'entrant_reminder':
      return { heading: d.daysLeft === 0 ? 'Your event is today.' : d.daysLeft === 1 ? 'Your event is tomorrow.' : 'Your event is coming up.', paras: [hi, `${d.eventTitle} is on ${fmtDate(d.eventDate)}.`, d.paid ? 'Your entry is paid. We look forward to seeing you.' : 'Your entry is not paid yet. You can pay online or at the club.'],
        facts: [['Event', d.eventTitle], ['Date', fmtDate(d.eventDate)], ['Entry reference', d.ref]], button: { label: 'Event details', path: `/events/${d.eventId}` } };
    case 'booking_received':
      return { heading: 'We have your tee time request.', paras: [hi, 'This is a request. Your tee time is confirmed once the club confirms it.'],
        facts: [['Date', fmtDate(d.date)], ['Tee time', d.time], ['Players', String(d.players)], ['Round', d.holes], ['Reference', d.ref], ['Total, paid at the club', money(d.total)]], button: { label: 'My tee times', path: '/member/tee-times' } };
    case 'booking_confirmed':
      return { heading: 'Your tee time is confirmed.', paras: [hi, 'The club has confirmed your tee time.'],
        facts: [['Date', fmtDate(d.date)], ['Tee time', d.time], ['Players', String(d.players)], ['Round', d.holes], ['Reference', d.ref], ['Total, paid at the club', money(d.total)]], button: { label: 'My tee times', path: '/member/tee-times' } };
    case 'booking_cancelled':
      return { heading: 'Your tee time was cancelled.', paras: [hi, `Your booking ${d.ref} for ${fmtDate(d.date)} at ${d.time} has been cancelled.`, 'You are welcome to book another time.'], button: { label: 'Book a round', path: '/tee-times' } };
    case 'fee_due':
      return { heading: 'A payment is coming due.', paras: [hi, `${d.description} is due on ${fmtDate(d.dueDate)}.`], facts: [['For', d.description], ['Amount', money(d.amount)], ['Due', fmtDate(d.dueDate)]], note: 'Pay at the club or contact the club if you have any questions.' };
    case 'fee_overdue':
      return { heading: 'A payment is overdue.', paras: [hi, `${d.description} was due on ${fmtDate(d.dueDate)} and has not been received.`, 'If you have already paid, please ignore this message.'], facts: [['For', d.description], ['Amount', money(d.amount)], ['Was due', fmtDate(d.dueDate)]], note: 'Pay at the club or contact the club if you have any questions.' };
    case 'event_announce':
      return { heading: `Coming up: ${d.eventTitle}`, preheader: fmtDate(d.eventDate), paras: [hi, `${d.eventTitle} is on ${fmtDate(d.eventDate)}${d.eventTime ? ` at ${d.eventTime}` : ''}.`, ...(d.text ? [d.text] : [])],
        button: { label: d.hasEntry ? 'See details and enter' : 'See details', path: `/events/${d.eventId}` } };
    case 'inactive_member':
      return { heading: 'We would love to see you back.', paras: [hi, `It has been a while since your last round at ${club}. The course is waiting, and so are your playing partners.`], button: { label: 'Book a tee time', path: '/tee-times' } };
    case 'test':
      return { heading: 'This is a test email.', paras: ['If you can read this, email sending is working.', `Sent from the ${club} website.`] };
    default:
      return { heading: p.subject, paras: [] };
  }
}

export function renderEmail(p: Planned, ctx: Ctx): { subject: string; html: string; text: string } {
  const b = content(p, ctx);
  const site = ctx.siteUrl.replace(/\/$/, '');
  const logo = `${site}/images/club-logo.png`;
  const url = b.button ? `${site}${b.button.path}` : '';
  const factsHtml = (b.facts ?? []).map(([k, v]) =>
    `<tr><td style="padding:7px 0;border-bottom:1px solid ${COLOR.line};color:${COLOR.grey};font-size:12px;width:38%">${esc(k)}</td><td style="padding:7px 0;border-bottom:1px solid ${COLOR.line};color:${COLOR.ink};font-size:14px;font-weight:600">${esc(String(v))}</td></tr>`).join('');
  const footerNote = p.category === 'notice'
    ? `You are getting this because you are a member of ${esc(ctx.clubName)}. <a href="${esc(ctx.unsubscribeUrl ?? '#')}" style="color:${COLOR.grey}">Unsubscribe from club news</a>.`
    : `This is a service message about your activity with ${esc(ctx.clubName)}.`;
  const html = `<!doctype html><html><body style="margin:0;background:#F4F4EF;font-family:Arial,Helvetica,sans-serif">
${b.preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(b.preheader)}</div>` : ''}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F4F4EF;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#FFFFFF">
<tr><td style="padding:22px 28px;border-bottom:3px solid ${COLOR.gold}"><table role="presentation" cellpadding="0" cellspacing="0"><tr>
<td style="padding-right:12px"><img src="${esc(logo)}" width="44" height="44" alt="" style="display:block;border:0"></td>
<td style="font-size:17px;font-weight:700;color:${COLOR.ink}">${esc(ctx.clubName)}</td></tr></table></td></tr>
<tr><td style="padding:28px">
<h1 style="margin:0 0 16px;font-size:24px;line-height:1.2;color:${COLOR.ink}">${esc(b.heading)}</h1>
${b.paras.map((t) => `<p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:${COLOR.ink}">${esc(t)}</p>`).join('')}
${factsHtml ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:18px 0">${factsHtml}</table>` : ''}
${b.button ? `<p style="margin:22px 0"><a href="${esc(url)}" style="background:${COLOR.green};color:#FFFFFF;text-decoration:none;font-weight:700;font-size:13px;letter-spacing:1px;padding:14px 22px;display:inline-block">${esc(b.button.label.toUpperCase())}</a></p>` : ''}
${b.note ? `<p style="margin:0;font-size:13px;line-height:1.6;color:${COLOR.grey}">${esc(b.note)}</p>` : ''}
</td></tr>
<tr><td style="padding:18px 28px;background:${COLOR.tint};font-size:11px;line-height:1.6;color:${COLOR.grey}">${footerNote}</td></tr>
</table></td></tr></table></body></html>`;
  const text = [
    b.heading, '', ...b.paras, '',
    ...(b.facts ?? []).map(([k, v]) => `${k}: ${v}`), ...(b.facts?.length ? [''] : []),
    ...(b.button ? [`${b.button.label}: ${url}`, ''] : []),
    ...(b.note ? [b.note, ''] : []),
    '--', ctx.clubName,
    ...(p.category === 'notice' && ctx.unsubscribeUrl ? [`Unsubscribe from club news: ${ctx.unsubscribeUrl}`] : []),
  ].join('\n');
  return { subject: p.subject, html, text };
}

/* ------------------------------------------------------------------ providers */

export function makeProvider(env: Pick<Env, 'provider' | 'providerKey'>, fetcher: Fetch): Provider | null {
  if (env.provider === 'resend') {
    return {
      name: 'resend',
      async send(m) {
        const res = await fetcher('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${env.providerKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: `${m.from.name} <${m.from.email}>`, to: [m.to.name ? `${m.to.name} <${m.to.email}>` : m.to.email],
            subject: m.subject, html: m.html, text: m.text, ...(m.replyTo ? { reply_to: m.replyTo } : {}), ...(m.headers ? { headers: m.headers } : {}),
          }),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(`Resend ${res.status}: ${body?.message ?? body?.error ?? 'send failed'}`);
        return { id: String(body.id ?? '') };
      },
    };
  }
  if (env.provider === 'brevo') {
    return {
      name: 'brevo',
      async send(m) {
        const res = await fetcher('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: { 'api-key': env.providerKey, 'Content-Type': 'application/json', accept: 'application/json' },
          body: JSON.stringify({
            sender: { name: m.from.name, email: m.from.email }, to: [{ email: m.to.email, ...(m.to.name ? { name: m.to.name } : {}) }],
            subject: m.subject, htmlContent: m.html, textContent: m.text, ...(m.replyTo ? { replyTo: { email: m.replyTo } } : {}), ...(m.headers ? { headers: m.headers } : {}),
          }),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(`Brevo ${res.status}: ${body?.message ?? 'send failed'}`);
        return { id: String(body.messageId ?? '') };
      },
    };
  }
  return null;
}

/* ------------------------------------------------------------------ runner */

export type RunSummary = { ok: true; dryRun: boolean; planned: number; recorded: number; sent: number; failed: number; skipped: number; capLeft: number } | { ok: false; error: string };

async function buildRow(p: Planned, env: Env, dry: boolean): Promise<OutboxRow> {
  const token = await makeUnsubscribeToken(p.toEmail, env.unsubscribeSecret);
  const ctx: Ctx = { siteUrl: env.siteUrl, clubName: env.clubName, unsubscribeUrl: `${env.siteUrl}/unsubscribe?token=${token}` };
  const r = renderEmail(p, ctx);
  return { dedupe_key: p.dedupeKey, dry, category: p.category, template: p.template, to_email: p.toEmail, to_name: p.toName, subject: r.subject, html: r.html, text: r.text, status: dry ? 'dry_run' : 'queued', attempts: 0 };
}

export async function runMailer(env: Env, store: Store, fetcher: Fetch, now = Date.now()): Promise<RunSummary> {
  if (!env.dryRun) {
    if (!env.fromEmail) return { ok: false, error: 'EMAIL_FROM is not set. Emails cannot be sent without a sender address.' };
    if (!env.providerKey || env.provider === 'none') return { ok: false, error: 'No email provider is configured (EMAIL_PROVIDER and EMAIL_PROVIDER_KEY).' };
  }
  const snap = await store.snapshot();
  const optedOut = await store.optedOut();
  const planned = planEmails(snap, now, { inactivityOn: env.inactivityOn });
  const wanted = planned.filter((p) => p.category === 'transactional' || !optedOut.has(p.toEmail));
  const rows: OutboxRow[] = [];
  for (const p of wanted) rows.push(await buildRow(p, env, env.dryRun));
  const recorded = rows.length ? await store.insertOutbox(rows) : 0;

  if (env.dryRun) return { ok: true, dryRun: true, planned: planned.length, recorded, sent: 0, failed: 0, skipped: planned.length - wanted.length, capLeft: env.dailyCap };

  const provider = makeProvider(env, fetcher);
  if (!provider) return { ok: false, error: 'Unknown email provider.' };
  const dayStart = new Date(`${clubToday(now)}T00:00:00+02:00`).toISOString();
  const sentToday = await store.sentSince(dayStart);
  let capLeft = Math.max(0, env.dailyCap - sentToday);
  let sent = 0, failed = 0, skipped = 0;
  const queue = capLeft > 0 ? await store.queued(Math.min(env.batchSize, capLeft)) : [];
  for (const row of queue) {
    if (row.category === 'notice' && (await store.optedOut()).has(row.to_email)) { await store.markSkipped(row.id!, 'opted out'); skipped++; continue; }
    const token = await makeUnsubscribeToken(row.to_email, env.unsubscribeSecret);
    const headers = row.category === 'notice'
      ? { 'List-Unsubscribe': `<${env.functionUrl}/unsubscribe?token=${token}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' }
      : undefined;
    try {
      const r = await provider.send({ from: { name: env.fromName, email: env.fromEmail }, replyTo: env.replyTo || undefined, to: { email: row.to_email, name: row.to_name || undefined }, subject: row.subject, html: row.html, text: row.text, headers });
      await store.markSent(row.id!, r.id);
      sent++; capLeft--;
    } catch (e) {
      const attempts = row.attempts + 1;
      await store.markFailed(row.id!, attempts, attempts >= 3, e instanceof Error ? e.message : String(e));
      failed++;
    }
  }
  return { ok: true, dryRun: false, planned: planned.length, recorded, sent, failed, skipped, capLeft };
}

/* ------------------------------------------------------------------ HTTP handler */

function sameSecret(a: string, b: string): boolean {
  if (!a || !b || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function handle(req: Request, env: Env, store: Store, fetcher: Fetch, now = Date.now()): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return problem(405, 'Use POST.');
  const url = new URL(req.url);
  const route = url.pathname.replace(/\/+$/, '').split('/').pop() ?? '';
  let body: any = {};
  try { const t = await req.text(); body = t ? (t.trim().startsWith('{') ? JSON.parse(t) : Object.fromEntries(new URLSearchParams(t))) : {}; } catch { return problem(400, 'Could not read the request.'); }

  const bearer = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '');
  const staff = async () => (bearer ? store.staffFromToken(bearer) : null);

  try {
    if (route === 'unsubscribe') {
      const token = String(body.token ?? url.searchParams.get('token') ?? '');
      const email = await readUnsubscribeToken(token, env.unsubscribeSecret);
      if (!email) return problem(400, 'This unsubscribe link is not valid.');
      await store.addOptOut(email);
      return json({ ok: true, email });
    }

    if (route === 'run') {
      const viaCron = sameSecret(req.headers.get('x-cron-secret') ?? '', env.cronSecret);
      if (!viaCron && !(await staff())) return problem(401, 'Not allowed.');
      const r = await runMailer(env, store, fetcher, now);
      return json(r, r.ok ? 200 : 400);
    }

    if (route === 'status') {
      if (!(await staff())) return problem(401, 'Staff only.');
      const dayStart = new Date(`${clubToday(now)}T00:00:00+02:00`).toISOString();
      return json({
        ok: true, dryRun: env.dryRun, provider: env.provider, providerKeySet: Boolean(env.providerKey), from: env.fromEmail, fromName: env.fromName, replyTo: env.replyTo,
        siteUrl: env.siteUrl, inactivityOn: env.inactivityOn, dailyCap: env.dailyCap, sentToday: await store.sentSince(dayStart),
        cronSecretSet: Boolean(env.cronSecret), counts: await store.counts(), rules: RULES,
      });
    }

    if (route === 'test') {
      const who = await staff();
      if (!who) return problem(401, 'Staff only.');
      const to = String(body.to ?? who.email);
      if (!emailOk(to)) return problem(400, 'Enter a valid email address.');
      const p: Planned = { dedupeKey: `test:${now}:${Math.random().toString(36).slice(2, 8)}`, category: 'transactional', template: 'test', toEmail: norm(to), toName: '', subject: `Test email from ${env.clubName}`, data: {} };
      const row = await buildRow(p, env, env.dryRun);
      if (env.dryRun) {
        await store.insertOutbox([row]);
        return json({ ok: true, sent: false, dryRun: true, message: 'Dry run is on, so the email was recorded but not sent. See it under Recent emails.' });
      }
      if (!env.fromEmail || !env.providerKey) return problem(400, 'Set EMAIL_FROM and the provider key first.');
      const provider = makeProvider(env, fetcher);
      if (!provider) return problem(400, 'Unknown email provider.');
      const r = await provider.send({ from: { name: env.fromName, email: env.fromEmail }, replyTo: env.replyTo || undefined, to: { email: row.to_email }, subject: row.subject, html: row.html, text: row.text });
      await store.insertOutbox([{ ...row, status: 'sent' }]);
      return json({ ok: true, sent: true, dryRun: false, id: r.id, message: `Sent to ${row.to_email}.` });
    }
    return problem(404, 'Unknown route.');
  } catch (e) {
    return problem(500, e instanceof Error ? e.message : 'Something went wrong.');
  }
}

/* ------------------------------------------------------------------ Deno wiring (runs only on Supabase) */

declare const Deno: any;
if (typeof Deno !== 'undefined') {
  // @ts-ignore: resolved by Deno at run time
  const { createClient } = await import('npm:@supabase/supabase-js@2');
  const url = Deno.env.get('SUPABASE_URL') as string;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
  const db = createClient(url, serviceKey);
  const get = (k: string, d = '') => Deno.env.get(k) ?? d;
  const provider = get('EMAIL_PROVIDER', 'none').toLowerCase();
  const env: Env = {
    dryRun: get('EMAIL_DRY_RUN', 'true').toLowerCase() !== 'false',
    provider: provider === 'resend' || provider === 'brevo' ? provider : 'none',
    providerKey: get('EMAIL_PROVIDER_KEY'),
    fromEmail: get('EMAIL_FROM'),
    fromName: get('EMAIL_FROM_NAME', 'Chinhoyi Country Club'),
    replyTo: get('EMAIL_REPLY_TO'),
    siteUrl: get('SITE_URL').replace(/\/$/, ''),
    clubName: get('CLUB_NAME', 'Chinhoyi Country Club'),
    functionUrl: `${url}/functions/v1/mailer`,
    cronSecret: get('CRON_SECRET'),
    unsubscribeSecret: get('UNSUBSCRIBE_SECRET') || serviceKey,
    dailyCap: Math.max(1, Number(get('EMAIL_DAILY_CAP', '50')) || 50),
    batchSize: Math.max(1, Number(get('EMAIL_BATCH_SIZE', '25')) || 25),
    inactivityOn: get('EMAIL_INACTIVITY', 'off').toLowerCase() === 'on',
  };

  const collection = async (name: string): Promise<any[]> => {
    const { data } = await db.from('ccc_docs').select('data').eq('collection', name).limit(5000);
    return (data ?? []).map((r: any) => r.data).filter((d: any) => d && typeof d === 'object' && !d._meta);
  };

  const store: Store = {
    async snapshot() {
      const [events, entries, bookings, fees, profiles] = await Promise.all([
        collection('events'), collection('event-entries'), collection('bookings'), collection('fees'),
        db.from('profiles').select('id,email,full_name,created_at').eq('role', 'member').limit(5000),
      ]);
      return {
        events, entries, bookings, fees,
        members: ((profiles as any).data ?? []).filter((p: any) => p.email).map((p: any) => ({ id: p.id, email: p.email, fullName: p.full_name ?? '', createdAt: p.created_at })),
      };
    },
    async optedOut() {
      const { data } = await db.from('email_optout').select('email').limit(20000);
      return new Set<string>((data ?? []).map((r: any) => String(r.email).toLowerCase()));
    },
    async addOptOut(email) { await db.from('email_optout').upsert({ email: norm(email) }); },
    async insertOutbox(rows) {
      const { data, error } = await db.from('email_outbox').upsert(rows, { onConflict: 'dedupe_key,dry', ignoreDuplicates: true }).select('id');
      if (error) throw new Error(error.message);
      return data?.length ?? 0;
    },
    async queued(limit) {
      const { data } = await db.from('email_outbox').select('*').eq('status', 'queued').eq('dry', false).order('created_at').limit(limit);
      return (data ?? []) as OutboxRow[];
    },
    async sentSince(iso) {
      const { count } = await db.from('email_outbox').select('id', { count: 'exact', head: true }).eq('status', 'sent').gte('sent_at', iso);
      return count ?? 0;
    },
    async counts() {
      const out: Record<string, number> = {};
      for (const s of ['queued', 'sent', 'failed', 'dry_run', 'skipped']) {
        const { count } = await db.from('email_outbox').select('id', { count: 'exact', head: true }).eq('status', s);
        out[s] = count ?? 0;
      }
      return out;
    },
    async markSent(id, providerId) { await db.from('email_outbox').update({ status: 'sent', provider_id: providerId, sent_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', id); },
    async markFailed(id, attempts, final, error) { await db.from('email_outbox').update({ status: final ? 'failed' : 'queued', attempts, last_error: error.slice(0, 500), updated_at: new Date().toISOString() }).eq('id', id); },
    async markSkipped(id, reason) { await db.from('email_outbox').update({ status: 'skipped', last_error: reason, updated_at: new Date().toISOString() }).eq('id', id); },
    async staffFromToken(jwt) {
      const { data } = await db.auth.getUser(jwt);
      const user = data?.user;
      if (!user) return null;
      const { data: p } = await db.from('profiles').select('role,email').eq('id', user.id).maybeSingle();
      return p && p.role && p.role !== 'member' ? { email: p.email ?? user.email ?? '' } : null;
    },
  };
  Deno.serve((req: Request) => handle(req, env, store, fetch));
}
