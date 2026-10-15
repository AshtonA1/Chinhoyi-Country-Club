import { supabase } from '@/lib/supabase';

export type PayMethod = 'ecocash' | 'onemoney' | 'web';
export type PaymentStatus = 'created' | 'pending' | 'paid' | 'failed' | 'refunded' | 'review';

type Result<T> = { ok: true; data: T } | { ok: false; error: string };

/** Calls the Paynow function on Supabase and turns every failure into a readable message. */
async function call<T>(route: string, body: Record<string, unknown>): Promise<Result<T>> {
  if (!supabase) return { ok: false, error: 'Online payment is not available yet.' };
  const { data, error } = await supabase.functions.invoke(`paynow/${route}`, { body });
  if (error) {
    let message = 'Could not reach the payment service. Check your connection and try again.';
    try {
      const ctx = (error as { context?: Response }).context;
      if (ctx && typeof ctx.json === 'function') {
        const j = (await ctx.json()) as { error?: string };
        if (j?.error) message = j.error;
      }
    } catch { /* keep the generic message */ }
    return { ok: false, error: message };
  }
  if (data && data.ok === false) return { ok: false, error: String(data.error ?? 'Payment failed.') };
  return { ok: true, data: data as T };
}

export type StartResult = { reference: string; amount: number; currency: string; redirectUrl?: string; instructions?: string };

/**
 * Starts a payment for an event entry. The amount is decided by the server, not here.
 * The entry is saved in the background, so if the server has not got it yet we try again a few times.
 */
export async function startPayment(entryId: string, method: PayMethod, phone?: string): Promise<Result<StartResult>> {
  let last: Result<StartResult> = { ok: false, error: 'Could not start the payment.' };
  for (let attempt = 0; attempt < 4; attempt++) {
    last = await call<StartResult>('initiate', { entryId, method, phone });
    if (last.ok || !/could not find that entry/i.test(last.error)) return last;
    await new Promise((r) => setTimeout(r, 1200));
  }
  return last;
}

export async function checkPayment(reference: string): Promise<Result<{ status: PaymentStatus; amount: number }>> {
  return call('status', { reference });
}
