import { useState } from 'react';
import { Pencil, Plus } from 'lucide-react';
import { AdminShell, PortalHeading, PortalStat } from './AdminShell';
import {
  AreaField, DeleteButton, GhostButton, Panel, PrimaryButton, SaveNotice, SelectField, StorageNote, TextField, useSaveNotice,
} from '@/components/admin/Form';
import { EVENT_TYPES, type EventItem, type EventStatus } from '@/data/club';
import { upcomingEvents, useEvents } from '@/lib/club-data';
import { formatDate, isIsoDate } from '@/lib/dates';
import { makeId, splitList } from '@/lib/format';
import { useCan } from '@/lib/permissions';

type Draft = {
  id: string; title: string; date: string; type: string; status: EventStatus; time: string;
  entryFee: string; registrationDeadline: string; text: string; schedule: string; rules: string; prizes: string;
};

const blank = (): Draft => ({
  id: makeId('ev'), title: '', date: '', type: 'Competition', status: 'proposed', time: '',
  entryFee: '', registrationDeadline: '', text: '', schedule: '', rules: '', prizes: '',
});

const toDraft = (e: EventItem): Draft => ({
  id: e.id, title: e.title, date: e.date, type: e.type, status: e.status, time: e.time ?? '',
  entryFee: e.entryFee ?? '', registrationDeadline: e.registrationDeadline ?? '', text: e.text,
  schedule: (e.schedule ?? []).join('\n'), rules: (e.rules ?? []).join('\n'), prizes: (e.prizes ?? []).join('\n'),
});

function toEvent(d: Draft): EventItem {
  const opt = (v: string) => (v.trim() ? v.trim() : undefined);
  const list = (v: string) => { const l = splitList(v, /\n/); return l.length ? l : undefined; };
  return {
    id: d.id, title: d.title.trim(), date: d.date, type: d.type, status: d.status, text: d.text.trim(),
    time: opt(d.time), entryFee: opt(d.entryFee), registrationDeadline: opt(d.registrationDeadline),
    schedule: list(d.schedule), rules: list(d.rules), prizes: list(d.prizes),
  };
}

const STATUS_STYLE: Record<EventStatus, string> = {
  proposed: 'text-club-gold-deep', confirmed: 'text-club-green', cancelled: 'text-club-alert',
};

