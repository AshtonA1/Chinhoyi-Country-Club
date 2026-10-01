import { type ReactNode, useEffect } from 'react';
import { Link } from 'wouter';
import { ArrowUpRight, MapPin } from 'lucide-react';
import { club, holes } from '@/data/club';
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
      className={`group inline-flex items-center justify-center gap-3 px-5 py-3.5 text-[10px] font-bold tracking-[.15em] transition-all ${dark ? 'bg-[#12372A] text-[#F7F5EF] hover:bg-[#2E6B4E]' : 'bg-[#C8A951] text-[#17201C] hover:bg-[#e3c86b]'} ${className}`}
      data-testid={`link-action-${href.replaceAll('/', '-').replace(/^[-]/, '')}`}
    >
      {children}
      <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </Link>
  );
}

export function SectionLabel({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return <p className={`font-mono-club text-[10px] tracking-[.22em] ${light ? 'text-[#C8A951]' : 'text-[#2E6B4E]'}`}>{children}</p>;
}

export function HoleDiagram() {
  return (
    <div className="absolute bottom-8 right-5 hidden w-52 border border-white/25 bg-[#12372A]/45 p-4 backdrop-blur-sm md:block">
      <p className="font-mono-club text-[8px] tracking-[.16em] text-[#C8A951]">HOLE DIAGRAM</p>
      <svg viewBox="0 0 220 110" className="mt-3 h-auto w-full" aria-label="Illustrated hole diagram">
        <path d="M12 82 C 47 76, 54 34, 91 43 S 137 87, 170 58 S 193 30, 210 27" fill="none" stroke="#C8A951" strokeWidth="8" strokeLinecap="round" opacity=".85" />
        <path d="M12 82 C 47 76, 54 34, 91 43 S 137 87, 170 58 S 193 30, 210 27" fill="none" stroke="#6f9c78" strokeWidth="2" strokeDasharray="4 4" />
        <circle cx="12" cy="82" r="5" fill="#F7F5EF" />
        <circle cx="210" cy="27" r="5" fill="#C8A951" />
        <path d="M178 15 C 190 8, 204 12, 211 20" fill="none" stroke="#8eb08b" strokeWidth="1.5" />
        <text x="3" y="101" fill="#F7F5EF" fontSize="8">TEE</text>
        <text x="184" y="18" fill="#F7F5EF" fontSize="8">GREEN</text>
      </svg>
    </div>
  );
}

export function PageIntro({
  eyebrow, title, copy, image,
}: { eyebrow: string; title: string; copy: string; image: string }) {
  return (
    <section className="relative flex min-h-[560px] items-end overflow-hidden bg-[#12372A] pb-16 pt-40 text-[#F7F5EF] md:min-h-[650px] md:pb-24">
      <Header />
      <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-50" />
      <div className="absolute inset-0 bg-[#12372A]/55" />
      <div className="relative mx-auto w-full max-w-[1480px] px-5 md:px-10">
        <div className="max-w-3xl reveal">
          <SectionLabel light>{eyebrow}</SectionLabel>
          <h1 className="font-display mt-5 text-6xl leading-[.9] md:text-8xl">{title}</h1>
          <p className="mt-7 max-w-xl text-base leading-7 text-white/75 md:text-lg">{copy}</p>
        </div>
        {holes.some((hole) => hole.name === title) && <HoleDiagram />}
      </div>
    </section>
  );
}

export function StatStrip({
  items = [['18', 'Holes'], ['71', 'Par'], ['6,291', 'Metres'], ['1968', 'Established']],
}: { items?: string[][] }) {
  return (
    <div className="grid grid-cols-2 border-y border-[#12372A]/15 md:grid-cols-4">
      {items.map(([value, label], i) => (
        <div
          key={label}
          className={`px-5 py-7 md:px-8 md:py-9 ${i % 2 ? 'border-l border-[#12372A]/15 md:border-l-0' : ''} ${i > 1 ? 'border-t border-[#12372A]/15 md:border-t-0' : ''} ${i > 0 ? 'md:border-l md:border-[#12372A]/15' : ''}`}
        >
          <div className="font-display text-4xl text-[#12372A] md:text-5xl">{value}</div>
          <div className="mt-2 font-mono-club text-[9px] tracking-[.18em] text-[#5d6b63]">{label.toUpperCase()}</div>
        </div>
      ))}
    </div>
  );
}

export function LocationBand() {
  return (
    <section className="relative overflow-hidden bg-[#2E6B4E] text-[#F7F5EF]">
      <div
        className="absolute inset-0 opacity-15"
        style={{ backgroundImage: 'radial-gradient(#C8A951 1px, transparent 1px)', backgroundSize: '28px 28px' }}
      />
      <div className="relative mx-auto grid max-w-[1480px] gap-10 px-5 py-20 md:grid-cols-12 md:px-10 md:py-24">
        <div className="md:col-span-6">
          <SectionLabel light>COME AND FIND US</SectionLabel>
          <h2 className="font-display mt-5 text-5xl leading-[.92] md:text-7xl">
            The quiet side<br /><em>of {club.city}.</em>
          </h2>
        </div>
        <div className="md:col-span-4 md:col-start-8">
          <MapPin className="text-[#C8A951]" size={24} />
          <p className="mt-5 leading-7 text-white/80">{club.address}</p>
          <p className="mt-6 text-sm text-white/60">
            35 minutes from the international airport. 12 minutes from the city centre.
          </p>
          <ButtonLink href="/contact" className="mt-8">PLAN YOUR VISIT</ButtonLink>
        </div>
      </div>
    </section>
  );
}
