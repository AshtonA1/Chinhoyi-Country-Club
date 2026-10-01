import { useState } from 'react';
import { Link } from 'wouter';
import { ArrowUpRight, CalendarDays } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { PageIntro, SectionLabel, usePageMeta } from '@/components/layout/Shared';
import { events, images } from '@/data/club';

const FILTERS = ['All', 'Competition', 'Social', 'Dining'] as const;

export default function Events() {
  usePageMeta('Events', 'Competitions, long lunches, family afternoons and evenings that find their own ending.');
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All');
  const filtered = filter === 'All' ? events : events.filter((e) => e.type === filter);
  return (
    <div className="bg-[#F7F5EF]">
      <PageIntro eyebrow="THE CALENDAR" title="Stay for the good parts." copy="Competitions, long lunches, family afternoons and evenings that find their own ending." image={images.dining} />
      <main className="mx-auto max-w-[1100px] px-5 py-20 md:px-10 md:py-28">
        <div className="flex flex-col justify-between gap-6 border-b border-[#12372A]/20 pb-6 sm:flex-row sm:items-end">
          <div>
            <SectionLabel>UPCOMING</SectionLabel>
            <h2 className="font-display mt-4 text-5xl text-[#12372A] md:text-6xl">On the calendar.</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`border px-4 py-2 text-[10px] font-bold tracking-[.12em] transition-colors ${filter === f ? 'border-[#2E6B4E] bg-[#2E6B4E] text-white' : 'border-[#12372A]/20 text-[#5d6b63] hover:border-[#2E6B4E]'}`}
                data-testid={`button-filter-${f.toLowerCase()}`}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>
          <CalendarDays className="hidden text-[#C8A951] md:block" size={34} />
        </div>
        <div>
          {filtered.map((e) => (
            <Link href={`/events/${e.id}`} key={e.id} className="group grid gap-5 border-b border-[#12372A]/15 py-8 md:grid-cols-12 md:items-center">
              <div className="flex items-center gap-4 md:col-span-2">
                <span className="font-display text-5xl leading-none text-[#12372A]">{e.day}</span>
                <span className="font-mono-club text-[9px] tracking-[.14em] text-[#2E6B4E]">{e.month}</span>
              </div>
              <div className="md:col-span-3">
                <p className="font-mono-club text-[9px] tracking-[.15em] text-[#2E6B4E]">{e.type.toUpperCase()}</p>
                <h3 className="font-display mt-2 text-3xl leading-none text-[#12372A]">{e.title}</h3>
              </div>
              <p className="text-sm leading-6 text-[#5d6b63] md:col-span-5">{e.text}</p>
              <span className="flex items-center gap-2 text-[10px] font-bold tracking-[.13em] text-[#2E6B4E] md:col-span-2 md:justify-end">
                DETAILS <ArrowUpRight size={14} />
              </span>
            </Link>
          ))}
          {filtered.length === 0 && <p className="py-10 text-center text-sm text-[#5d6b63]">No events match this filter.</p>}
        </div>
      </main>
      <Footer />
    </div>
  );
}
