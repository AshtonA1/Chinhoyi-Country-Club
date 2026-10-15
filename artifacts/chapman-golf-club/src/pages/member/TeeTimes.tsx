import { Link } from 'wouter';
import { CalendarCheck, ArrowUpRight } from 'lucide-react';
import { MemberShell, PortalHeading } from './MemberShell';
import { SectionLabel, usePageMeta } from '@/components/layout/Shared';
import { SampleChip } from '@/components/layout/Portal';
import { DownloadPdfButton } from '@/components/DownloadButtons';
import { bookingDocument, roundReceiptDocument } from '@/lib/documents';
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
        action={<Link href="/tee-times" className="inline-flex items-center gap-2 bg-club-green px-5 py-4 text-[10px] font-bold tracking-[.14em] text-club-white hover:bg-club-ink">BOOK A ROUND <ArrowUpRight size={14} /></Link>}
      />
      <section className="mt-8">
        <SectionLabel>UPCOMING</SectionLabel>
        <div className="mt-4 grid gap-3">
          {upcoming.length === 0 && <p className="text-sm text-club-ink/70">No upcoming tee times.</p>}
          {upcoming.map((t) => (
            <div key={t.id} className="flex flex-col gap-4 border border-club-ink/10 bg-club-white p-5 sm:flex-row sm:items-center">
              <div className="flex items-center gap-4">
                <CalendarCheck className="text-club-green" size={20} />
                <div>
                  <p className="font-mono-club text-[9px] tracking-[.12em] text-club-green">{formatDate(t.date).toUpperCase()} · REF {t.reference}</p>
                  <p className="mt-1 font-display text-3xl text-club-ink">{t.time}</p>
                </div>
              </div>
              <p className="text-sm text-club-ink/70 sm:ml-8">{t.players} {t.players === 1 ? 'player' : 'players'} · {t.holes} · {formatMoney(t.totalPrice, pricing.currencySymbol)} · {t.status}</p>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 sm:ml-auto">
                <DownloadPdfButton variant="link" label="CONFIRMATION (PDF)" build={() => bookingDocument(t, pricing.currencySymbol)} testId={`button-pdf-${t.id}`} />
                {canCancel(t, settings) ? (
                  <button onClick={() => update(t.id, { status: 'Cancelled' })} className="text-[10px] font-bold tracking-[.13em] text-club-green" data-testid={`button-cancel-${t.id}`}>
                    CANCEL REQUEST
                  </button>
                ) : (
                  <span className="text-xs text-club-ink/50">Within {settings.cancellationHours}h: please contact the club to cancel.</span>
                )}
              </div>
            </div>
          ))}
        </div>
        {cancelled.length > 0 && (
          <p className="mt-4 text-xs text-club-ink/70">{cancelled.length} cancelled request{cancelled.length > 1 ? 's' : ''} kept on record.</p>
        )}
      </section>
      <section className="mt-12">
        <div className="flex items-center gap-3"><SectionLabel>PLAYING HISTORY</SectionLabel><SampleChip /></div>
        <div className="mt-4 overflow-x-auto border border-club-ink/10 bg-club-white">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="border-b border-club-ink/10 bg-club-gold/10 font-mono-club text-[9px] tracking-[.12em] text-club-ink/70">
              <tr><th className="px-5 py-4">DATE</th><th className="px-5 py-4">TEE TIME</th><th className="px-5 py-4">ROUND</th><th className="px-5 py-4">SCORE</th><th className="px-5 py-4">RECEIPT</th></tr>
            </thead>
            <tbody>
              {samplePastRounds.map((row) => (
                <tr key={row.date} className="border-b border-club-ink/10 last:border-0">
                  <td className="px-5 py-4 font-mono-club text-[10px] text-club-green">{formatDate(row.date).toUpperCase()}</td>
                  <td className="px-5 py-4 text-club-ink">{row.time}</td>
                  <td className="px-5 py-4 text-club-ink/70">{row.detail}</td>
                  <td className="px-5 py-4 font-display text-xl text-club-ink">{row.score}</td>
                  <td className="px-5 py-4">
                    <DownloadPdfButton variant="link" label="DOWNLOAD" build={() => roundReceiptDocument(row)} />
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
