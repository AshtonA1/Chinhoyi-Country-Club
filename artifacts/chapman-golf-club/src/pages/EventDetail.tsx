import { useState } from 'react';
import { useParams } from 'wouter';
import { CalendarClock, CircleCheck, Ticket } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { PageIntro, SectionLabel, usePageMeta } from '@/components/layout/Shared';
import { events, images } from '@/data/club';
import NotFound from '@/pages/not-found';

export default function EventDetail() {
  const { eventId } = useParams<{ eventId: string }>();
  const event = events.find((e) => e.id === eventId);
  const [registered, setRegistered] = useState(false);
  usePageMeta(event?.title ?? 'Event', event?.text ?? '');

  if (!event) return <NotFound />;

  return (
    <div className="bg-[#F7F5EF]">
      <PageIntro eyebrow={`${event.type.toUpperCase()} · ${event.day} ${event.month} ${event.year}`} title={event.title} copy={event.text} image={images.dining} />
      <main className="mx-auto grid max-w-[1480px] gap-12 px-5 py-20 md:grid-cols-12 md:px-10 md:py-28">
        <div className="md:col-span-7">
          {event.schedule && (
            <div>
              <SectionLabel>SCHEDULE</SectionLabel>
              <ul className="mt-4 grid gap-3 border-t border-[#12372A]/15 pt-5 text-sm text-[#5d6b63]">
                {event.schedule.map((line) => (
                  <li key={line} className="flex items-start gap-3"><CalendarClock size={15} className="mt-0.5 shrink-0 text-[#2E6B4E]" />{line}</li>
                ))}
              </ul>
            </div>
          )}
          {event.rules && (
            <div className="mt-10">
              <SectionLabel>RULES</SectionLabel>
              <ul className="mt-4 grid gap-2 border-t border-[#12372A]/15 pt-5 text-sm text-[#5d6b63]">
                {event.rules.map((r) => <li key={r} className="flex gap-2"><span className="text-[#C8A951]">—</span>{r}</li>)}
              </ul>
            </div>
          )}
          {event.prizes && (
            <div className="mt-10">
              <SectionLabel>PRIZES</SectionLabel>
              <ul className="mt-4 grid gap-2 border-t border-[#12372A]/15 pt-5 text-sm text-[#5d6b63]">
                {event.prizes.map((p) => <li key={p} className="flex gap-2"><span className="text-[#C8A951]">—</span>{p}</li>)}
              </ul>
            </div>
          )}
        </div>
        <div className="md:col-span-4 md:col-start-9">
          <div className="border border-[#12372A]/10 bg-white p-6">
            {event.entryFee && (
              <div className="flex justify-between border-b border-[#12372A]/10 pb-3 text-sm">
                <span className="text-[#5d6b63]">Entry fee</span><strong className="text-[#12372A]">{event.entryFee}</strong>
              </div>
            )}
            {event.registrationDeadline && (
              <div className="flex justify-between border-b border-[#12372A]/10 py-3 text-sm">
                <span className="text-[#5d6b63]">Registration closes</span><strong className="text-[#12372A]">{event.registrationDeadline}</strong>
              </div>
            )}
            {registered ? (
              <div className="mt-5 flex items-center gap-2 text-sm text-[#2E6B4E]"><CircleCheck size={17} /> You're registered for this event.</div>
            ) : (
              <button
                onClick={() => setRegistered(true)}
                className="mt-5 flex w-full items-center justify-center gap-2 bg-[#12372A] py-4 text-[10px] font-bold tracking-[.15em] text-[#F7F5EF] hover:bg-[#2E6B4E]"
                data-testid="button-register-event"
              >
                <Ticket size={14} /> REGISTER FOR THIS EVENT
              </button>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
