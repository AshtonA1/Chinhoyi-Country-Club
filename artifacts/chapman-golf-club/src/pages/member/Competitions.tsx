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
        {upcoming.length === 0 && <p className="text-sm text-club-ink/70">No upcoming events are listed.</p>}
        {upcoming.map((e) => {
          const p = dateParts(e.date);
          const marked = interest.some((i) => i.id === e.id);
          return (
            <article key={e.id} className="grid gap-5 border border-club-ink/10 bg-club-white p-5 md:grid-cols-12 md:items-center">
              <div className="md:col-span-2"><p className="font-display text-4xl text-club-ink">{p.day}</p><p className="font-mono-club text-[9px] tracking-[.14em] text-club-green">{p.month} · {p.weekday}</p></div>
              <div className="md:col-span-5">
                <p className="font-mono-club text-[9px] tracking-[.14em] text-club-green">{e.type.toUpperCase()}</p>
                <Link href={`/events/${e.id}`} className="mt-2 block font-display text-3xl text-club-ink hover:text-club-green">{e.title}</Link>
              </div>
              <p className="text-sm text-club-ink/70 md:col-span-3">{e.entryFee ? `Entry ${e.entryFee}` : 'Entry fee to be confirmed'}</p>
              <button
                onClick={() => (marked ? remove(e.id) : add({ id: e.id }))}
                className={`flex items-center justify-center gap-2 px-4 py-3 text-[10px] font-bold tracking-[.12em] md:col-span-2 ${marked ? 'border border-club-green text-club-green' : 'bg-club-green text-club-white hover:bg-club-ink'}`}
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
