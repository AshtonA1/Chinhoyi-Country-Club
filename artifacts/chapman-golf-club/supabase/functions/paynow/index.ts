// Paynow payments for Chinhoyi Country Club (Supabase Edge Function).
//
// One function, three routes:
//   POST /paynow/initiate  start a payment for an event entry (called by the website)
//   POST /paynow/status    ask where a payment stands          (called by the website)
//   POST /paynow/callback  Paynow reports a payment update     (called by Paynow, not the browser)
//
// Rules this code follows:
//  - The AMOUNT always comes from the event's price in the database, never from the browser.
//  - A "paid" message from Paynow is never taken on trust: we ask Paynow directly
//    (the poll URL) and check the amount before marking anything paid.
//  - Every Paynow reply and callback must carry a valid hash, made with the integration key.
//  - The integration key lives only in this function's secrets, never in the website.

const INITIATE_URL = 'https://www.paynow.co.zw/interface/initiatetransaction';
const MOBILE_URL = 'https://www.paynow.co.zw/interface/remotetransaction';
const PAYNOW_ORIGIN = 'https://www.paynow.co.zw/';

export type Env = {
  id: string;            // Paynow integration ID
  key: string;           // Paynow integration key
  siteUrl: string;       // the website, e.g. https://chinhoyi-country-club.vercel.app
  functionUrl: string;   // this function, e.g. https://xxxx.supabase.co/functions/v1/paynow
  testMode: boolean;     // Paynow test mode: authemail must be the merchant's own email
  testEmail: string;
};

export type Payment = {
  reference: string;
  kind: string;
  target_collection: string;
  target_id: string;
  amount: number;
  currency: string;
  method: string;
  status: 'created' | 'pending' | 'paid' | 'failed' | 'refunded' | 'review';
  paynow_reference?: string | null;
  poll_url?: string | null;
  browser_url?: string | null;
  payer_phone?: string | null;
  payer_email?: string | null;
  note?: string | null;
};

export interface Store {
  getDoc(collection: string, id: string): Promise<any | null>;
  setDoc(collection: string, id: string, data: any): Promise<void>;
  insertPayment(p: Payment): Promise<void>;
  getPayment(reference: string): Promise<Payment | null>;
  updatePayment(reference: string, patch: Partial<Payment>): Promise<void>;
}

type Fetch = typeof fetch;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });
}
const problem = (status: number, error: string) => json({ ok: false, error }, status);

// ---------- Paynow hash (SHA-512, uppercase hex, values joined in order, then the key) ----------

export async function makeHash(values: string[], key: string): Promise<string> {
  const data = new TextEncoder().encode(values.join('') + key.toLowerCase());
  const digest = await crypto.subtle.digest('SHA-512', data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}

/** Reads a Paynow reply (a URL-encoded string) and checks its hash. Error replies carry no hash. */
export async function parseReply(text: string, key: string): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  const values: string[] = [];
  new URLSearchParams(text).forEach((v, k) => {
    out[k.toLowerCase()] = v;
    if (k.toLowerCase() !== 'hash') values.push(v);
  });
  if ((out.status ?? '').toLowerCase() === 'error') return out;
  if (!out.hash) throw new Error('Paynow reply had no hash');
  if ((await makeHash(values, key)) !== out.hash.toUpperCase()) throw new Error('Paynow reply failed the hash check');
  return out;
}

async function paynowPost(url: string, fields: [string, string][], env: Env, f: Fetch, withHash = true): Promise<Record<string, string>> {
  const body = new URLSearchParams();
  fields.forEach(([k, v]) => body.append(k, v));
  if (withHash) body.append('hash', await makeHash(fields.map(([, v]) => v), env.key));
  const res = await f(url, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body.toString() });
  return parseReply(await res.text(), env.key);
}

// ---------- Status ----------

export function mapStatus(paynowStatus: string): 'paid' | 'failed' | 'refunded' | 'pending' {
  const s = paynowStatus.trim().toLowerCase();
  if (s === 'paid' || s === 'awaiting delivery' || s === 'delivered') return 'paid';
  if (s === 'refunded') return 'refunded';
  if (s === 'cancelled' || s === 'failed' || s === 'disputed') return 'failed';
  return 'pending'; // created, sent
}

