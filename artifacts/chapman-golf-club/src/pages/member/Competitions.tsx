import { useState } from 'react';
import { ArrowUpRight, Check } from 'lucide-react';
import { MemberShell, PortalHeading } from './MemberShell';
import { usePageMeta } from '@/components/layout/Shared';

const competitions = [
  { id: 'cup', date: '22 JUN', title: 'Chinhoyi Cup — Final', format: 'Stroke play · Championship tee', note: 'Qualifiers completed' },
  { id: 'fourball', date: '29 JUN', title: 'Mixed Fourball Sunday', format: 'Fourball better ball · Open', note: '12 places remaining' },
  { id: 'ladies', date: '06 JUL', title: 'Ladies Spring Fourball', format: 'Fourball · Members & guests', note: 'Entries close 30 Jun' },
];

export default function MemberCompetitions() {
  usePageMeta('Competitions', 'Enter, follow and celebrate the competitions that keep the club moving.');
  const [entered, setEntered] = useState<string[]>([]);
  return (
    <MemberShell>
      <PortalHeading eyebrow="MEMBER ROOM / COMPETITIONS" title="Play for something." copy="Enter, follow and celebrate the competitions that keep the club moving." />
      <div className="mt-8 grid gap-3">
        {competitions.map((c) => (
          <article key={c.id} className="grid gap-5 border border-[#12372A]/10 bg-[#F7F5EF] p-5 md:grid-cols-12 md:items-center">
            <div className="md:col-span-2"><p className="font-display text-4xl text-[#12372A]">{c.date.split(' ')[0]}</p><p className="font-mono-club text-[9px] tracking-[.14em] text-[#2E6B4E]">{c.date.split(' ')[1]}</p></div>
            <div className="md:col-span-5"><p className="font-mono-club text-[9px] tracking-[.14em] text-[#2E6B4E]">{c.format.toUpperCase()}</p><h2 className="mt-2 font-display text-3xl text-[#12372A]">{c.title}</h2></div>
            <p className="text-sm text-[#5d6b63] md:col-span-3">{c.note}</p>
            <button
              onClick={() => setEntered((items) => (items.includes(c.id) ? items.filter((id) => id !== c.id) : [...items, c.id]))}
              className={`flex items-center justify-center gap-2 px-4 py-3 text-[10px] font-bold tracking-[.12em] md:col-span-2 ${entered.includes(c.id) ? 'border border-[#2E6B4E] text-[#2E6B4E]' : 'bg-[#12372A] text-[#F7F5EF] hover:bg-[#2E6B4E]'}`}
            >
              {entered.includes(c.id) ? 'ENTRY SAVED' : 'ENTER NOW'} {entered.includes(c.id) ? <Check size={14} /> : <ArrowUpRight size={14} />}
            </button>
          </article>
        ))}
      </div>
    </MemberShell>
  );
}
