import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/** Vite fills these in at build time. The try/catch keeps tools that run outside Vite (tests) from crashing. */
function readSettings(): { url?: string; anonKey?: string } {
  try {
    return {
      url: import.meta.env.VITE_SUPABASE_URL as string | undefined,
      anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined,
    };
  } catch {
    return {};
  }
}
const { url, anonKey } = readSettings();

/**
 * The Supabase client, or null when the two VITE_SUPABASE_* settings are missing.
 * Without them the site runs in demo mode: data stays in the visitor's browser.
 */
export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey, { auth: { persistSession: true, autoRefreshToken: true } }) : null;

export const backendConfigured = supabase !== null;

/**
 * Online payment (Paynow) is switched on by setting VITE_ONLINE_PAYMENTS=on, after the
 * payment function is deployed (see supabase/functions/paynow). Until then entries stay
 * "awaiting payment" and the club follows up.
 */
function readPaymentsFlag(): boolean {
  try { return import.meta.env.VITE_ONLINE_PAYMENTS === 'on'; } catch { return false; }
}
export const paymentsEnabled = supabase !== null && readPaymentsFlag();

/** Tell the UI that a save to the server failed (shown by <RemoteErrorBanner />). */
export function reportRemoteError(message: string): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('ccc:remote-error', { detail: { message } }));
}
