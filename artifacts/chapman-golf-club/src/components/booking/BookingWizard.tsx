import { useMemo, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, CircleCheck, Clock3, Download } from 'lucide-react';
import { bookingConfig, club } from '@/data/club';
import { downloadIcsFile } from '@/lib/ics';
import { useLocalCollection } from '@/lib/local-store';

type BookingRecord = {
  id: string;
  reference: string;
  date: string;
  time: string;
  players: number;
  holes: string;
  playerType: string;
  addOns: string[];
  name: string;
  email: string;
  phone: string;
  totalPrice: number;
  status: 'Confirmed';
  createdAt: string;
};

const STEPS = ['Date', 'Time', 'Players', 'Round length', 'Player type', 'Add-ons', 'Your details', 'Summary & payment', 'Confirmation'] as const;

const BASE_GREEN_FEE = 50;

function generateReference(): string {
  return `CCC-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

export function BookingWizard() {
  const [step, setStep] = useState(0);
  const [date, setDate] = useState('2026-09-14');
  const [time, setTime] = useState('');
  const [players, setPlayers] = useState(2);
  const [holesId, setHolesId] = useState('18');
  const [playerTypeId, setPlayerTypeId] = useState('member');
  const [addOnIds, setAddOnIds] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'account'>('card');
  const [confirmedBooking, setConfirmedBooking] = useState<BookingRecord | null>(null);
  const { add: addBooking } = useLocalCollection<BookingRecord>('chapman:bookings');

  const holesOption = bookingConfig.holesOptions.find((h) => h.id === holesId) ?? bookingConfig.holesOptions[0];
  const playerType = bookingConfig.playerTypes.find((p) => p.id === playerTypeId) ?? bookingConfig.playerTypes[0];

  const totalPrice = useMemo(() => {
    const perPlayer = (BASE_GREEN_FEE * holesOption.priceModifier) + playerType.basePrice;
    const roundTotal = perPlayer * players;
    const addOnsTotal = addOnIds.reduce((sum, id) => {
      const addOn = bookingConfig.addOns.find((a) => a.id === id);
      return sum + (addOn ? addOn.price : 0);
    }, 0) * players;
    return Math.round(roundTotal + addOnsTotal);
  }, [holesOption, playerType, players, addOnIds]);

  function toggleAddOn(id: string) {
    setAddOnIds((current) => (current.includes(id) ? current.filter((a) => a !== id) : [...current, id]));
  }

  function canAdvance(): boolean {
    switch (step) {
      case 0: return Boolean(date);
      case 1: return Boolean(time);
      case 2: return players >= 1;
      case 6: return Boolean(name && email && phone);
      default: return true;
    }
  }

  function handleConfirm() {
    const record: BookingRecord = {
      id: crypto.randomUUID(),
      reference: generateReference(),
      date, time, players, holes: holesOption.label, playerType: playerType.label,
      addOns: addOnIds.map((id) => bookingConfig.addOns.find((a) => a.id === id)?.label ?? id),
      name, email, phone, totalPrice, status: 'Confirmed',
      createdAt: new Date().toISOString(),
    };
    addBooking(record);
    setConfirmedBooking(record);
    setStep(8);
  }

  function handleAddToCalendar() {
    if (!confirmedBooking) return;
    const [hour, minute] = confirmedBooking.time.split(':').map(Number);
    const start = new Date(confirmedBooking.date);
    start.setHours(hour, minute, 0, 0);
    downloadIcsFile(
      {
        uid: `${confirmedBooking.reference}@${club.email.split('@')[1]}`,
        title: `Tee time at ${club.name} (${confirmedBooking.reference})`,
        description: `${confirmedBooking.players} players · ${confirmedBooking.holes} · ${confirmedBooking.playerType}`,
        location: `${club.name}, ${club.address}`,
        start,
        durationMinutes: confirmedBooking.holes.startsWith('9') ? 150 : 270,
      },
      `chinhoyi-tee-time-${confirmedBooking.reference}.ics`,
    );
  }

  if (confirmedBooking) {
    return (
      <div className="mt-14 max-w-2xl border border-[#2E6B4E]/30 bg-[#F7F5EF] p-7 md:p-10">
        <CircleCheck className="text-[#2E6B4E]" size={36} />
        <h2 className="font-display mt-6 text-4xl text-[#12372A]">You're on the tee sheet.</h2>
        <p className="mt-4 text-sm leading-7 text-[#5d6b63]">
          Your request for <strong>{confirmedBooking.date}</strong> at <strong>{confirmedBooking.time}</strong> for{' '}
          <strong>{confirmedBooking.players} players</strong> ({confirmedBooking.holes}) is confirmed.
        </p>
        <div className="mt-6 grid gap-2 border-t border-[#12372A]/10 pt-5 text-sm text-[#5d6b63]">
          <div className="flex justify-between"><span>Booking reference</span><strong className="text-[#12372A]">{confirmedBooking.reference}</strong></div>
          <div className="flex justify-between"><span>Player type</span><span className="text-[#12372A]">{confirmedBooking.playerType}</span></div>
          {confirmedBooking.addOns.length > 0 && (
            <div className="flex justify-between"><span>Add-ons</span><span className="text-[#12372A]">{confirmedBooking.addOns.join(', ')}</span></div>
          )}
          <div className="flex justify-between"><span>Total</span><strong className="text-[#12372A]">${confirmedBooking.totalPrice}</strong></div>
        </div>
        <div className="mt-7 flex flex-wrap gap-3">
          <button
            onClick={handleAddToCalendar}
            className="flex items-center gap-2 bg-[#12372A] px-5 py-3 text-[10px] font-bold tracking-[.14em] text-[#F7F5EF] hover:bg-[#2E6B4E]"
            data-testid="button-add-to-calendar"
          >
            <Download size={14} /> ADD TO CALENDAR
          </button>
          <a
            href={`data:text/plain;charset=utf-8,${encodeURIComponent(`${club.name} — Booking Confirmation\nReference: ${confirmedBooking.reference}\nDate: ${confirmedBooking.date}\nTime: ${confirmedBooking.time}\nPlayers: ${confirmedBooking.players}\nRound: ${confirmedBooking.holes}\nTotal: $${confirmedBooking.totalPrice}`)}`}
            download={`chinhoyi-booking-${confirmedBooking.reference}.txt`}
            className="flex items-center gap-2 border border-[#12372A]/25 px-5 py-3 text-[10px] font-bold tracking-[.14em] text-[#12372A] hover:border-[#2E6B4E]"
            data-testid="link-download-confirmation"
          >
            <Download size={14} /> DOWNLOAD CONFIRMATION
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-14 max-w-3xl bg-[#F7F5EF] p-5 shadow-[0_18px_45px_rgba(18,55,42,.08)] md:p-9">
      <div className="flex items-center justify-between border-b border-[#12372A]/15 pb-4">
        <span className="font-mono-club text-[9px] tracking-[.14em] text-[#5d6b63]">STEP {step + 1} OF {STEPS.length - 1}</span>
        <span className="font-mono-club text-[9px] tracking-[.14em] text-[#2E6B4E]">{STEPS[step].toUpperCase()}</span>
      </div>
      <div className="mt-3 h-1 w-full bg-[#e5e2d8]">
        <div className="h-full bg-[#C8A951] transition-all" style={{ width: `${((step + 1) / (STEPS.length - 1)) * 100}%` }} />
      </div>

      {step === 0 && (
        <div className="reveal pt-7">
          <label className="font-mono-club text-[9px] tracking-[.16em] text-[#5d6b63]" htmlFor="booking-date">SELECT A DATE</label>
          <input id="booking-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-3 block w-full border border-[#cfd4cd] bg-transparent px-4 py-4 text-[#12372A] outline-none focus:border-[#2E6B4E]" data-testid="input-booking-date" />
        </div>
      )}

      {step === 1 && (
        <div className="reveal pt-7">
          <label className="font-mono-club text-[9px] tracking-[.16em] text-[#5d6b63]">AVAILABLE TIMES · {date}</label>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {bookingConfig.timeSlots.map((t) => (
              <button
                key={t}
                onClick={() => setTime(t)}
                className={`border px-3 py-4 text-sm transition-colors hover:border-[#2E6B4E] hover:bg-[#e8e9df] ${time === t ? 'border-[#2E6B4E] bg-[#e8e9df] text-[#12372A]' : 'border-[#cfd4cd] text-[#5d6b63]'}`}
                data-testid={`button-booking-time-${t.replace(':', '')}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="reveal pt-7">
          <label className="font-mono-club text-[9px] tracking-[.16em] text-[#5d6b63]" htmlFor="booking-players">HOW MANY PLAYERS?</label>
          <select
            id="booking-players"
            value={players}
            onChange={(e) => setPlayers(Number(e.target.value))}
            className="mt-3 block w-full appearance-none border border-[#cfd4cd] bg-[#F7F5EF] px-4 py-4 text-[#12372A] outline-none focus:border-[#2E6B4E]"
            data-testid="select-booking-players"
          >
            {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n} player{n > 1 ? 's' : ''}</option>)}
          </select>
        </div>
      )}

      {step === 3 && (
        <div className="reveal pt-7">
          <label className="font-mono-club text-[9px] tracking-[.16em] text-[#5d6b63]">9 OR 18 HOLES?</label>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {bookingConfig.holesOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setHolesId(option.id)}
                className={`border px-4 py-5 text-left transition-colors hover:border-[#2E6B4E] ${holesId === option.id ? 'border-[#2E6B4E] bg-[#e8e9df]' : 'border-[#cfd4cd]'}`}
                data-testid={`button-booking-holes-${option.id}`}
              >
                <span className="font-display text-2xl text-[#12372A]">{option.label}</span>
                <p className="mt-1 text-xs text-[#5d6b63]">${Math.round(BASE_GREEN_FEE * option.priceModifier)} green fee per player</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="reveal pt-7">
          <label className="font-mono-club text-[9px] tracking-[.16em] text-[#5d6b63]">PLAYER TYPE</label>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {bookingConfig.playerTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setPlayerTypeId(type.id)}
                className={`border px-4 py-5 text-left transition-colors hover:border-[#2E6B4E] ${playerTypeId === type.id ? 'border-[#2E6B4E] bg-[#e8e9df]' : 'border-[#cfd4cd]'}`}
                data-testid={`button-booking-playertype-${type.id}`}
              >
                <span className="font-display text-xl text-[#12372A]">{type.label}</span>
                <p className="mt-1 text-xs text-[#5d6b63]">{type.basePrice > 0 ? `+$${type.basePrice} per player` : 'Included'}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="reveal pt-7">
          <label className="font-mono-club text-[9px] tracking-[.16em] text-[#5d6b63]">CART, CADDIE OR CLUB RENTAL?</label>
          <div className="mt-4 grid gap-2">
            {bookingConfig.addOns.map((addOn) => {
              const active = addOnIds.includes(addOn.id);
              return (
                <button
                  key={addOn.id}
                  onClick={() => toggleAddOn(addOn.id)}
                  className={`flex items-center justify-between border px-4 py-4 text-left transition-colors hover:border-[#2E6B4E] ${active ? 'border-[#2E6B4E] bg-[#e8e9df]' : 'border-[#cfd4cd]'}`}
                  data-testid={`button-booking-addon-${addOn.id}`}
                >
                  <span className="text-sm text-[#12372A]">{addOn.label}</span>
                  <span className="flex items-center gap-3 text-xs text-[#5d6b63]">
                    ${addOn.price} / player
                    <span className={`grid h-5 w-5 place-items-center rounded-full border ${active ? 'border-[#2E6B4E] bg-[#2E6B4E] text-white' : 'border-[#c9cec8]'}`}>
                      {active && <Check size={12} />}
                    </span>
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
            <label className="font-mono-club text-[9px] tracking-[.16em] text-[#5d6b63]" htmlFor="booking-name">FULL NAME</label>
            <input id="booking-name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-2 w-full border border-[#cfd4cd] bg-transparent px-4 py-3.5 text-sm text-[#12372A] outline-none focus:border-[#2E6B4E]" data-testid="input-booking-name" />
          </div>
          <div>
            <label className="font-mono-club text-[9px] tracking-[.16em] text-[#5d6b63]" htmlFor="booking-email">EMAIL ADDRESS</label>
            <input id="booking-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-2 w-full border border-[#cfd4cd] bg-transparent px-4 py-3.5 text-sm text-[#12372A] outline-none focus:border-[#2E6B4E]" data-testid="input-booking-email" />
          </div>
          <div>
            <label className="font-mono-club text-[9px] tracking-[.16em] text-[#5d6b63]" htmlFor="booking-phone">PHONE NUMBER</label>
            <input id="booking-phone" value={phone} onChange={(e) => setPhone(e.target.value)} required className="mt-2 w-full border border-[#cfd4cd] bg-transparent px-4 py-3.5 text-sm text-[#12372A] outline-none focus:border-[#2E6B4E]" data-testid="input-booking-phone" />
          </div>
        </div>
      )}

      {step === 7 && (
        <div className="reveal pt-7">
          <p className="font-mono-club text-[9px] tracking-[.16em] text-[#5d6b63]">BOOKING SUMMARY</p>
          <div className="mt-4 grid gap-2 border border-[#12372A]/10 bg-white p-5 text-sm text-[#5d6b63]">
            <div className="flex justify-between"><span>Date</span><span className="text-[#12372A]">{date}</span></div>
            <div className="flex justify-between"><span>Time</span><span className="text-[#12372A]">{time}</span></div>
            <div className="flex justify-between"><span>Players</span><span className="text-[#12372A]">{players}</span></div>
            <div className="flex justify-between"><span>Round</span><span className="text-[#12372A]">{holesOption.label}</span></div>
            <div className="flex justify-between"><span>Player type</span><span className="text-[#12372A]">{playerType.label}</span></div>
            {addOnIds.length > 0 && (
              <div className="flex justify-between"><span>Add-ons</span><span className="text-[#12372A]">{addOnIds.map((id) => bookingConfig.addOns.find((a) => a.id === id)?.label).join(', ')}</span></div>
            )}
            <div className="mt-2 flex justify-between border-t border-[#12372A]/10 pt-2 text-base font-semibold">
              <span className="text-[#12372A]">Total</span><span className="text-[#12372A]">${totalPrice}</span>
            </div>
          </div>
          <p className="mt-6 font-mono-club text-[9px] tracking-[.16em] text-[#5d6b63]">PAYMENT METHOD</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <button onClick={() => setPaymentMethod('card')} className={`border px-4 py-4 text-left text-sm transition-colors hover:border-[#2E6B4E] ${paymentMethod === 'card' ? 'border-[#2E6B4E] bg-[#e8e9df] text-[#12372A]' : 'border-[#cfd4cd] text-[#5d6b63]'}`} data-testid="button-payment-card">Card on file</button>
            <button onClick={() => setPaymentMethod('account')} className={`border px-4 py-4 text-left text-sm transition-colors hover:border-[#2E6B4E] ${paymentMethod === 'account' ? 'border-[#2E6B4E] bg-[#e8e9df] text-[#12372A]' : 'border-[#cfd4cd] text-[#5d6b63]'}`} data-testid="button-payment-account">Bill to member account</button>
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        {step > 0 ? (
          <button onClick={() => setStep((s) => s - 1)} className="flex items-center justify-center gap-2 py-4 text-[10px] font-bold tracking-[.15em] text-[#5d6b63]" data-testid="button-booking-back">
            <ChevronLeft size={14} /> BACK
          </button>
        ) : <span />}
        {step < 7 ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canAdvance()}
            className="flex items-center justify-center gap-2 bg-[#12372A] py-4 px-6 text-[10px] font-bold tracking-[.15em] text-[#F7F5EF] transition-colors hover:bg-[#2E6B4E] disabled:cursor-not-allowed disabled:opacity-40"
            data-testid="button-booking-next"
          >
            CONTINUE <ChevronRight size={14} />
          </button>
        ) : (
          <button onClick={handleConfirm} className="flex items-center justify-center gap-2 bg-[#C8A951] px-6 py-4 text-[10px] font-bold tracking-[.15em] text-[#17201C] hover:bg-[#e3c86b]" data-testid="button-confirm-booking">
            CONFIRM & PAY ${totalPrice} <Check size={14} />
          </button>
        )}
      </div>
      <div className="mt-8 flex gap-4 text-xs text-[#5d6b63]">
        <Clock3 size={16} className="text-[#2E6B4E] shrink-0" />
        <span>Guest rates from $35 · Cancellations welcome up to 24 hours before play.</span>
      </div>
    </div>
  );
}
