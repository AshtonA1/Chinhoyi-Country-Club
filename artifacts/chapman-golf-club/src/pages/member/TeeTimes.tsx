import { useState } from 'react';
import { Link } from 'wouter';
import { CalendarCheck, ArrowUpRight } from 'lucide-react';
import { MemberShell, PortalHeading } from './MemberShell';
import { SectionLabel, usePageMeta } from '@/components/layout/Shared';
import { useLocalCollection } from '@/lib/local-store';
import { club } from '@/data/club';

type BookingRecord = { id: string; reference: string; date: string; time: string; players: number; holes: string; totalPrice: number };

const past = [
  { date: 'SAT 31 MAY', time: '08:20', detail: '4 players · Member game', score: '86' },
  { date: 'SUN 18 MAY', time: '06:40', detail: '2 players · Guest round', score: '91' },
  { date: 'FRI 02 MAY', time: '13:30', detail: '1 player · Member play', score: '84' },
];

export default function MemberTeeTimes() {
  usePageMeta('My tee times', 'Upcoming reservations and your complete playing history.');
  const { items: bookings, remove } = useLocalCollection<BookingRecord>('chapman:bookings');
  const [cancelled, setCancelled] = useState<string[]>([]);

  return (
    <MemberShell>
      <PortalHeading
        eyebrow="MEMBER ROOM / TEE TIMES"
        title="Your tee sheet."
        copy="Upcoming reservations and your complete playing history."
        action={<Link href="/tee-times" className="inline-flex items-center gap-2 bg-[#12372A] px-5 py-4 text-[10px] font-bold tracking-[.14em] text-[#F7F5EF] hover:bg-[#2E6B4E]">BOOK A ROUND <ArrowUpRight size={14} /></Link>}
      />
      <section className="mt-8">
        <SectionLabel>UPCOMING</SectionLabel>
        <div className="mt-4 grid gap-3">
          {bookings.length === 0 && <p className="text-sm text-[#5d6b63]">No upcoming tee times.</p>}
          {bookings.map((t) => (
            <div key={t.id} className="flex flex-col gap-4 border border-[#12372A]/10 bg-[#F7F5EF] p-5 sm:flex-row sm:items-center">
              <div className="flex items-center gap-4">
                <CalendarCheck className="text-[#2E6B4E]" size={20} />
                <div>
                  <p className="font-mono-club text-[9px] tracking-[.12em] text-[#2E6B4E]">{t.date} · REF {t.reference}</p>
                  <p className="mt-1 font-display text-3xl text-[#12372A]">{t.time}</p>
                </div>
              </div>
              <p className="text-sm text-[#5d6b63] sm:ml-8">{t.players} players · {t.holes} · ${t.totalPrice}</p>
              {cancelled.includes(t.id) ? (
                <span className="sm:ml-auto text-[10px] font-bold tracking-[.13em] text-[#9aa29b]">CANCELLATION REQUESTED</span>
              ) : (
                <button onClick={() => { setCancelled((c) => [...c, t.id]); remove(t.id); }} className="sm:ml-auto text-[10px] font-bold tracking-[.13em] text-[#2E6B4E]">
                  CANCEL BOOKING
                </button>
              )}
            </div>
          ))}
        </div>
      </section>
      <section className="mt-12">
        <SectionLabel>PLAYING HISTORY</SectionLabel>
        <div className="mt-4 overflow-x-auto border border-[#12372A]/10 bg-[#F7F5EF]">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="border-b border-[#12372A]/10 bg-[#e8e9df] font-mono-club text-[9px] tracking-[.12em] text-[#5d6b63]">
              <tr><th className="px-5 py-4">DATE</th><th className="px-5 py-4">TEE TIME</th><th className="px-5 py-4">ROUND</th><th className="px-5 py-4">SCORE</th><th className="px-5 py-4">RECEIPT</th></tr>
            </thead>
            <tbody>
              {past.map((row) => (
                <tr key={row.date} className="border-b border-[#12372A]/10 last:border-0">
                  <td className="px-5 py-4 font-mono-club text-[10px] text-[#2E6B4E]">{row.date}</td>
                  <td className="px-5 py-4 text-[#12372A]">{row.time}</td>
                  <td className="px-5 py-4 text-[#5d6b63]">{row.detail}</td>
                  <td className="px-5 py-4 font-display text-xl text-[#12372A]">{row.score}</td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => {
                        const content = `${club.name} — Receipt\n\nDate: ${row.date}\nTee time: ${row.time}\nRound: ${row.detail}\nScore: ${row.score}\n`;
                        const link = document.createElement('a');
                        link.href = `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`;
                        link.download = `chinhoyi-receipt-${row.date.replace(/\s/g, '-')}.txt`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="text-[10px] font-bold tracking-[.12em] text-[#2E6B4E]"
                    >
                      VIEW <ArrowUpRight size={13} className="inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </MemberShell>
  );
}
