import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AdminShell, PortalHeading } from './AdminShell';
import { GhostButton } from '@/components/admin/Form';
import { useBookings } from '@/lib/bookings';
import { useBookingSettings } from '@/lib/club-data';
import { addDaysIso, formatDate, hasStarted, isIsoDate, todayIso } from '@/lib/dates';
import { useCan } from '@/lib/permissions';

export default function AdminTeeSheet() {
  const [date, setDate] = useState(todayIso());
  const { value: settings } = useBookingSettings();
  const { items, update } = useBookings();
  const canWrite = useCan('tee_sheet', 'write');
  const slots = settings.slots;
  const day = items.filter((b) => b.date === date && b.status !== 'Cancelled');
  const booked = slots.filter((s) => day.some((b) => b.time === s)).length;
  const move = (n: number) => setDate((d) => addDaysIso(isIsoDate(d) ? d : todayIso(), n));

  return (
    <AdminShell>
      <PortalHeading eyebrow="ADMIN / TEE SHEET" title="Run the day." copy={`${formatDate(date)}. Requests from the website appear in their slot. Slots are set under Fees & settings.`} />
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => move(-1)} aria-label="Previous day" className="grid h-10 w-10 place-items-center border border-club-ink/15 hover:border-club-green"><ChevronLeft size={16} /></button>
          <input type="date" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} className="border border-club-ink/15 bg-club-white px-4 py-2.5 text-sm text-club-ink" />
          <button onClick={() => move(1)} aria-label="Next day" className="grid h-10 w-10 place-items-center border border-club-ink/15 hover:border-club-green"><ChevronRight size={16} /></button>
          <button onClick={() => setDate(todayIso())} className="px-3 text-[10px] font-bold tracking-[.12em] text-club-green">TODAY</button>
        </div>
        <div className="flex gap-2 text-[10px] font-bold tracking-[.12em]">
          <span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-club-green" />BOOKED {booked}</span>
          <span className="ml-3 flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-club-gold" />OPEN {slots.length - booked}</span>
        </div>
      </div>
      <div className="mt-5 overflow-x-auto border border-club-ink/10 bg-club-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-club-ink/10 bg-club-gold/10 font-mono-club text-[9px] tracking-[.12em] text-club-ink/70">
            <tr><th className="px-5 py-4">TIME</th><th className="px-5 py-4">BOOKING</th><th className="px-5 py-4">PLAYERS</th><th className="px-5 py-4">TYPE</th><th className="px-5 py-4">STATUS</th><th className="px-5 py-4" /></tr>
          </thead>
          <tbody>
            {slots.map((slot) => {
              const here = day.filter((b) => b.time === slot);
              const passed = isIsoDate(date) && hasStarted(date, slot);
              if (here.length === 0) {
                return (
                  <tr key={slot} className="border-b border-club-ink/10 last:border-0">
                    <td className="px-5 py-4 font-mono-club text-[10px] text-club-green">{slot}</td>
                    <td className="px-5 py-4 text-club-ink/50">{passed ? 'Passed, no booking' : 'Open tee time'}</td>
                    <td className="px-5 py-4 text-club-ink/70">—</td><td className="px-5 py-4 text-club-ink/70">—</td>
                    <td className="px-5 py-4"><span className="border border-club-gold/40 bg-club-gold/15 px-2 py-1 text-[9px] font-bold tracking-[.1em] text-club-gold-deep">OPEN</span></td>
                    <td />
                  </tr>
                );
              }
              return here.map((b) => (
                <tr key={b.id} className="border-b border-club-ink/10 last:border-0">
                  <td className="px-5 py-4 font-mono-club text-[10px] text-club-green">{slot}</td>
                  <td className="px-5 py-4 font-medium text-club-ink">{b.name}<br /><span className="text-xs font-normal text-club-ink/70">{b.reference} · {b.phone}</span></td>
                  <td className="px-5 py-4 text-club-ink/70">{b.players} {b.players === 1 ? 'player' : 'players'}</td>
                  <td className="px-5 py-4 text-club-ink/70">{b.playerType} · {b.holes}</td>
                  <td className="px-5 py-4">
                    <span className={`border px-2 py-1 text-[9px] font-bold tracking-[.1em] ${b.status === 'Confirmed' ? 'border-club-green/25 bg-club-green/10 text-club-green' : 'border-club-gold/40 bg-club-gold/15 text-club-gold-deep'}`}>{b.status.toUpperCase()}</span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    {canWrite && (
                      <div className="flex justify-end gap-2">
                        {b.status === 'Requested' && <GhostButton onClick={() => update(b.id, { status: 'Confirmed' })}>CONFIRM</GhostButton>}
                        <GhostButton onClick={() => update(b.id, { status: 'Cancelled' })}>CANCEL</GhostButton>
                      </div>
                    )}
                  </td>
                </tr>
              ));
            })}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
