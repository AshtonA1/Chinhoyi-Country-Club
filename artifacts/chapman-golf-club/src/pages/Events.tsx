import { useState } from 'react';
import { Link } from 'wouter';
import { ArrowUpRight, CalendarDays } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { PageIntro, SectionLabel, usePageMeta } from '@/components/layout/Shared';
import { images } from '@/data/club';
import { dateParts } from '@/lib/dates';
import { useEvents, upcomingEvents } from '@/lib/club-data';

export default function Events() {
  usePageMeta('Events', 'Competitions, fundraisers and club days on the calendar.');
  const { items } = useEvents();
  const upcoming = upcomingEvents(items);
  const cancelled = items.filter((e) => e.status === 'cancelled');
  const shown = [...upcoming, ...cancelled].sort((a, b) => a.date.localeCompare(b.date));
  const types = ['All', ...Array.from(new Set(shown.map((e) => e.type)))];
  const [filter, setFilter] = useState('All');
  const active = types.includes(filter) ? filter : 'All';
  const filtered = active === 'All' ? shown : shown.filter((e) => e.type === active);
  const hasProposed = filtered.some((e) => e.status === 'proposed');

  return (
    <div className="bg-club-white">
      <PageIntro eyebrow="THE CALENDAR" title="On the calendar." copy="Competitions, fundraisers and club days." image={images.dining} />
      <section className="on-gold py-14 md:py-20">
        <div className="mx-auto max-w-[1100px] px-5 md:px-10">
          <div className="flex flex-col justify-between gap-6 pb-0 sm:flex-row sm:items-end">
            <div>
              <SectionLabel>UPCOMING</SectionLabel>
              <h2 className="font-display mt-4 text-5xl text-club-ink md:text-6xl">What’s coming up.</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {types.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`border px-4 py-2 text-[10px] font-bold tracking-[.12em] transition-colors ${active === f ? 'border-club-green bg-club-green text-white' : 'border-club-ink/20 text-club-ink/70 hover:border-club-green'}`}
                  data-testid={`button-filter-${f.toLowerCase()}`}
                >
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
            <CalendarDays className="hidden text-club-gold md:block" size={34} />
          </div>
        </div>
      </section>
      <main className="mx-auto max-w-[1100px] px-5 py-20 md:px-10 md:py-28">
        {hasProposed && (
          <p className="mt-5 border-l-2 border-club-gold bg-club-gold/15 px-4 py-3 text-xs leading-5 text-club-ink">
            Events marked <strong>Proposed</strong> are on the Captain’s proposed programme and are subject to approval. Dates may change.
          </p>
        )}
        <div>
          {filtered.map((e) => {
            const p = dateParts(e.date);
            return (
              <Link href={`/events/${e.id}`} key={e.id} className="group grid gap-5 border-b border-club-ink/15 py-8 md:grid-cols-12 md:items-center">
                <div className="flex items-center gap-4 md:col-span-2">
                  <span className="font-display text-5xl leading-none text-club-ink">{p.day}</span>
                  <span className="font-mono-club text-[9px] tracking-[.14em] text-club-green">{p.month}<br />{p.weekday}</span>
                </div>
                <div className="md:col-span-4">
                  <p className="font-mono-club text-[9px] tracking-[.15em] text-club-green">{e.type.toUpperCase()}</p>
                  <h3 className="font-display mt-2 text-3xl leading-none text-club-ink">{e.title}</h3>
                  {e.status !== 'confirmed' && (
                    <span className={`mt-3 inline-block border px-2 py-0.5 font-mono-club text-[8px] font-bold tracking-[.12em] ${e.status === 'cancelled' ? 'border-club-alert/40 text-club-alert' : 'border-club-gold bg-club-gold/15 text-club-gold-deep'}`}>
                      {e.status === 'cancelled' ? 'CANCELLED' : 'PROPOSED'}
                    </span>
                  )}
                </div>
                <p className="text-sm leading-6 text-club-ink/70 md:col-span-4">{e.text}</p>
                <span className="flex items-center gap-2 text-[10px] font-bold tracking-[.13em] text-club-green md:col-span-2 md:justify-end">
                  DETAILS <ArrowUpRight size={14} />
                </span>
              </Link>
            );
          })}
          {filtered.length === 0 && <p className="py-10 text-center text-sm text-club-ink/70">No upcoming events to show.</p>}
        </div>
      </main>
      <Footer />
    </div>
  );
}
