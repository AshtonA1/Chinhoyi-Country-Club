import { useEffect, useMemo, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, CircleCheck, Clock3, Download } from 'lucide-react';
import { club } from '@/data/club';
import { type BookingRecord, makeReference, useBookings } from '@/lib/bookings';
import { useAddOns, useBookingSettings, usePricing } from '@/lib/club-data';
import { addDaysIso, formatDate, hasStarted, teeInstant, todayIso } from '@/lib/dates';
import { formatMoney } from '@/lib/format';
import { downloadIcsFile } from '@/lib/ics';
import { PLAYER_TYPES, type PlayerTypeId, type RoundId, greenFee, quoteBooking } from '@/lib/pricing';

const STEPS = ['Date', 'Time', 'Players', 'Player type', 'Round length', 'Add-ons', 'Your details', 'Summary', 'Confirmation'] as const;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function BookingWizard() {
  const { value: pricing } = usePricing();
  const { value: settings } = useBookingSettings();
  const { items: allAddOns } = useAddOns();
  const addOns = allAddOns.filter((a) => a.active);
  const sym = pricing.currencySymbol;
  const today = todayIso();
  const lastDate = addDaysIso(today, settings.advanceDays);

  const [step, setStep] = useState(0);
  const [date, setDate] = useState(today);
  const [time, setTime] = useState('');
  const [players, setPlayers] = useState(2);
  const [playerTypeId, setPlayerTypeId] = useState<PlayerTypeId>('member');
  const [round, setRound] = useState<RoundId>('18');
  const [addOnIds, setAddOnIds] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState<BookingRecord | null>(null);
  const [saveError, setSaveError] = useState(false);
  const { add: addBooking } = useBookings();

  const slotOpen = (t: string) => !hasStarted(date, t);
  // If the chosen time is no longer valid (date changed, or time has passed), clear it.
  useEffect(() => {
    if (time && !slotOpen(time)) setTime('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, time]);

  const effectiveRound: RoundId = round === '9' && !pricing.nineHoleEnabled ? '18' : round;
  const quote = useMemo(
    () => quoteBooking({ pricing, addOns, playerType: playerTypeId, round: effectiveRound, players, addOnIds }),
    [pricing, addOns, playerTypeId, effectiveRound, players, addOnIds],
  );
  const playerType = PLAYER_TYPES.find((p) => p.id === playerTypeId) ?? PLAYER_TYPES[0];
  const roundLabel = effectiveRound === '18' ? '18 holes' : '9 holes';
  const addOnLabels = addOnIds.map((id) => addOns.find((a) => a.id === id)?.label).filter((l): l is string => Boolean(l));
  const dateOk = date >= today && date <= lastDate;

  function toggleAddOn(id: string) {
    setAddOnIds((current) => (current.includes(id) ? current.filter((a) => a !== id) : [...current, id]));
  }

  function canAdvance(): boolean {
    switch (step) {
      case 0: return dateOk;
      case 1: return Boolean(time) && slotOpen(time);
      case 2: return players >= 1 && players <= settings.maxPlayers;
      case 6: return name.trim().length > 1 && EMAIL.test(email.trim()) && phone.trim().length >= 7;
      default: return true;
    }
  }

  function handleConfirm() {
    const record: BookingRecord = {
      id: crypto.randomUUID(),
      reference: makeReference(),
      date, time, players, holes: roundLabel, playerType: playerType.label,
      addOns: addOnLabels,
      name: name.trim(), email: email.trim(), phone: phone.trim(),
      totalPrice: quote.total, status: 'Requested',
      createdAt: new Date().toISOString(),
    };
    const saved = addBooking(record);
    setSaveError(!saved);
    setConfirmedBooking(record);
    setStep(8);
  }

  function handleAddToCalendar() {
    if (!confirmedBooking) return;
    downloadIcsFile(
      {
        uid: `${confirmedBooking.reference}@${club.email.split('@')[1] ?? 'club'}`,
        title: `Tee time at ${club.name} (${confirmedBooking.reference})`,
        description: `${confirmedBooking.players} players · ${confirmedBooking.holes} · ${confirmedBooking.playerType}`,
        location: `${club.name}, ${club.address}`,
        start: teeInstant(confirmedBooking.date, confirmedBooking.time),
        durationMinutes: confirmedBooking.holes.startsWith('9') ? 150 : 270,
      },
      `tee-time-${confirmedBooking.reference}.ics`,
    );
  }

  if (confirmedBooking) {
    return (
      <div className="mt-14 max-w-2xl border border-[#2E6B4E]/30 bg-[#F7F5EF] p-7 md:p-10">
        <CircleCheck className="text-[#2E6B4E]" size={36} />
        <h2 className="font-display mt-6 text-4xl text-[#12372A]">Request received.</h2>
        <p className="mt-4 text-sm leading-7 text-[#5d6b63]">
          Your request for <strong>{formatDate(confirmedBooking.date)}</strong> at <strong>{confirmedBooking.time}</strong> for{' '}
          <strong>{confirmedBooking.players} {confirmedBooking.players === 1 ? 'player' : 'players'}</strong> ({confirmedBooking.holes}) has been recorded. The club will confirm your tee time.
        </p>
        <div className="mt-6 grid gap-2 border-t border-[#12372A]/10 pt-5 text-sm text-[#5d6b63]">
          <div className="flex justify-between"><span>Booking reference</span><strong className="text-[#12372A]">{confirmedBooking.reference}</strong></div>
          <div className="flex justify-between"><span>Player type</span><span className="text-[#12372A]">{confirmedBooking.playerType}</span></div>
          {confirmedBooking.addOns.length > 0 && (
            <div className="flex justify-between"><span>Add-ons</span><span className="text-[#12372A]">{confirmedBooking.addOns.join(', ')}</span></div>
          )}
          <div className="flex justify-between"><span>Total to pay at the club</span><strong className="text-[#12372A]">{formatMoney(confirmedBooking.totalPrice, sym)}</strong></div>
        </div>
        {saveError && <p className="mt-5 text-xs text-[#9b2c2c]">Your browser could not store this request, so it will not appear under My tee times. Please save the details above.</p>}
        <div className="mt-7 flex flex-wrap gap-3">
          <button
            onClick={handleAddToCalendar}
            className="flex items-center gap-2 bg-[#12372A] px-5 py-3 text-[10px] font-bold tracking-[.14em] text-[#F7F5EF] hover:bg-[#2E6B4E]"
            data-testid="button-add-to-calendar"
          >
            <Download size={14} /> ADD TO CALENDAR
          </button>
          <a
            href={`data:text/plain;charset=utf-8,${encodeURIComponent(`${club.name} — Booking Confirmation\nReference: ${confirmedBooking.reference}\nDate: ${formatDate(confirmedBooking.date)}\nTime: ${confirmedBooking.time}\nPlayers: ${confirmedBooking.players}\nRound: ${confirmedBooking.holes}\nTotal: ${formatMoney(confirmedBooking.totalPrice, sym)} (pay at the club)\nStatus: Requested`)}`}
            download={`booking-${confirmedBooking.reference}.txt`}
            className="flex items-center gap-2 border border-[#12372A]/25 px-5 py-3 text-[10px] font-bold tracking-[.14em] text-[#12372A] hover:border-[#2E6B4E]"
            data-testid="link-download-confirmation"
          >
            <Download size={14} /> DOWNLOAD CONFIRMATION
          </a>
        </div>
      </div>
    );
  }

  const choice = (active: boolean) => `border px-4 py-5 text-left transition-colors hover:border-[#2E6B4E] ${active ? 'border-[#2E6B4E] bg-[#e8e9df]' : 'border-[#cfd4cd]'}`;
  const row = (k: string, v: string) => <div className="flex justify-between gap-4"><span>{k}</span><span className="text-right text-[#12372A]">{v}</span></div>;
  const inputCls = 'mt-2 w-full border border-[#cfd4cd] bg-transparent px-4 py-3.5 text-sm text-[#12372A] outline-none focus:border-[#2E6B4E]';
  const lbl = 'font-mono-club text-[9px] tracking-[.16em] text-[#5d6b63]';

  return (
    <div className="mt-14 max-w-3xl bg-[#F7F5EF] p-5 shadow-[0_18px_45px_rgba(18,55,42,.08)] md:p-9">
      <div className="flex items-center justify-between border-b border-[#12372A]/15 pb-4">
        <span className={lbl}>STEP {step + 1} OF {STEPS.length - 1}</span>
        <span className="font-mono-club text-[9px] tracking-[.14em] text-[#2E6B4E]">{STEPS[step].toUpperCase()}</span>
      </div>
      <div className="mt-3 h-1 w-full bg-[#e5e2d8]">
        <div className="h-full bg-[#C8A951] transition-all" style={{ width: `${((step + 1) / (STEPS.length - 1)) * 100}%` }} />
      </div>

      {step === 0 && (
        <div className="reveal pt-7">
          <label className={lbl} htmlFor="booking-date">SELECT A DATE</label>
          <input id="booking-date" type="date" value={date} min={today} max={lastDate} onChange={(e) => setDate(e.target.value)} className="mt-3 block w-full border border-[#cfd4cd] bg-transparent px-4 py-4 text-[#12372A] outline-none focus:border-[#2E6B4E]" data-testid="input-booking-date" />
          {!dateOk && <p className="mt-3 text-xs text-[#9b2c2c]">Choose a date from today up to {formatDate(lastDate)}.</p>}
        </div>
      )}

      {step === 1 && (
        <div className="reveal pt-7">
          <p className={lbl}>TIMES · {formatDate(date).toUpperCase()}</p>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {settings.slots.map((t) => {
              const open = slotOpen(t);
              return (
                <button
                  key={t}
                  onClick={() => setTime(t)}
                  disabled={!open}
                  className={`border px-3 py-4 text-sm transition-colors enabled:hover:border-[#2E6B4E] enabled:hover:bg-[#e8e9df] disabled:cursor-not-allowed disabled:opacity-35 ${time === t ? 'border-[#2E6B4E] bg-[#e8e9df] text-[#12372A]' : 'border-[#cfd4cd] text-[#5d6b63]'}`}
                  data-testid={`button-booking-time-${t.replace(':', '')}`}
                >
                  {t}
                </button>
              );
            })}
          </div>
          {settings.slots.every((t) => !slotOpen(t)) && <p className="mt-4 text-xs text-[#5d6b63]">No tee times are left today. Go back and choose another date.</p>}
          <p className="mt-4 text-xs text-[#5d6b63]">Availability is confirmed by the club after you send your request.</p>
        </div>
      )}

      {step === 2 && (
        <div className="reveal pt-7">
          <label className={lbl} htmlFor="booking-players">HOW MANY PLAYERS?</label>
          <select id="booking-players" value={players} onChange={(e) => setPlayers(Number(e.target.value))} className="mt-3 block w-full appearance-none border border-[#cfd4cd] bg-[#F7F5EF] px-4 py-4 text-[#12372A] outline-none focus:border-[#2E6B4E]" data-testid="select-booking-players">
            {Array.from({ length: settings.maxPlayers }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n} player{n > 1 ? 's' : ''}</option>)}
          </select>
        </div>
      )}

      {step === 3 && (
        <div className="reveal pt-7">
          <p className={lbl}>ARE YOU A MEMBER?</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {PLAYER_TYPES.map((type) => (
              <button key={type.id} onClick={() => setPlayerTypeId(type.id)} className={choice(playerTypeId === type.id)} data-testid={`button-booking-playertype-${type.id}`}>
                <span className="font-display text-xl text-[#12372A]">{type.label}</span>
                <p className="mt-1 text-xs text-[#5d6b63]">{formatMoney(greenFee(pricing, type.id, '18'), sym)} green fee per player (18 holes)</p>
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-[#5d6b63]">Membership is checked by the club when you arrive.</p>
        </div>
      )}

      {step === 4 && (
        <div className="reveal pt-7">
          <p className={lbl}>{pricing.nineHoleEnabled ? '9 OR 18 HOLES?' : 'ROUND LENGTH'}</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {(pricing.nineHoleEnabled ? (['18', '9'] as RoundId[]) : (['18'] as RoundId[])).map((id) => (
              <button key={id} onClick={() => setRound(id)} className={choice(effectiveRound === id)} data-testid={`button-booking-holes-${id}`}>
                <span className="font-display text-2xl text-[#12372A]">{id} holes</span>
                <p className="mt-1 text-xs text-[#5d6b63]">{formatMoney(greenFee(pricing, playerTypeId, id), sym)} green fee per player</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="reveal pt-7">
          <p className={lbl}>OPTIONAL EXTRAS</p>
          {addOns.length === 0 && <p className="mt-4 text-sm text-[#5d6b63]">No extras are available. Continue to the next step.</p>}
          <div className="mt-4 grid gap-2">
            {addOns.map((addOn) => {
              const active = addOnIds.includes(addOn.id);
              return (
                <button key={addOn.id} onClick={() => toggleAddOn(addOn.id)} className={`flex items-center justify-between border px-4 py-4 text-left transition-colors hover:border-[#2E6B4E] ${active ? 'border-[#2E6B4E] bg-[#e8e9df]' : 'border-[#cfd4cd]'}`} data-testid={`button-booking-addon-${addOn.id}`}>
                  <span className="text-sm text-[#12372A]">{addOn.label}</span>
                  <span className="flex items-center gap-3 text-xs text-[#5d6b63]">
                    {formatMoney(addOn.price, sym)} / player
                    <span className={`grid h-5 w-5 place-items-center rounded-full border ${active ? 'border-[#2E6B4E] bg-[#2E6B4E] text-white' : 'border-[#c9cec8]'}`}>{active && <Check size={12} />}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {step === 6 && (
        <div className="reveal grid gap-4 pt-7">
          <div>
            <label className={lbl} htmlFor="booking-name">FULL NAME</label>
            <input id="booking-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={inputCls} data-testid="input-booking-name" />
          </div>
          <div>
            <label className={lbl} htmlFor="booking-email">EMAIL ADDRESS</label>
            <input id="booking-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className={inputCls} data-testid="input-booking-email" />
            {email && !EMAIL.test(email.trim()) && <p className="mt-1 text-xs text-[#9b2c2c]">Enter a valid email address.</p>}
          </div>
          <div>
            <label className={lbl} htmlFor="booking-phone">PHONE NUMBER</label>
            <input id="booking-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" className={inputCls} data-testid="input-booking-phone" />
          </div>
        </div>
      )}

      {step === 7 && (
        <div className="reveal pt-7">
          <p className={lbl}>REQUEST SUMMARY</p>
          <div className="mt-4 grid gap-2 border border-[#12372A]/10 bg-white p-5 text-sm text-[#5d6b63]">
            {row('Date', formatDate(date))}
            {row('Time', time)}
            {row('Players', String(players))}
            {row('Player type', playerType.label)}
            {row('Round', roundLabel)}
            {row('Green fee', `${formatMoney(quote.perPlayerFee, sym)} per player`)}
            {addOnLabels.length > 0 && row('Extras', `${addOnLabels.join(', ')} (${formatMoney(quote.addOnsPerPlayer, sym)} per player)`)}
            <div className="mt-2 flex justify-between border-t border-[#12372A]/10 pt-2 text-base font-semibold">
              <span className="text-[#12372A]">Total</span><span className="text-[#12372A]">{formatMoney(quote.total, sym)}</span>
            </div>
          </div>
          <p className="mt-4 text-xs leading-5 text-[#5d6b63]">Nothing is charged online. You pay at the club. Your request is not a confirmed tee time until the club confirms it.</p>
        </div>
      )}

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        {step > 0 ? (
          <button onClick={() => setStep((s) => s - 1)} className="flex items-center justify-center gap-2 py-4 text-[10px] font-bold tracking-[.15em] text-[#5d6b63]" data-testid="button-booking-back">
            <ChevronLeft size={14} /> BACK
          </button>
        ) : <span />}
        {step < 7 ? (
          <button onClick={() => setStep((s) => s + 1)} disabled={!canAdvance()} className="flex items-center justify-center gap-2 bg-[#12372A] px-6 py-4 text-[10px] font-bold tracking-[.15em] text-[#F7F5EF] transition-colors hover:bg-[#2E6B4E] disabled:cursor-not-allowed disabled:opacity-40" data-testid="button-booking-next">
            CONTINUE <ChevronRight size={14} />
          </button>
        ) : (
          <button onClick={handleConfirm} className="flex items-center justify-center gap-2 bg-[#C8A951] px-6 py-4 text-[10px] font-bold tracking-[.15em] text-[#17201C] hover:bg-[#e3c86b]" data-testid="button-confirm-booking">
            SEND REQUEST <Check size={14} />
          </button>
        )}
      </div>
      <div className="mt-8 flex gap-4 text-xs text-[#5d6b63]">
        <Clock3 size={16} className="shrink-0 text-[#2E6B4E]" />
        <span>Cancellations are welcome up to {settings.cancellationHours} hours before play. Times shown are club time (Zimbabwe).</span>
      </div>
    </div>
  );
}
