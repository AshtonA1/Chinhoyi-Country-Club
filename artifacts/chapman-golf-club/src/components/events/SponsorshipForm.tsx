import { useState } from 'react';
import { CircleCheck } from 'lucide-react';
import type { EventItem, SponsorshipRequest } from '@/data/club';
import { useSponsorRequests } from '@/lib/club-data';
import { makeId } from '@/lib/format';
import { GUARD_MESSAGE, useFormGuard } from '@/lib/formGuard';

const field = 'mt-2 w-full border border-club-ink/20 bg-white px-3 py-3 text-sm text-club-ink outline-none placeholder:text-club-ink/50 focus:border-club-green';
const label = 'font-mono-club text-[9px] tracking-[.14em] text-club-ink/70';
const INTERESTS = ['Title sponsor', 'Prize sponsor', 'Hole sponsor', 'Refreshments', 'Other'];

/** A company asks to sponsor the event; the club follows up. */
export function SponsorshipForm({ event }: { event: EventItem }) {
  const { add } = useSponsorRequests();
  const guard = useFormGuard();
  const [company, setCompany] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [interest, setInterest] = useState(INTERESTS[0]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (guard.verdict() !== 'ok') return setError(GUARD_MESSAGE);
    if (!company.trim() || !contactName.trim()) return setError('Enter your company and your name.');
    if (phone.trim().length < 7 && !email.includes('@')) return setError('Enter a phone number or an email address so the club can reply.');
    const request: SponsorshipRequest = {
      id: makeId('sp'), eventId: event.id, eventTitle: event.title,
      company: company.trim(), contactName: contactName.trim(), phone: phone.trim(), email: email.trim(),
      interest, message: message.trim(), status: 'new', createdAt: new Date().toISOString(),
    };
    if (!add(request)) return setError('Your browser could not save the request (storage is full or blocked).');
    setError('');
    setSent(true);
  }

  if (sent) {
    return (
      <div className="border border-club-green/30 bg-white p-7" data-testid="sponsor-confirmation">
        <CircleCheck className="text-club-green" size={32} />
        <h3 className="font-display mt-4 text-3xl text-club-ink">Thank you.</h3>
        <p className="mt-3 text-sm leading-6 text-club-ink/70">Your sponsorship request for {event.title} has gone to the club. Someone will get back to you.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="border border-club-ink/10 bg-white p-6 md:p-8" data-testid="form-sponsorship">
      {guard.field}
      <p className="font-mono-club text-[9px] tracking-[.15em] text-club-green">SPONSORSHIP</p>
      <h3 className="font-display mt-2 text-3xl text-club-ink">Sponsor this event.</h3>
      <p className="mt-3 text-sm leading-6 text-club-ink/70">Tell the club what you would like to sponsor and how to reach you. Sponsorship terms are agreed with the club directly.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="block"><span className={label}>COMPANY</span><input className={field} value={company} onChange={(e) => setCompany(e.target.value)} autoComplete="organization" /></label>
        <label className="block"><span className={label}>CONTACT PERSON</span><input className={field} value={contactName} onChange={(e) => setContactName(e.target.value)} autoComplete="name" /></label>
        <label className="block"><span className={label}>PHONE</span><input className={field} value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" /></label>
        <label className="block"><span className={label}>EMAIL</span><input className={field} type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></label>
        <label className="block md:col-span-2">
          <span className={label}>I WOULD LIKE TO SPONSOR</span>
          <select className={field} value={interest} onChange={(e) => setInterest(e.target.value)}>{INTERESTS.map((i) => <option key={i}>{i}</option>)}</select>
        </label>
        <label className="block md:col-span-2"><span className={label}>MESSAGE (OPTIONAL)</span><textarea className={field} rows={3} value={message} onChange={(e) => setMessage(e.target.value)} /></label>
      </div>
      {error && <p role="alert" className="mt-4 text-xs text-club-alert">{error}</p>}
      <button type="submit" className="mt-6 w-full bg-club-ink py-4 text-[10px] font-bold tracking-[.15em] text-club-white hover:bg-club-green" data-testid="button-submit-sponsorship">
        SEND SPONSORSHIP REQUEST
      </button>
    </form>
  );
}
