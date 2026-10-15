import { useState } from 'react';
import { CircleCheck } from 'lucide-react';
import type { EntryFormat, EventEntry, EventItem } from '@/data/club';
import { useEventEntries } from '@/lib/club-data';
import { formatDate } from '@/lib/dates';
import { formatMoney, makeId } from '@/lib/format';
import { paymentsEnabled } from '@/lib/supabase';
import { PaymentPanel } from '@/components/events/PaymentPanel';
import { CalendarButton, DownloadPdfButton } from '@/components/DownloadButtons';
import { eventEntryDocument } from '@/lib/documents';
import { clubEventIcs } from '@/lib/ics';

const field = 'mt-2 w-full border border-club-ink/20 bg-white px-3 py-3 text-sm text-club-ink outline-none placeholder:text-club-ink/50 focus:border-club-green';
const label = 'font-mono-club text-[9px] tracking-[.14em] text-club-ink/70';

/** Online entry for an event: one player, or a team of four. */
export function EventEntryForm({ event }: { event: EventItem }) {
  const { add } = useEventEntries();
  const offers: { id: EntryFormat; name: string; price: number }[] = [];
  if (event.singlePrice !== undefined) offers.push({ id: 'single', name: 'Single player', price: event.singlePrice });
  if (event.fourBallPrice !== undefined) offers.push({ id: 'fourball', name: 'Four-ball (team of four)', price: event.fourBallPrice });

  const [format, setFormat] = useState<EntryFormat>(offers[0]?.id ?? 'single');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [others, setOthers] = useState(['', '', '']);
  const [error, setError] = useState('');
  const [done, setDone] = useState<EventEntry | null>(null);
  const [paidInfo, setPaidInfo] = useState<{ reference: string; paidAt: string } | null>(null);

  if (offers.length === 0) return null;
  const chosen = offers.find((o) => o.id === format) ?? offers[0];

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setError('Enter your name.');
    if (phone.trim().length < 7) return setError('Enter a phone number the club can reach you on.');
    if (!email.includes('@')) return setError('Enter a valid email address.');
    if (chosen.id === 'fourball' && others.some((o) => !o.trim())) return setError('Enter the names of all four players.');
    const entry: EventEntry = {
      id: makeId('en'),
      ref: `CCC-${makeId('x').slice(-6).toUpperCase()}`,
      eventId: event.id, eventTitle: event.title, eventDate: event.date,
      format: chosen.id,
      players: chosen.id === 'fourball' ? [name.trim(), ...others.map((o) => o.trim())] : [name.trim()],
      contactName: name.trim(), phone: phone.trim(), email: email.trim(),
      total: chosen.price, status: 'pending_payment', createdAt: new Date().toISOString(),
    };
    if (!add(entry)) return setError('Your browser could not save the entry (storage is full or blocked).');
    setError('');
    setDone(entry);
  }

  if (done) {
    return (
      <div className="border border-club-green/30 bg-white p-7" data-testid="entry-confirmation">
        <CircleCheck className="text-club-green" size={32} />
        <h3 className="font-display mt-4 text-3xl text-club-ink">Entry received.</h3>
        <p className="mt-3 text-sm leading-6 text-club-ink/70">
          Reference <strong className="text-club-ink">{done.ref}</strong> for {done.eventTitle}, {formatDate(done.eventDate)}.
          {' '}{done.format === 'fourball' ? 'Four-ball' : 'Single player'} entry, <strong className="text-club-ink">{formatMoney(done.total)}</strong> due.
        </p>
        {paymentsEnabled
          ? <PaymentPanel entry={{ id: done.id, ref: done.ref, total: done.total, phone: done.phone }} onPaid={(p) => setPaidInfo({ reference: p.reference, paidAt: new Date().toISOString() })} />
          : <p className="mt-3 text-sm leading-6 text-club-ink/70">Your entry is reserved and awaiting payment. The club will contact you on {done.phone} with payment details.</p>}
        <div className="mt-6 flex flex-wrap gap-3 border-t border-club-ink/10 pt-5">
          <DownloadPdfButton
            variant="solid"
            label={paidInfo ? 'DOWNLOAD RECEIPT (PDF)' : 'DOWNLOAD ENTRY (PDF)'}
            build={() => eventEntryDocument(paidInfo ? { ...done, status: 'paid', paidAt: paidInfo.paidAt, paymentReference: paidInfo.reference } : done)}
            testId="button-download-entry"
          />
          <CalendarButton
            build={() => clubEventIcs({ id: event.id, title: event.title, date: event.date, time: event.time, text: event.text }, { uidSuffix: done.ref, note: `Your entry reference: ${done.ref}` })}
            filename={`event-${done.ref}.ics`}
            testId="button-entry-calendar"
          />
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="border border-club-ink/10 bg-white p-6 md:p-8" data-testid="form-event-entry">
      <p className="font-mono-club text-[9px] tracking-[.15em] text-club-green">ENTER ONLINE</p>
      <h3 className="font-display mt-2 text-3xl text-club-ink">Enter this event.</h3>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {offers.map((o) => (
          <button
            type="button" key={o.id} onClick={() => setFormat(o.id)} aria-pressed={format === o.id}
            className={`border p-4 text-left ${format === o.id ? 'border-club-green bg-club-green text-white' : 'border-club-ink/20 text-club-ink hover:border-club-green'}`}
          >
            <span className="block text-[10px] font-bold tracking-[.12em]">{o.name.toUpperCase()}</span>
            <span className="font-display mt-1 block text-3xl">{formatMoney(o.price)}</span>
          </button>
        ))}
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="block"><span className={label}>YOUR NAME</span><input className={field} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" /></label>
        <label className="block"><span className={label}>PHONE</span><input className={field} value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="+263 …" /></label>
        <label className="block md:col-span-2"><span className={label}>EMAIL</span><input className={field} type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></label>
        {chosen.id === 'fourball' && others.map((o, i) => (
          <label key={i} className="block">
            <span className={label}>PLAYER {i + 2} NAME</span>
            <input className={field} value={o} onChange={(e) => setOthers((prev) => prev.map((p, j) => (j === i ? e.target.value : p)))} />
          </label>
        ))}
      </div>
      {error && <p role="alert" className="mt-4 text-xs text-club-alert">{error}</p>}
      <button type="submit" className="mt-6 w-full bg-club-green py-4 text-[10px] font-bold tracking-[.15em] text-club-white hover:bg-club-ink" data-testid="button-submit-entry">
        SUBMIT ENTRY · {formatMoney(chosen.price)}
      </button>
    </form>
  );
}