/** Normalises 0771234567 / +263771234567 / 263 77 123 4567 to 0771234567. */
export function normalisePhone(raw: string): string | null {
  let d = raw.replace(/\D/g, '');
  if (d.startsWith('263')) d = '0' + d.slice(3);
  return /^07\d{8}$/.test(d) ? d : null;
}

async function markEntryPaid(p: Payment, store: Store): Promise<void> {
  const entry = await store.getDoc(p.target_collection, p.target_id);
  if (entry && entry.status !== 'paid') {
    await store.setDoc(p.target_collection, p.target_id, { ...entry, status: 'paid', paidAt: new Date().toISOString(), paymentReference: p.reference });
  }
}

/** Ask Paynow where the payment stands, and record the answer. Never trusts the browser or the callback. */
export async function settle(p: Payment, env: Env, store: Store, f: Fetch): Promise<Payment> {
  if (p.status === 'paid' || p.status === 'failed' || !p.poll_url || !p.poll_url.startsWith(PAYNOW_ORIGIN)) return p;
  const reply = await paynowPost(p.poll_url, [], env, f, false);
  if ((reply.status ?? '').toLowerCase() === 'error') return p;
  const next = mapStatus(reply.status ?? '');
  if (next === 'paid') {
    if (Math.abs(parseFloat(reply.amount ?? 'NaN') - p.amount) > 0.005) {
      const review = { status: 'review' as const, note: `Paynow reported ${reply.amount} but ${p.amount.toFixed(2)} was expected` };
      await store.updatePayment(p.reference, review);
      return { ...p, ...review };
    }
    const done = { status: 'paid' as const, paynow_reference: reply.paynowreference ?? p.paynow_reference ?? null };
    await store.updatePayment(p.reference, done);
    await markEntryPaid(p, store);
    return { ...p, ...done };
  }
  if (next !== 'pending' && next !== p.status) {
    await store.updatePayment(p.reference, { status: next });
    return { ...p, status: next };
  }
  return p;
}

// ---------- Routes ----------

