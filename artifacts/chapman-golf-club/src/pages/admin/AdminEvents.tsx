import { useState } from 'react';
import { ImagePlus, Pencil, Plus } from 'lucide-react';
import { AdminShell, PortalHeading, PortalStat } from './AdminShell';
import {
  AreaField, CheckField, DeleteButton, GhostButton, NumberField, Panel, PrimaryButton, SaveNotice, SelectField, StorageNote, TextField, useSaveNotice,
} from '@/components/admin/Form';
import { EventInbox } from '@/components/admin/EventInbox';
import { EVENT_TYPES, type EventItem, type EventStatus } from '@/data/club';
import { upcomingEvents, useEventEntries, useEvents } from '@/lib/club-data';
import { resizeImage } from '@/lib/image';
import { formatDate, isIsoDate } from '@/lib/dates';
import { makeId, splitList } from '@/lib/format';
import { useCan } from '@/lib/permissions';

type Draft = {
  id: string; title: string; date: string; type: string; status: EventStatus; time: string;
  entryFee: string; registrationDeadline: string; text: string; schedule: string; rules: string; prizes: string;
  poster: string; singlePrice: number | null; fourBallPrice: number | null; sponsorshipOpen: boolean; sponsors: string;
};

const blank = (): Draft => ({
  id: makeId('ev'), title: '', date: '', type: 'Competition', status: 'confirmed', time: '',
  entryFee: '', registrationDeadline: '', text: '', schedule: '', rules: '', prizes: '',
  poster: '', singlePrice: null, fourBallPrice: null, sponsorshipOpen: true, sponsors: '',
});

const toDraft = (e: EventItem): Draft => ({
  id: e.id, title: e.title, date: e.date, type: e.type, status: e.status, time: e.time ?? '',
  entryFee: e.entryFee ?? '', registrationDeadline: e.registrationDeadline ?? '', text: e.text,
  schedule: (e.schedule ?? []).join('\n'), rules: (e.rules ?? []).join('\n'), prizes: (e.prizes ?? []).join('\n'),
  poster: e.poster ?? '', singlePrice: e.singlePrice ?? null, fourBallPrice: e.fourBallPrice ?? null,
  sponsorshipOpen: e.sponsorshipOpen ?? false, sponsors: (e.sponsors ?? []).join('\n'),
});

function toEvent(d: Draft): EventItem {
  const opt = (v: string) => (v.trim() ? v.trim() : undefined);
  const list = (v: string) => { const l = splitList(v, /\n/); return l.length ? l : undefined; };
  return {
    id: d.id, title: d.title.trim(), date: d.date, type: d.type, status: d.status, text: d.text.trim(),
    time: opt(d.time), entryFee: opt(d.entryFee), registrationDeadline: opt(d.registrationDeadline),
    schedule: list(d.schedule), rules: list(d.rules), prizes: list(d.prizes),
    poster: opt(d.poster), singlePrice: d.singlePrice ?? undefined, fourBallPrice: d.fourBallPrice ?? undefined,
    sponsorshipOpen: d.sponsorshipOpen, sponsors: list(d.sponsors),
  };
}

const STATUS_STYLE: Record<EventStatus, string> = {
  proposed: 'text-club-gold-deep', confirmed: 'text-club-green', cancelled: 'text-club-alert',
};