export default function AdminEvents() {
  const { items, add, update, remove, reset } = useEvents();
  const canWrite = useCan('events', 'write');
  const canDelete = useCan('events', 'delete');
  const { notice, flash } = useSaveNotice();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [error, setError] = useState('');

  const upcoming = upcomingEvents(items).length;
  const set = (patch: Partial<Draft>) => setDraft((d) => (d ? { ...d, ...patch } : d));

  function save() {
    if (!draft) return;
    if (!draft.title.trim()) return setError('Give the event a title.');
    if (!isIsoDate(draft.date)) return setError('Choose a valid date.');
    const event = toEvent(draft);
    flash(isNew ? add(event) : update(event.id, event));
    setDraft(null);
    setError('');
  }

  return (
    <AdminShell>
      <PortalHeading
        eyebrow="ADMIN / EVENTS"
        title="Give the club a reason."
        copy="Add, edit and delete events. What you save here is what visitors see on the Events page and the Home page."
        action={canWrite && (
          <button onClick={() => { setDraft(blank()); setIsNew(true); setError(''); }} className="inline-flex items-center gap-2 bg-club-green px-5 py-4 text-[10px] font-bold tracking-[.14em] text-club-white hover:bg-club-ink" data-testid="button-add-event">
            <Plus size={14} /> ADD EVENT
          </button>
        )}
      />
      <div className="mt-8 grid gap-3 md:grid-cols-3">
        <PortalStat label="UPCOMING" value={String(upcoming)} note="Shown on the public site" />
        <PortalStat label="ALL EVENTS" value={String(items.length)} note="Including past and cancelled" />
        <PortalStat label="PROPOSED" value={String(items.filter((e) => e.status === 'proposed').length)} note="Awaiting approval" />
      </div>
      <div className="mt-4"><SaveNotice notice={notice} /></div>

      {draft && (
        <div className="mt-6">
          <Panel title={isNew ? 'New event' : 'Edit event'}>
            <div className="grid gap-4 md:grid-cols-2">
              <TextField label="Title" value={draft.title} onChange={(v) => set({ title: v })} />
              <TextField label="Date" type="date" value={draft.date} onChange={(v) => set({ date: v })} />
              <SelectField label="Type" value={draft.type} onChange={(v) => set({ type: v })} options={[...new Set([...EVENT_TYPES, draft.type])].map((t) => ({ value: t, label: t }))} />
              <SelectField label="Status" value={draft.status} onChange={(v) => set({ status: v as EventStatus })} options={[{ value: 'proposed', label: 'Proposed (awaiting approval)' }, { value: 'confirmed', label: 'Confirmed' }, { value: 'cancelled', label: 'Cancelled' }]} />
              <TextField label="Start time (optional)" value={draft.time} onChange={(v) => set({ time: v })} placeholder="e.g. 07:00" />
              <TextField label="Entry fee (optional)" value={draft.entryFee} onChange={(v) => set({ entryFee: v })} placeholder="e.g. $10 per player" />
              <TextField label="Registration closes (optional)" value={draft.registrationDeadline} onChange={(v) => set({ registrationDeadline: v })} placeholder="e.g. 10 October" />
            </div>
            <div className="mt-4 grid gap-4">
              <AreaField label="Description" value={draft.text} onChange={(v) => set({ text: v })} />
              <div className="grid gap-4 md:grid-cols-3">
                <AreaField label="Schedule" rows={4} value={draft.schedule} onChange={(v) => set({ schedule: v })} hint="One line each" />
                <AreaField label="Rules" rows={4} value={draft.rules} onChange={(v) => set({ rules: v })} hint="One line each" />
                <AreaField label="Prizes" rows={4} value={draft.prizes} onChange={(v) => set({ prizes: v })} hint="One line each" />
              </div>
            </div>
            {error && <p role="alert" className="mt-4 text-xs text-club-alert">{error}</p>}
            <div className="mt-5 flex flex-wrap gap-3">
              <PrimaryButton onClick={save} testId="button-save-event">SAVE EVENT</PrimaryButton>
              <GhostButton onClick={() => { setDraft(null); setError(''); }}>CANCEL</GhostButton>
            </div>
          </Panel>
        </div>
      )}

      <div className="mt-6 overflow-x-auto border border-club-ink/10 bg-club-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-club-ink/10 bg-club-gold/10 font-mono-club text-[9px] tracking-[.12em] text-club-ink/70">
            <tr><th className="px-5 py-4">DATE</th><th className="px-5 py-4">EVENT</th><th className="px-5 py-4">TYPE</th><th className="px-5 py-4">STATUS</th><th className="px-5 py-4" /></tr>
          </thead>
          <tbody>
            {items.map((e) => (
              <tr key={e.id} className="border-b border-club-ink/10 last:border-0">
                <td className="px-5 py-4 font-mono-club text-[10px] text-club-green">{formatDate(e.date)}</td>
                <td className="px-5 py-4 font-medium text-club-ink">{e.title}</td>
                <td className="px-5 py-4 text-club-ink/70">{e.type}</td>
                <td className="px-5 py-4"><span className={`text-[10px] font-bold tracking-[.1em] ${STATUS_STYLE[e.status]}`}>{e.status.toUpperCase()}</span></td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-2">
                    {canWrite && <GhostButton onClick={() => { setDraft(toDraft(e)); setIsNew(false); setError(''); }}><Pencil size={13} /> EDIT</GhostButton>}
                    {canDelete && <DeleteButton onConfirm={() => flash(remove(e.id))} />}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && <div className="p-10 text-center text-sm text-club-ink/70">No events yet. Add the first one.</div>}
      </div>
      {canDelete && (
        <div className="mt-6 flex items-center gap-4">
          <DeleteButton label="RESET TO PROPOSED PROGRAMME" onConfirm={() => { reset(); flash(true, 'Events reset to the Captain’s proposed programme.'); }} />
        </div>
      )}
      <StorageNote />
    </AdminShell>
  );
}
