import { useParams } from 'wouter';
import { CalendarClock } from 'lucide-react';
import { Link } from 'wouter';
import { Footer } from '@/components/layout/Footer';
import { PageIntro, SectionLabel, usePageMeta } from '@/components/layout/Shared';
import { images } from '@/data/club';
import { dateParts, formatDate } from '@/lib/dates';
import { useEvents } from '@/lib/club-data';
import NotFound from '@/pages/not-found';

function List({ title, lines, icon = false }: { title: string; lines: string[]; icon?: boolean }) {
  if (lines.length === 0) return null;
  return (
    <div className="mt-10 first:mt-0">
      <SectionLabel>{title}</SectionLabel>
      <ul className="mt-4 grid gap-3 border-t border-[#12372A]/15 pt-5 text-sm text-[#5d6b63]">
        {lines.map((line) => (
          <li key={line} className="flex items-start gap-3">
            {icon ? <CalendarClock size={15} className="mt-0.5 shrink-0 text-[#2E6B4E]" /> : <span className="text-[#C8A951]">—</span>}
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
  const hasFacts = Boolean(event.time || event.entryFee || event.registrationDeadline);

  return (
    <div className="bg-[#F7F5EF]">
      <PageIntro eyebrow={`${event.type.toUpperCase()} · ${p.day} ${p.month} ${p.year}`} title={event.title} copy={event.text} image={images.dining} />
      <main className="mx-auto grid max-w-[1480px] gap-12 px-5 py-20 md:grid-cols-12 md:px-10 md:py-28">
        <div className="md:col-span-7">
          {event.status === 'proposed' && (
            <p className="mb-8 border-l-2 border-[#C8A951] bg-[#fbf3d8] px-4 py-3 text-sm leading-6 text-[#5d4a12]">
              <strong>Proposed date.</strong> This event is on the Captain’s proposed programme and is subject to approval.
            </p>
          )}
          {event.status === 'cancelled' && (
            <p className="mb-8 border-l-2 border-[#9b2c2c] bg-[#9b2c2c]/5 px-4 py-3 text-sm leading-6 text-[#9b2c2c]"><strong>This event has been cancelled.</strong></p>
          )}
          <List title="SCHEDULE" lines={event.schedule ?? []} icon />
          <List title="RULES" lines={event.rules ?? []} />
          <List title="PRIZES" lines={event.prizes ?? []} />
          {!event.schedule?.length && !event.rules?.length && !event.prizes?.length && (
            <p className="text-sm leading-7 text-[#5d6b63]">The programme, rules and prizes for this event will be published here once the club confirms them.</p>
          )}
        </div>
        <div className="md:col-span-4 md:col-start-9">
          <div className="border border-[#12372A]/10 bg-white p-6">
            <div className="flex justify-between border-b border-[#12372A]/10 pb-3 text-sm">
              <span className="text-[#5d6b63]">Date</span><strong className="text-[#12372A]">{formatDate(event.date)}</strong>
            </div>
            {event.time && (
              <div className="flex justify-between border-b border-[#12372A]/10 py-3 text-sm">
                <span className="text-[#5d6b63]">Time</span><strong className="text-[#12372A]">{event.time}</strong>
              </div>
            )}
            {event.entryFee && (
              <div className="flex justify-between border-b border-[#12372A]/10 py-3 text-sm">
                <span className="text-[#5d6b63]">Entry fee</span><strong className="text-[#12372A]">{event.entryFee}</strong>
              </div>
            )}
            {event.registrationDeadline && (
              <div className="flex justify-between border-b border-[#12372A]/10 py-3 text-sm">
                <span className="text-[#5d6b63]">Registration closes</span><strong className="text-[#12372A]">{event.registrationDeadline}</strong>
              </div>
            )}
            {!hasFacts && <p className="pt-3 text-xs leading-5 text-[#5d6b63]">Time and entry fee to be confirmed.</p>}
            {event.status !== 'cancelled' && (
              <Link
                href="/contact"
                className="mt-5 flex w-full items-center justify-center bg-[#12372A] py-4 text-[10px] font-bold tracking-[.15em] text-[#F7F5EF] hover:bg-[#2E6B4E]"
                data-testid="button-register-event"
              >
                ASK ABOUT ENTERING
              </Link>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
