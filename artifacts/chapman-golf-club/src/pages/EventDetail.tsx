import { useParams } from 'wouter';
import { CalendarClock, CalendarDays } from 'lucide-react';
import { Link } from 'wouter';
import { CalendarButton, DownloadPdfButton } from '@/components/DownloadButtons';
import { EventEntryForm } from '@/components/events/EventEntryForm';
import { SponsorshipForm } from '@/components/events/SponsorshipForm';
import { Footer } from '@/components/layout/Footer';
import { PageIntro, SectionLabel, usePageMeta } from '@/components/layout/Shared';
import { images } from '@/data/club';
import { dateParts, formatDate, isUpcoming } from '@/lib/dates';
import { eventDocument } from '@/lib/documents';
import { formatMoney } from '@/lib/format';
import { clubEventIcs } from '@/lib/ics';
import { useEvents } from '@/lib/club-data';
import NotFound from '@/pages/not-found';

function List({ title, lines, icon = false }: { title: string; lines: string[]; icon?: boolean }) {
  if (lines.length === 0) return null;
  return (
    <div className="mt-10 first:mt-0">
      <SectionLabel>{title}</SectionLabel>
      <ul className="mt-4 grid gap-3 border-t border-club-ink/15 pt-5 text-sm text-club-ink/70">
        {lines.map((line) => (
          <li key={line} className="flex items-start gap-3">
            {icon ? <CalendarClock size={15} className="mt-0.5 shrink-0 text-club-green" /> : <span className="text-club-gold">—</span>}
            {line}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function EventDetail() {
  const { eventId } = useParams<{ eventId: string }>();
  const { items } = useEvents();
  const event = items.find((e) => e.id === eventId);
  usePageMeta(event?.title ?? 'Event', event?.text ?? '');

  if (!event) return <NotFound />;
  const p = dateParts(event.date);
  const hasPrices = event.singlePrice !== undefined || event.fourBallPrice !== undefined;
  const hasFacts = Boolean(event.time || event.entryFee || event.registrationDeadline || hasPrices);
  const open = event.status !== 'cancelled' && isUpcoming(event.date);

  return (
    <div className="bg-club-white">
      <PageIntro eyebrow={`${event.type.toUpperCase()} · ${p.day} ${p.month} ${p.year}`} title={event.title} copy={event.text} image={images.dining} />
      <main className="mx-auto grid max-w-[1480px] gap-12 px-5 py-20 md:grid-cols-12 md:px-10 md:py-28">
        <div className="md:col-span-7">
          {event.status === 'cancelled' && (
            <p className="mb-8 border-l-2 border-club-alert bg-club-alert/5 px-4 py-3 text-sm leading-6 text-club-alert"><strong>This event has been cancelled.</strong></p>
          )}
          <List title="SCHEDULE" lines={event.schedule ?? []} icon />
          <List title="RULES" lines={event.rules ?? []} />
          <List title="PRIZES" lines={event.prizes ?? []} />
          {!event.schedule?.length && !event.rules?.length && !event.prizes?.length && (
            <p className="text-sm leading-7 text-club-ink/70">The programme, rules and prizes for this event will be published here once the club confirms them.</p>
          )}
          {event.sponsors && event.sponsors.length > 0 && (
            <List title="THANK YOU TO OUR SPONSORS" lines={event.sponsors} />
          )}
          {open && hasPrices && <div id="enter" className="mt-12 scroll-mt-28"><EventEntryForm event={event} /></div>}
          {open && event.sponsorshipOpen && <div id="sponsor" className="mt-12 scroll-mt-28"><SponsorshipForm event={event} /></div>}
        </div>
        <div className="md:col-span-4 md:col-start-9">
          {event.poster ? (
            <img src={event.poster} alt={`${event.title} poster`} className="mb-6 w-full border border-club-ink/10 object-cover" data-testid="event-poster" />
          ) : (
            <div className="mb-6 flex aspect-[3/4] w-full flex-col items-center justify-center gap-3 border border-dashed border-club-green/40 bg-club-green/5 text-club-green" data-testid="event-poster-placeholder">
              <CalendarDays size={36} />
              <span className="font-mono-club text-[9px] tracking-[.16em]">EVENT POSTER COMING SOON</span>
            </div>
          )}
          <div className="border border-club-ink/10 bg-white p-6">
            <div className="flex justify-between border-b border-club-ink/10 pb-3 text-sm">
              <span className="text-club-ink/70">Date</span><strong className="text-club-ink">{formatDate(event.date)}</strong>
            </div>
            {event.time && (
              <div className="flex justify-between border-b border-club-ink/10 py-3 text-sm">
                <span className="text-club-ink/70">Time</span><strong className="text-club-ink">{event.time}</strong>
              </div>
            )}
            {event.entryFee && (
              <div className="flex justify-between border-b border-club-ink/10 py-3 text-sm">
                <span className="text-club-ink/70">Entry fee</span><strong className="text-club-ink">{event.entryFee}</strong>
              </div>
            )}
            {event.registrationDeadline && (
              <div className="flex justify-between border-b border-club-ink/10 py-3 text-sm">
                <span className="text-club-ink/70">Registration closes</span><strong className="text-club-ink">{event.registrationDeadline}</strong>
              </div>
            )}
            {event.singlePrice !== undefined && (
              <div className="flex justify-between border-b border-club-ink/10 py-3 text-sm">
                <span className="text-club-ink/70">Single player</span><strong className="text-club-ink">{formatMoney(event.singlePrice)}</strong>
              </div>
            )}
            {event.fourBallPrice !== undefined && (
              <div className="flex justify-between border-b border-club-ink/10 py-3 text-sm">
                <span className="text-club-ink/70">Four-ball (team of 4)</span><strong className="text-club-ink">{formatMoney(event.fourBallPrice)}</strong>
              </div>
            )}
            {!hasFacts && <p className="pt-3 text-xs leading-5 text-club-ink/70">Time and entry fee to be confirmed.</p>}
            {open && hasPrices && (
              <a href="#enter" className="mt-5 flex w-full items-center justify-center bg-club-green py-4 text-[10px] font-bold tracking-[.15em] text-club-white hover:bg-club-ink" data-testid="button-register-event">
                ENTER ONLINE
              </a>
            )}
            {open && !hasPrices && (
              <Link
                href="/contact"
                className="mt-5 flex w-full items-center justify-center bg-club-green py-4 text-[10px] font-bold tracking-[.15em] text-club-white hover:bg-club-ink"
                data-testid="button-register-event"
              >
                ASK ABOUT ENTERING
              </Link>
            )}
            {open && event.sponsorshipOpen && (
              <a href="#sponsor" className="mt-3 flex w-full items-center justify-center border border-club-ink/30 py-4 text-[10px] font-bold tracking-[.15em] text-club-ink hover:border-club-green hover:text-club-green" data-testid="button-sponsor-event">
                SPONSOR THIS EVENT
              </a>
            )}
            {event.status !== 'cancelled' && (
              <div className="mt-5 grid gap-2 border-t border-club-ink/10 pt-5">
                <CalendarButton build={() => clubEventIcs(event)} filename={`event-${event.id}.ics`} testId="button-event-calendar" />
                <DownloadPdfButton build={() => eventDocument(event)} label="EVENT DETAILS (PDF)" testId="button-event-pdf" />
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
