import { Link } from 'wouter';
import { ArrowUpRight, Check } from 'lucide-react';
import { MemberShell, PortalHeading } from './MemberShell';
import { usePageMeta } from '@/components/layout/Shared';
import { upcomingEvents, useEvents } from '@/lib/club-data';
import { dateParts } from '@/lib/dates';
import { useLocalCollection } from '@/lib/local-store';

type Interest = { id: string };

export default function MemberCompetitions() {
  usePageMeta('Events & competitions', 'Follow the club calendar and mark the events you want to play in.');
  const { items: events } = useEvents();
  const { items: interest, add, remove } = useLocalCollection<Interest>('ccc:v1:event-interest');
  const upcoming = upcomingEvents(events);
  return (
    <MemberShell>
      <PortalHeading eyebrow="MEMBER ROOM / EVENTS" title="Play for something." copy="The club calendar. Mark the events you are interested in; the club confirms entries." />
      <div className="mt-8 grid gap-3">
        {upcoming.length === 0 && <p className="text-sm text-[#5d6b63]">No upcoming events are listed.</p>}
        {upcoming.map((e) => {
          const p = dateParts(e.date);
          const marked = interest.some((i) => i.id === e.id);
          return (
            <article key={e.id} className="grid gap-5 border border-[#12372A]/10 bg-[#F7F5EF] p-5 md:grid-cols-12 md:items-center">
              <div className="md:col-span-2"><p className="font-display text-4xl text-[#12372A]">{p.day}</p><p className="font-mono-club text-[9px] tracking-[.14em] text-[#2E6B4E]">{p.month} · {p.weekday}</p></div>
              <div className="md:col-span-5">
                <p className="font-mono-club text-[9px] tracking-[.14em] text-[#2E6B4E]">{e.type.toUpperCase()}{e.status === 'proposed' ? ' · PROPOSED' : ''}</p>
                <Link href={`/events/${e.id}`} className="mt-2 block font-display text-3xl text-[#12372A] hover:text-[#2E6B4E]">{e.title}</Link>
              </div>
              <p className="text-sm text-[#5d6b63] md:col-span-3">{e.entryFee ? `Entry ${e.entryFee}` : 'Entry fee to be confirmed'}</p>
              <button
                onClick={() => (marked ? remove(e.id) : add({ id: e.id }))}
                className={`flex items-center justify-center gap-2 px-4 py-3 text-[10px] font-bold tracking-[.12em] md:col-span-2 ${marked ? 'border border-[#2E6B4E] text-[#2E6B4E]' : 'bg-[#12372A] text-[#F7F5EF] hover:bg-[#2E6B4E]'}`}
              >
                {marked ? 'INTERESTED' : "I'M INTERESTED"} {marked ? <Check size={14} /> : <ArrowUpRight size={14} />}
              </button>
            </article>
          );
        })}
      </div>
    </MemberShell>
  );
}