async function initiate(body: any, env: Env, store: Store, f: Fetch): Promise<Response> {
  const entryId = String(body?.entryId ?? '');
  const method = String(body?.method ?? '');
  if (!['ecocash', 'onemoney', 'web'].includes(method)) return problem(400, 'Choose a payment method.');
  const entry = entryId ? await store.getDoc('event-entries', entryId) : null;
  if (!entry) return problem(404, 'We could not find that entry yet. Please try again in a moment.');
  if (entry.status === 'paid') return problem(409, 'This entry is already paid.');
  if (entry.status !== 'pending_payment') return problem(409, 'This entry can no longer be paid online.');

  const event = await store.getDoc('events', entry.eventId);
  const price = event ? (entry.format === 'fourball' ? event.fourBallPrice : event.singlePrice) : undefined;
  if (typeof price !== 'number' || !(price > 0)) return problem(422, 'The club has not set a price for this entry yet. Please contact the club.');

  const mobile = method !== 'web';
  let phone = '';
  if (mobile) {
    const n = normalisePhone(String(body?.phone ?? ''));
    if (!n) return problem(422, 'Enter the mobile money number as 0771234567.');
    phone = n;
  }
  const payerEmail = String(entry.email ?? '');
  const authEmail = env.testMode ? env.testEmail : payerEmail;
  if (!authEmail.includes('@')) return problem(422, 'A valid email address is needed to take payment.');

  const reference = `${entry.ref}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const payment: Payment = {
    reference, kind: 'event-entry', target_collection: 'event-entries', target_id: entryId,
    amount: price, currency: 'USD', method, status: 'created', payer_phone: phone || null, payer_email: payerEmail || null,
  };
  await store.insertPayment(payment);

  const fields: [string, string][] = [
    ['resulturl', `${env.functionUrl}/callback`],
    ['returnurl', `${env.siteUrl}/pay/return?ref=${encodeURIComponent(reference)}`],
    ['reference', reference],
    ['amount', price.toFixed(2)],
    ['id', env.id],
    ['additionalinfo', `${event.title} entry ${entry.ref}`.slice(0, 100)],
    ['authemail', authEmail],
    ...(mobile ? ([['phone', phone], ['method', method]] as [string, string][]) : []),
    ['status', 'Message'],
  ];
  const reply = await paynowPost(mobile ? MOBILE_URL : INITIATE_URL, fields, env, f);
  if ((reply.status ?? '').toLowerCase() !== 'ok') {
    const note = reply.error || 'Paynow refused the request';
    await store.updatePayment(reference, { status: 'failed', note });
    return problem(502, `Paynow could not start the payment: ${note}`);
  }
  await store.updatePayment(reference, { status: 'pending', poll_url: reply.pollurl ?? null, browser_url: reply.browserurl ?? null });
  return json({
    ok: true, reference, amount: price, currency: 'USD',
    redirectUrl: mobile ? undefined : reply.browserurl,
    instructions: mobile ? reply.instructions : undefined,
  });
}

async function status(body: any, env: Env, store: Store, f: Fetch): Promise<Response> {
  const p = await store.getPayment(String(body?.reference ?? ''));
  if (!p) return problem(404, 'Payment not found.');
  const settled = await settle(p, env, store, f);
  return json({ ok: true, reference: settled.reference, status: settled.status, amount: settled.amount });
}

async function callback(text: string, env: Env, store: Store, f: Fetch): Promise<Response> {
  let reply: Record<string, string>;
  try {
    reply = await parseReply(text, env.key);
  } catch {
    return problem(400, 'Bad hash');
  }
  const p = await store.getPayment(reply.reference ?? '');
  if (p) await settle(p, env, store, f); // the callback is only a nudge: Paynow is asked directly
  return new Response('OK', { status: 200, headers: CORS });
}

export async function handle(req: Request, env: Env, store: Store, f: Fetch): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return problem(405, 'POST only');
  const route = new URL(req.url).pathname.replace(/\/+$/, '').split('/').pop();
  try {
    if (route === 'callback') return await callback(await req.text(), env, store, f);
    const body = await req.json().catch(() => ({}));
    if (route === 'initiate') return await initiate(body, env, store, f);
    if (route === 'status') return await status(body, env, store, f);
    return problem(404, 'Unknown route');
  } catch (e) {
    console.error('[paynow]', e instanceof Error ? e.message : e);
    return problem(500, 'The payment service had a problem. Please try again.');
  }
}

// ---------- Wiring (runs only inside Supabase, not in tests) ----------

declare const Deno: any;
if (typeof Deno !== 'undefined') {
  // @ts-ignore: resolved by Deno at run time
  const { createClient } = await import('npm:@supabase/supabase-js@2');
  const url = Deno.env.get('SUPABASE_URL') as string;
  const db = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string);
  const env: Env = {
    id: Deno.env.get('PAYNOW_ID') ?? '',
    key: Deno.env.get('PAYNOW_KEY') ?? '',
    siteUrl: (Deno.env.get('SITE_URL') ?? '').replace(/\/$/, ''),
    functionUrl: `${url}/functions/v1/paynow`,
    testMode: (Deno.env.get('PAYNOW_MODE') ?? 'test') !== 'live',
    testEmail: Deno.env.get('PAYNOW_TEST_EMAIL') ?? '',
  };
  const store: Store = {
    async getDoc(collection, id) {
      const { data } = await db.from('ccc_docs').select('data').eq('collection', collection).eq('id', id).maybeSingle();
      return data?.data ?? null;
    },
    async setDoc(collection, id, data) {
      await db.from('ccc_docs').update({ data, updated_at: new Date().toISOString() }).eq('collection', collection).eq('id', id);
    },
    async insertPayment(p) {
      const { error } = await db.from('payments').insert(p);
      if (error) throw new Error(error.message);
    },
    async getPayment(reference) {
      const { data } = await db.from('payments').select('*').eq('reference', reference).maybeSingle();
      return (data as Payment) ?? null;
    },
    async updatePayment(reference, patch) {
      await db.from('payments').update({ ...patch, updated_at: new Date().toISOString() }).eq('reference', reference);
    },
  };
  Deno.serve((req: Request) => handle(req, env, store, fetch));
}
