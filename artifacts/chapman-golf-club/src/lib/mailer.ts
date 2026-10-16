import { supabase } from '@/lib/supabase';

type Result<T> = { ok: true; data: T } | { ok: false; error: string };

/** Calls the mailer function on Supabase and turns every failure into a readable message. */
export async function mailerCall<T>(route: string, body: Record<string, unknown> = {}): Promise<Result<T>> {
  if (!supabase) return { ok: false, error: 'Email needs the live backend (Supabase), which is not connected.' };
  const { data, error } = await supabase.functions.invoke(`mailer/${route}`, { body });
  if (error) {
    let message = 'Could not reach the email service. Check your connection and that the "mailer" function is deployed.';
    try {
      const ctx = (error as { context?: Response }).context;
      if (ctx && typeof ctx.json === 'function') {
        const j = (await ctx.json()) as { error?: string };
        if (j?.error) message = j.error;
      }
    } catch { /* keep the generic message */ }
    return { ok: false, error: message };
  }
  if (data && data.ok === false) return { ok: false, error: String(data.error ?? 'The email service refused the request.') };
  return { ok: true, data: data as T };
}

export type MailerStatus = {
  dryRun: boolean;
  provider: 'resend' | 'brevo' | 'none';
  providerKeySet: boolean;
  from: string;
  fromName: string;
  replyTo: string;
  siteUrl: string;
  inactivityOn: boolean;
  dailyCap: number;
  sentToday: number;
  cronSecretSet: boolean;
  counts: Record<string, number>;
};

export type RunSummary = { dryRun: boolean; planned: number; recorded: number; sent: number; failed: number; skipped: number; capLeft: number };

export type OutboxItem = {
  id: string;
  created_at: string;
  to_email: string;
  subject: string;
  template: string;
  category: 'transactional' | 'notice';
  status: 'queued' | 'sent' | 'failed' | 'dry_run' | 'skipped';
  attempts: number;
  last_error: string | null;
  dry: boolean;
};

/** What still has to be set before emails can really be sent. Empty = ready. */
export function setupGaps(s: MailerStatus): string[] {
  const gaps: string[] = [];
  if (s.provider === 'none') gaps.push('Choose an email provider (secret EMAIL_PROVIDER = resend or brevo).');
  if (!s.providerKeySet) gaps.push('Add the provider key (secret EMAIL_PROVIDER_KEY).');
  if (!s.from) gaps.push('Set the sender address (secret EMAIL_FROM), on a domain you have verified with the provider.');
  if (!s.siteUrl) gaps.push('Set the website address (secret SITE_URL) so links and the logo work inside emails.');
  if (!s.cronSecretSet) gaps.push('Set a schedule password (secret CRON_SECRET) so the timer can run the mailer.');
  return gaps;
}