export default function AdminEvents() {
  const { items, add, update, remove, reset } = useEvents();
  const canWrite = useCan('events', 'write');
  const canDelete = useCan('events', 'delete');
  const entries = useEventEntries();
  const { notice, flash } = useSaveNotice();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [error, setError] = useState('');

  const upcoming = upcomingEvents(items).length;
  const set = (patch: Partial<Draft>) => setDraft((d) => (d ? { ...d, ...patch } : d));

  async function onPoster(file: File | undefined) {
    if (!file) return;
    try {
      set({ poster: await resizeImage(file, 900) });
      setError('');
    } catch {
      setError('That poster could not be used. Try a different image.');
    }
  }

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
        <PortalStat label="ONLINE ENTRIES" value={String(entries.items.length)} note="Received on this browser" />
      </div>
      <div className="mt-4"><SaveNotice notice={notice} /></div>

      {draft && (
        <div className="mt-6">
          <Panel title={isNew ? 'New event' : 'Edit event'}>
            <div className="grid gap-4 md:grid-cols-2">
              <TextField label="Title" value={draft.title} onChange={(v) => set({ title: v })} />
              <TextField label="Date" type="date" value={draft.date} onChange={(v) => set({ date: v })} />
              <SelectField label="Type" value={draft.type} onChange={(v) => set({ type: v })} options={[...new Set([...EVENT_TYPES, draft.type])].map((t) => ({ value: t, label: t }))} />
              <SelectField label="Status" value={draft.status} onChange={(v) => set({ status: v as EventStatus })} options={[{ value: 'confirmed', label: 'Confirmed' }, { value: 'cancelled', label: 'Cancelled' }]} />
              <TextField label="Start time (optional)" value={draft.time} onChange={(v) => set({ time: v })} placeholder="e.g. 07:00" />
              <TextField label="Entry fee (optional)" value={draft.entryFee} onChange={(v) => set({ entryFee: v })} placeholder="e.g. $10 per player" />
              <TextField label="Registration closes (optional)" value={draft.registrationDeadline} onChange={(v) => set({ registrationDeadline: v })} placeholder="e.g. 10 October" />
            </div>
            <div className="mt-6 border-t border-club-ink/10 pt-5">
              <p className="font-mono-club text-[9px] tracking-[.14em] text-club-ink/70">ENTRY PRICES (USD) · LEAVE BLANK IF NOT OFFERED</p>
              <div className="mt-3 grid gap-4 md:grid-cols-2">
                <NumberField label="Single player" value={draft.singlePrice} onChange={(v) => set({ singlePrice: v })} allowEmpty step="0.5" placeholder="e.g. 10" />
                <NumberField label="Four-ball (team of four)" value={draft.fourBallPrice} onChange={(v) => set({ fourBallPrice: v })} allowEmpty step="0.5" placeholder="e.g. 35" />
              </div>
              <p className="mt-2 text-[11px] text-club-ink/70">When a price is set, visitors can enter this event online.</p>
            </div>
            <div className="mt-6 border-t border-club-ink/10 pt-5">
              <p className="font-mono-club text-[9px] tracking-[.14em] text-club-ink/70">POSTER</p>
              <label className="mt-3 inline-flex cursor-pointer items-center gap-2 border border-club-ink/20 bg-white px-4 py-3 text-xs font-bold tracking-[.1em] text-club-ink">
                <ImagePlus size={16} className="text-club-green" /> {draft.poster ? 'Replace poster' : 'Add a poster'}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => void onPoster(e.target.files?.[0])} />
              </label>
              {draft.poster && (
                <div className="mt-3 flex items-center gap-4">
                  <img src={draft.poster} alt="" className="h-28 w-20 object-cover" />
                  <GhostButton onClick={() => set({ poster: '' })}>REMOVE POSTER</GhostButton>
                </div>
              )}
            </div>
            <div className="mt-6 grid gap-4 border-t border-club-ink/10 pt-5 md:grid-cols-2">
              <div>
                <CheckField label="Let companies ask to sponsor this event" checked={draft.sponsorshipOpen} onChange={(v) => set({ sponsorshipOpen: v })} />
              </div>
              <AreaField label="Sponsors (shown on the event page)" rows={3} value={draft.sponsors} onChange={(v) => set({ sponsors: v })} hint="One name per line" />
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
      <EventInbox />
      {canDelete && (
        <div className="mt-6 flex items-center gap-4">
          <DeleteButton label="RESET TO CLUB PROGRAMME" onConfirm={() => { reset(); flash(true, 'Events reset to the club programme.'); }} />
        </div>
      )}
      <StorageNote />
    </AdminShell>
  );
}
