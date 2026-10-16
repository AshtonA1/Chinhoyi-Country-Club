import { useCallback, useEffect, useState } from 'react';
import { CircleAlert, CircleCheck, Mail, RefreshCw } from 'lucide-react';
import { AdminShell, PortalHeading } from './AdminShell';
import { GhostButton, Panel, PrimaryButton, TextField } from '@/components/admin/Form';
import { PortalStat } from '@/components/layout/Portal';
import { mailerCall, setupGaps, type MailerStatus, type OutboxItem, type RunSummary } from '@/lib/mailer';
import { useCan } from '@/lib/permissions';
import { backendConfigured, supabase } from '@/lib/supabase';

const STATUS_STYLE: Record<OutboxItem['status'], string> = {
  sent: 'bg-club-green text-white',
  queued: 'bg-club-gold text-club-ink',
  failed: 'bg-club-alert text-white',
  dry_run: 'border border-club-ink/30 text-club-ink/70',
  skipped: 'border border-club-ink/30 text-club-ink/70',
};
const STATUS_LABEL: Record<OutboxItem['status'], string> = { sent: 'SENT', queued: 'QUEUED', failed: 'FAILED', dry_run: 'DRY RUN', skipped: 'SKIPPED' };

const when = (iso: string) => new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

export default function AdminEmails() {
  const canWrite = useCan('settings', 'write');
  const [status, setStatus] = useState<MailerStatus | null>(null);
  const [rows, setRows] = useState<OutboxItem[]>([]);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [testTo, setTestTo] = useState('');
  const [preview, setPreview] = useState<{ subject: string; html: string } | null>(null);

  const load = useCallback(async () => {
    if (!supabase) return;
    setError('');
    const s = await mailerCall<MailerStatus & { ok: true }>('status');
    if (s.ok) setStatus(s.data); else setError(s.error);
    const { data, error: e } = await supabase
      .from('email_outbox')
      .select('id,created_at,to_email,subject,template,category,status,attempts,last_error,dry')
      .order('created_at', { ascending: false })
      .limit(60);
    if (e) setError((prev) => prev || `Could not read the email list: ${e.message}. Has supabase/emails.sql been run?`);
    else setRows((data ?? []) as OutboxItem[]);
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function runNow() {
    setBusy(true); setNote('');
    const r = await mailerCall<RunSummary>('run');
    setBusy(false);
    if (!r.ok) return setNote(r.error);
    const d = r.data;
    setNote(d.dryRun
      ? `Dry run: ${d.planned} email(s) due, ${d.recorded} new record(s). Nothing was sent.`
      : `Planned ${d.planned}, sent ${d.sent}, failed ${d.failed}, skipped ${d.skipped}.`);
    await load();
  }

  async function sendTest() {
    setBusy(true); setNote('');
    const r = await mailerCall<{ message: string }>('test', testTo.trim() ? { to: testTo.trim() } : {});
    setBusy(false);
    setNote(r.ok ? r.data.message : r.error);
    await load();
  }

  async function openPreview(item: OutboxItem) {
    if (!supabase) return;
    const { data } = await supabase.from('email_outbox').select('html').eq('id', item.id).maybeSingle();
    if (data?.html) setPreview({ subject: item.subject, html: data.html as string });
  }

  async function retry(item: OutboxItem) {
    if (!supabase) return;
    const { error: e } = await supabase.from('email_outbox').update({ status: 'queued', attempts: 0, last_error: null }).eq('id', item.id).eq('status', 'failed');
    setNote(e ? `Could not requeue: ${e.message}` : 'Put back in the queue. It goes out on the next run.');
    await load();
  }

  const gaps = status ? setupGaps(status) : [];

  return (
    <AdminShell>
      <PortalHeading
        eyebrow="ADMIN PORTAL / EMAILS"
        title="Emails from the club."
        copy="Receipts, booking and entry messages, event reminders and club news. In dry run the system works out what it would send and records it here, but sends nothing."
        action={backendConfigured ? <GhostButton onClick={() => void load()}><RefreshCw size={14} /> REFRESH</GhostButton> : undefined}
      />

      {!backendConfigured && (
        <div className="mt-8 border border-club-gold bg-club-gold/10 p-5 text-sm leading-6 text-club-ink" data-testid="emails-demo">
          <strong>Email needs the live backend.</strong> This site is running in demo mode, so there is nothing to send from. Once Supabase is connected (see SETUP.md), this page shows every email the club has sent or is about to send.
        </div>
      )}

      {backendConfigured && (
        <>
          {error && <p role="alert" className="mt-6 border-l-2 border-club-alert bg-club-alert/5 px-4 py-3 text-sm text-club-alert">{error}</p>}

          {status && (
            <div className="mt-8 grid gap-3 md:grid-cols-4">
              <PortalStat label="MODE" value={status.dryRun ? 'DRY RUN' : 'LIVE'} note={status.dryRun ? 'Nothing is being sent' : 'Real emails are going out'} dark={status.dryRun} />
              <PortalStat label="SENT TODAY" value={`${status.sentToday} / ${status.dailyCap}`} note="Daily limit protects against mistakes" />
              <PortalStat label="QUEUED" value={String(status.counts.queued ?? 0)} note={`${status.counts.failed ?? 0} failed`} />
              <PortalStat label="DRY-RUN RECORDS" value={String(status.counts.dry_run ?? 0)} note="Would have been sent" />
            </div>
          )}

          {status && (
            <div className="mt-8 grid gap-4 lg:grid-cols-2">
              <Panel title="Setup">
                <ul className="grid gap-2 text-sm">
                  <li className="flex items-center gap-2">{status.provider !== 'none' ? <CircleCheck size={16} className="text-club-green" /> : <CircleAlert size={16} className="text-club-alert" />} Provider: <strong>{status.provider === 'none' ? 'not chosen' : status.provider}</strong></li>
                  <li className="flex items-center gap-2">{status.providerKeySet ? <CircleCheck size={16} className="text-club-green" /> : <CircleAlert size={16} className="text-club-alert" />} Provider key {status.providerKeySet ? 'set' : 'missing'}</li>
                  <li className="flex items-center gap-2">{status.from ? <CircleCheck size={16} className="text-club-green" /> : <CircleAlert size={16} className="text-club-alert" />} Sender: <strong>{status.from ? `${status.fromName} <${status.from}>` : 'not set'}</strong></li>
                  <li className="flex items-center gap-2">{status.siteUrl ? <CircleCheck size={16} className="text-club-green" /> : <CircleAlert size={16} className="text-club-alert" />} Website address {status.siteUrl ? status.siteUrl : 'missing'}</li>
                  <li className="flex items-center gap-2">{status.cronSecretSet ? <CircleCheck size={16} className="text-club-green" /> : <CircleAlert size={16} className="text-club-alert" />} Schedule password {status.cronSecretSet ? 'set' : 'missing'}</li>
                  <li className="flex items-center gap-2"><CircleCheck size={16} className="text-club-ink/40" /> "We miss you" emails: <strong>{status.inactivityOn ? 'ON' : 'off'}</strong></li>
                </ul>
                {gaps.length > 0 && (
                  <div className="mt-4 border-t border-club-ink/10 pt-4 text-xs leading-5 text-club-ink/70" data-testid="emails-gaps">
                    <p className="font-bold text-club-ink">Before going live:</p>
                    <ul className="mt-1 list-disc pl-4">{gaps.map((g) => <li key={g}>{g}</li>)}</ul>
                  </div>
                )}
                {gaps.length === 0 && status.dryRun && <p className="mt-4 border-t border-club-ink/10 pt-4 text-xs leading-5 text-club-ink/70">Everything is set. When you are happy with the dry-run emails below, set the secret EMAIL_DRY_RUN to false to start sending.</p>}
              </Panel>

              <Panel title="Try it">
                <TextField label="Send a test email to" value={testTo} onChange={setTestTo} type="email" placeholder="your own address" hint="Leave blank to use your own staff address." />
                <div className="mt-4 flex flex-wrap gap-3">
                  <PrimaryButton onClick={() => void sendTest()} disabled={busy || !canWrite} testId="button-email-test"><Mail size={14} /> {status.dryRun ? 'RECORD TEST EMAIL' : 'SEND TEST EMAIL'}</PrimaryButton>
                  <GhostButton onClick={() => void runNow()} disabled={busy || !canWrite} testId="button-email-run">RUN NOW</GhostButton>
                </div>
                {!canWrite && <p className="mt-3 text-xs text-club-ink/70">Your role can read this page but not send.</p>}
                {note && <p role="status" className="mt-4 text-sm leading-6 text-club-ink" data-testid="emails-note">{note}</p>}
                <p className="mt-4 text-[11px] leading-5 text-club-ink/70">The mailer also runs by itself every 10 minutes once the schedule is set up.</p>
              </Panel>
            </div>
          )}

          <section className="mt-10">
            <h2 className="font-display text-3xl text-club-ink">Recent emails</h2>
            <div className="mt-4 overflow-x-auto border border-club-ink/10 bg-club-white">
              <table className="w-full min-w-[720px] text-left text-sm" data-testid="emails-table">
                <thead className="border-b border-club-ink/10 bg-club-gold/10 font-mono-club text-[9px] tracking-[.12em] text-club-ink/70">
                  <tr><th className="px-4 py-3">WHEN</th><th className="px-4 py-3">TO</th><th className="px-4 py-3">SUBJECT</th><th className="px-4 py-3">STATUS</th><th className="px-4 py-3" /></tr>
                </thead>
                <tbody>
                  {rows.length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-club-ink/70">Nothing yet. Emails appear here as soon as the mailer finds something to send.</td></tr>}
                  {rows.map((r) => (
                    <tr key={r.id} className="border-b border-club-ink/10 last:border-0 align-top">
                      <td className="px-4 py-3 text-xs text-club-ink/70">{when(r.created_at)}</td>
                      <td className="px-4 py-3 text-club-ink">{r.to_email}<span className="block text-[10px] text-club-ink/50">{r.category === 'notice' ? 'club news' : 'service message'}</span></td>
                      <td className="px-4 py-3 text-club-ink">{r.subject}{r.last_error && <span className="mt-1 block text-[11px] text-club-alert">{r.last_error}</span>}</td>
                      <td className="px-4 py-3"><span className={`inline-block px-2 py-1 text-[9px] font-bold tracking-[.1em] ${STATUS_STYLE[r.status]}`}>{STATUS_LABEL[r.status]}{r.attempts > 0 && r.status !== 'sent' ? ` · ${r.attempts}` : ''}</span></td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => void openPreview(r)} className="text-[10px] font-bold tracking-[.12em] text-club-green">PREVIEW</button>
                        {r.status === 'failed' && canWrite && <button onClick={() => void retry(r)} className="ml-4 text-[10px] font-bold tracking-[.12em] text-club-ink">RETRY</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {preview && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-club-ink/60 p-4" role="dialog" aria-label="Email preview" data-testid="email-preview">
              <div className="flex max-h-full w-full max-w-2xl flex-col bg-white">
                <div className="flex items-center justify-between border-b border-club-ink/10 px-5 py-3">
                  <strong className="text-sm text-club-ink">{preview.subject}</strong>
                  <button onClick={() => setPreview(null)} className="text-[10px] font-bold tracking-[.12em] text-club-green">CLOSE</button>
                </div>
                <iframe title="Email preview" sandbox="" srcDoc={preview.html} className="h-[70vh] w-full border-0" />
              </div>
            </div>
          )}
        </>
      )}
    </AdminShell>
  );
}
