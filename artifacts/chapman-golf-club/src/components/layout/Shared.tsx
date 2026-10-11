import { type ReactNode, useEffect } from 'react';
import { Link } from 'wouter';
import { ArrowUpRight, MapPin } from 'lucide-react';
import { club } from '@/data/club';
import { useCourseConfig, useHoles } from '@/lib/club-data';
import { formatNumber } from '@/lib/format';
import { teeTotals } from '@/lib/scorecard';
import { Header } from './Header';

export function usePageMeta(title: string, description: string) {
  useEffect(() => {
    document.title = `${title} · ${club.name}`;
    let descriptionTag = document.querySelector('meta[name="description"]');
    if (!descriptionTag) {
      descriptionTag = document.createElement('meta');
      descriptionTag.setAttribute('name', 'description');
      document.head.appendChild(descriptionTag);
    }
    descriptionTag.setAttribute('content', description);
  }, [title, description]);
}

export function ButtonLink({
  href, children, dark = false, className = '',
}: { href: string; children: ReactNode; dark?: boolean; className?: string }) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center justify-center gap-3 px-5 py-3.5 text-[10px] font-bold tracking-[.15em] transition-all ${dark ? 'bg-club-green text-club-white hover:bg-club-ink' : 'bg-club-gold text-club-ink hover:bg-club-gold/85'} ${className}`}
      data-testid={`link-action-${href.replaceAll('/', '-').replace(/^[-]/, '')}`}
    >
      {children}
      <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </Link>
  );
}

export function SectionLabel({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return <p className={`font-mono-club text-[10px] tracking-[.22em] ${light ? 'text-club-white/85' : 'text-club-green'}`}>{children}</p>;
}

export function HoleDiagram() {
  return (
    <div className="absolute bottom-8 right-5 hidden w-52 border border-white/25 bg-club-ink/45 p-4 backdrop-blur-sm md:block">
      <p className="font-mono-club text-[8px] tracking-[.16em] text-club-gold">HOLE DIAGRAM</p>
      <svg viewBox="0 0 220 110" className="mt-3 h-auto w-full" aria-label="Illustrated hole diagram">
        <path d="M12 82 C 47 76, 54 34, 91 43 S 137 87, 170 58 S 193 30, 210 27" fill="none" className="stroke-club-gold" strokeWidth="8" strokeLinecap="round" opacity=".85" />
        <path d="M12 82 C 47 76, 54 34, 91 43 S 137 87, 170 58 S 193 30, 210 27" fill="none" className="stroke-club-white/70" strokeWidth="2" strokeDasharray="4 4" />
        <circle cx="12" cy="82" r="5" className="fill-club-white" />
        <circle cx="210" cy="27" r="5" className="fill-club-gold" />
        <path d="M178 15 C 190 8, 204 12, 211 20" fill="none" className="stroke-club-white/70" strokeWidth="1.5" />
        <text x="3" y="101" className="fill-club-white" fontSize="8">TEE</text>
        <text x="184" y="18" className="fill-club-white" fontSize="8">GREEN</text>
      </svg>
    </div>
  );
}

export function PageIntro({
  eyebrow, title, copy, image,
}: { eyebrow: string; title: string; copy: string; image: string }) {
  const { items: holes } = useHoles();
  return (
    <section className="relative flex min-h-[440px] items-end overflow-hidden bg-club-green pb-14 pt-36 text-club-white md:min-h-[500px] md:pb-20">
      <Header />
      <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-50" />
      <div className="absolute inset-0 bg-club-green/70" />
      <div className="relative mx-auto w-full max-w-[1480px] px-5 md:px-10">
        <div className="max-w-3xl reveal">
          <SectionLabel light>{eyebrow}</SectionLabel>
          <h1 className="font-display mt-5 text-6xl leading-[.9] md:text-8xl">{title}</h1>
          <p className="mt-7 max-w-xl text-base leading-7 text-white/75 md:text-lg">{copy}</p>
        </div>
        {holes.some((hole) => hole.name && hole.name === title) && <HoleDiagram />}
      </div>
    </section>
  );
}

export function StatStrip({ items }: { items?: string[][] }) {
  const { items: holes } = useHoles();
  const { value: course } = useCourseConfig();
  const men = teeTotals(holes, course, 'men');
  const ladies = teeTotals(holes, course, 'ladies');
  const shown = items ?? [
    [String(holes.length), 'Holes'],
    [String(men.par.total), 'Par'],
    [formatNumber(men.metres.total), "Metres (men)"],
    [formatNumber(ladies.metres.total), "Metres (ladies)"],
  ];
  return (
    <div className="grid grid-cols-2 border-y border-club-ink/15 md:grid-cols-4">
      {shown.map(([value, label], i) => (
        <div
          key={label}
          className={`px-5 py-7 md:px-8 md:py-9 ${i % 2 ? 'border-l border-club-ink/15 md:border-l-0' : ''} ${i > 1 ? 'border-t border-club-ink/15 md:border-t-0' : ''} ${i > 0 ? 'md:border-l md:border-club-ink/15' : ''}`}
        >
          <div className="font-display text-4xl text-club-ink md:text-5xl">{value}</div>
          <div className="mt-2 font-mono-club text-[9px] tracking-[.18em] text-club-ink/70">{label.toUpperCase()}</div>
        </div>
      ))}
    </div>
  );
}

export function LocationBand({ gold = false }: { gold?: boolean }) {
  return (
    <section className={`relative overflow-hidden ${gold ? 'on-gold' : 'border-t border-club-ink/10 bg-club-white text-club-ink'}`}>
      <div
        className="absolute inset-0 opacity-30"
        style={{ backgroundImage: 'radial-gradient(var(--color-club-gold) 1px, transparent 1px)', backgroundSize: '28px 28px' }}
      />
      <div className="relative mx-auto grid max-w-[1480px] gap-10 px-5 py-20 md:grid-cols-12 md:px-10 md:py-24">
        <div className="md:col-span-6">
          <SectionLabel>COME AND FIND US</SectionLabel>
          <h2 className="font-display mt-5 text-5xl leading-[.92] md:text-7xl">
            Find us in<br /><em>{club.city}.</em>
          </h2>
        </div>
        <div className="md:col-span-4 md:col-start-8">
          <MapPin className="text-club-green" size={24} />
          <p className="mt-5 leading-7 text-club-ink/80">{club.address}</p>
          <ButtonLink href="/contact" dark={gold} className="mt-8">PLAN YOUR VISIT</ButtonLink>
        </div>
      </div>
    </section>
  );
}
