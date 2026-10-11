import { Link } from 'wouter';
import { CalendarCheck, ArrowUpRight } from 'lucide-react';
import { MemberShell, PortalHeading } from './MemberShell';
import { SectionLabel, usePageMeta } from '@/components/layout/Shared';
import { SampleChip } from '@/components/layout/Portal';
import { club } from '@/data/club';
import { samplePastRounds } from '@/data/sample';
import { byDateAsc, canCancel, isUpcomingBooking, useBookings } from '@/lib/bookings';
import { useBookingSettings, usePricing } from '@/lib/club-data';
import { formatDate } from '@/lib/dates';
import { formatMoney } from '@/lib/format';

export default function MemberTeeTimes() {
  usePageMeta('My tee times', 'Upcoming tee time requests and your playing history.');
  const { items: bookings, update } = useBookings();
  const { value: settings } = useBookingSettings();
  const { value: pricing } = usePricing();
  const upcoming = bookings.filter((b) => isUpcomingBooking(b)).sort(byDateAsc);
  const cancelled = bookings.filter((b) => b.status === 'Cancelled');

  return (
    <MemberShell>
      <PortalHeading
        eyebrow="MEMBER ROOM / TEE TIMES"
        title="Your tee times."
        copy="Upcoming requests and your playing history."
        action={<Link href="/tee-times" className="inline-flex items-center gap-2 bg-[#12372A] px-5 py-4 text-[10px] font-bold tracking-[.14em] text-[#F7F5EF] hover:bg-[#2E6B4E]">BOOK A ROUND <ArrowUpRight size={14} /></Link>}
      />
      <section className="mt-8">
        <SectionLabel>UPCOMING</SectionLabel>
        <div className="mt-4 grid gap-3">
          {upcoming.length === 0 && <p className="text-sm text-[#5d6b63]">No upcoming tee times.</p>}
          {upcoming.map((t) => (
            <div key={t.id} className="flex flex-col gap-4 border border-[#12372A]/10 bg-[#F7F5EF] p-5 sm:flex-row sm:items-center">
              <div className="flex items-center gap-4">
                <CalendarCheck className="text-[#2E6B4E]" size={20} />
                <div>
                  <p className="font-mono-club text-[9px] tracking-[.12em] text-[#2E6B4E]">{formatDate(t.date).toUpperCase()} · REF {t.reference}</p>
                  <p className="mt-1 font-display text-3xl text-[#12372A]">{t.time}</p>
                </div>
              </div>
              <p className="text-sm text-[#5d6b63] sm:ml-8">{t.players} {t.players === 1 ? 'player' : 'players'} · {t.holes} · {formatMoney(t.totalPrice, pricing.currencySymbol)} · {t.status}</p>
              {canCancel(t, settings) ? (
                <button onClick={() => update(t.id, { status: 'Cancelled' })} className="text-[10px] font-bold tracking-[.13em] text-[#2E6B4E] sm:ml-auto" data-testid={`button-cancel-${t.id}`}>
                  CANCEL REQUEST
                </button>
              ) : (
                <span className="text-xs text-[#9aa29b] sm:ml-auto">Within {settings.cancellationHours}h: please contact the club to cancel.</span>
              )}
            </div>
          ))}
        </div>
        {cancelled.length > 0 && (
          <p className="mt-4 text-xs text-[#5d6b63]">{cancelled.length} cancelled request{cancelled.length > 1 ? 's' : ''} kept on record.</p>
        )}
      </section>
      <section className="mt-12">
        <div className="flex items-center gap-3"><SectionLabel>PLAYING HISTORY</SectionLabel><SampleChip /></div>
        <div className="mt-4 overflow-x-auto border border-[#12372A]/10 bg-[#F7F5EF]">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="border-b border-[#12372A]/10 bg-[#e8e9df] font-mono-club text-[9px] tracking-[.12em] text-[#5d6b63]">
              <tr><th className="px-5 py-4">DATE</th><th className="px-5 py-4">TEE TIME</th><th className="px-5 py-4">ROUND</th><th className="px-5 py-4">SCORE</th><th className="px-5 py-4">RECEIPT</th></tr>
            </thead>
            <tbody>
              {samplePastRounds.map((row) => (
                <tr key={row.date} className="border-b border-[#12372A]/10 last:border-0">
                  <td className="px-5 py-4 font-mono-club text-[10px] text-[#2E6B4E]">{formatDate(row.date).toUpperCase()}</td>
                  <td className="px-5 py-4 text-[#12372A]">{row.time}</td>
                  <td className="px-5 py-4 text-[#5d6b63]">{row.detail}</td>
                  <td className="px-5 py-4 font-display text-xl text-[#12372A]">{row.score}</td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => {
                        const content = `${club.name} — Sample receipt\n\nDate: ${formatDate(row.date)}\nTee time: ${row.time}\nRound: ${row.detail}\nScore: ${row.score}\n`;
                        const link = document.createElement('a');
                        link.href = `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`;
                        link.download = `sample-receipt-${row.date}.txt`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="text-[10px] font-bold tracking-[.12em] text-[#2E6B4E]"
                    >
                      DOWNLOAD <ArrowUpRight size={13} className="inline" />
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
