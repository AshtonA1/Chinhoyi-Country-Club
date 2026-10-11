import type { ReactNode } from 'react';
import { SectionLabel } from '@/components/layout/Shared';
import { club } from '@/data/club';

/** Shared by the member and admin portals. */
export function PortalHeading({
  eyebrow, title, copy, action,
}: { eyebrow: string; title: string; copy?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col justify-between gap-6 border-b border-club-ink/10 pb-8 md:flex-row md:items-end">
      <div>
        <SectionLabel>{eyebrow}</SectionLabel>
        <h1 className="font-display mt-3 text-5xl leading-[.9] text-club-ink md:text-7xl">{title}</h1>
        {copy && <p className="mt-4 max-w-xl text-sm leading-7 text-club-ink/70">{copy}</p>}
      </div>
      {action}
    </div>
  );
}

export function PortalStat({
  label, value, note, dark = false, sample = false,
}: { label: string; value: string; note?: string; dark?: boolean; sample?: boolean }) {
  return (
    <div className={`border p-5 ${dark ? 'border-white/15 bg-club-ink text-club-white' : 'border-club-ink/10 bg-club-white text-club-ink'}`}>
      <div className="flex items-start justify-between gap-2">
        <p className={`font-mono-club text-[9px] tracking-[.15em] ${dark ? 'text-club-gold' : 'text-club-ink/70'}`}>{label}</p>
        {sample && <SampleChip dark={dark} />}
      </div>
      <p className="mt-4 font-display text-4xl">{value}</p>
      {note && <p className={`mt-2 text-xs ${dark ? 'text-white/50' : 'text-club-ink/70'}`}>{note}</p>}
    </div>
  );
}

/** Marks demo figures so nobody mistakes them for real club numbers. Hidden once demoMode is off. */
export function SampleChip({ dark = false }: { dark?: boolean }) {
  if (!club.demoMode) return null;
  return (
    <span className={`shrink-0 border px-1.5 py-0.5 font-mono-club text-[8px] font-bold tracking-[.12em] ${dark ? 'border-club-gold/50 text-club-gold' : 'border-club-gold bg-club-gold/15 text-club-gold-deep'}`}>
      SAMPLE
    </span>
  );
}
