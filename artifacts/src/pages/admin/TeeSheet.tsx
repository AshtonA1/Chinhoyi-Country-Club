import { useState } from 'react';
import { ChevronLeft, ChevronRight, CircleCheck, MoreHorizontal, Plus } from 'lucide-react';
import { AdminShell, PortalHeading } from './AdminShell';
import { bookingConfig } from '@/data/club';

export default function AdminTeeSheet() {
  const [date, setDate] = useState('2026-09-14');
  const [added, setAdded] = useState(false);
  const slots = bookingConfig.timeSlots;
  return (
    <AdminShell>
      <PortalHeading
        eyebrow="ADMIN PORTAL / TEE SHEET"
        title="Run the day."
        copy="A live view of every arrival, group and open slot."
        action={<button onClick={() => setAdded(true)} className="inline-flex items-center gap-2 bg-[#12372A] px-5 py-4 text-[10px] font-bold tracking-[.14em] text-[#F7F5EF]"><Plus size={14} /> ADD BOOKING</button>}
      />
      {added && <div className="mt-5 flex items-center gap-3 border border-[#2E6B4E]/20 bg-[#e4eee6] p-4 text-sm text-[#2E6B4E]"><CircleCheck size={17} />New booking drawer opened for this demo.</div>}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <button className="grid h-10 w-10 place-items-center border border-[#12372A]/15"><ChevronLeft size={16} /></button>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="border border-[#12372A]/15 bg-[#F7F5EF] px-4 py-2.5 text-sm text-[#12372A]" />
          <button className="grid h-10 w-10 place-items-center border border-[#12372A]/15"><ChevronRight size={16} /></button>
        </div>
        <div className="flex gap-2 text-[10px] font-bold tracking-[.12em]">
          <span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-[#2E6B4E]" />BOOKED 42</span>
          <span className="ml-3 flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-[#C8A951]" />OPEN 14</span>
        </div>
      </div>
      <div className="mt-5 overflow-x-auto border border-[#12372A]/10 bg-[#F7F5EF]">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-[#12372A]/10 bg-[#e8e9df] font-mono-club text-[9px] tracking-[.12em] text-[#5d6b63]">
            <tr><th className="px-5 py-4">TIME</th><th className="px-5 py-4">BOOKING</th><th className="px-5 py-4">PLAYERS</th><th className="px-5 py-4">TYPE</th><th className="px-5 py-4">STATUS</th><th className="px-5 py-4" /></tr>
          </thead>
          <tbody>
            {slots.map((slot, i) => (
              <tr key={slot} className="border-b border-[#12372A]/10 last:border-0">
                <td className="px-5 py-4 font-mono-club text-[10px] text-[#2E6B4E]">{slot}</td>
                <td className="px-5 py-4 font-medium text-[#12372A]">{i === 0 ? 'M. Chikore' : i === 1 ? 'Tendai Moyo' : i === 2 ? 'A. Ncube' : i === 3 ? 'T. Moyo + guests' : 'Open tee time'}</td>
                <td className="px-5 py-4 text-[#5d6b63]">{i < 4 ? `${[4, 2, 3, 4][i]} players` : '—'}</td>
                <td className="px-5 py-4 text-[#5d6b63]">{i < 4 ? 'Member' : 'Public'}</td>
                <td className="px-5 py-4">
                  {i < 4 ? (
                    <span className="border border-[#2E6B4E]/25 bg-[#e4eee6] px-2 py-1 text-[9px] font-bold tracking-[.1em] text-[#2E6B4E]">CONFIRMED</span>
                  ) : (
                    <span className="border border-[#C8A951]/40 bg-[#fbf3d8] px-2 py-1 text-[9px] font-bold tracking-[.1em] text-[#8b6e16]">OPEN</span>
                  )}
                </td>
                <td className="px-5 py-4 text-right"><button aria-label={`Manage ${slot}`}><MoreHorizontal size={17} className="text-[#5d6b63]" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
