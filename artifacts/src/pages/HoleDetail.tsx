import { useState } from 'react';
import { Link, useParams } from 'wouter';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { PageIntro, SectionLabel, usePageMeta } from '@/components/layout/Shared';
import { holes } from '@/data/club';

export default function HoleDetail() {
  const params = useParams<{ holeNumber: string }>();
  const [playing, setPlaying] = useState(false);
  const raw = Number(params.holeNumber);
  const index = Number.isFinite(raw) ? Math.min(18, Math.max(1, raw)) - 1 : 0;
  const hole = holes[index];
  const previous = holes[(index + 17) % 18];
  const next = holes[(index + 1) % 18];
  usePageMeta(`Hole ${hole.number}: ${hole.name}`, `Hole ${hole.number}, ${hole.name} — ${hole.par} par and ${hole.yards} yards.`);
  return (
    <div className="bg-[#F7F5EF]">
      <PageIntro
        eyebrow={`HOLE ${String(hole.number).padStart(2, '0')} · PAR ${hole.par} · ${hole.yards} YARDS`}
        title={hole.name}
        copy={hole.description}
        image={hole.image}
      />
      <main>
        <section className="mx-auto grid max-w-[1480px] gap-12 px-5 py-16 md:grid-cols-12 md:px-10 md:py-24">
          <div className="md:col-span-7">
            <div className="relative flex aspect-[16/9] items-center justify-center overflow-hidden bg-[#12372A]">
              <img
                src={hole.image}
                alt={`Aerial view of hole ${hole.number}, ${hole.name}`}
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${playing ? 'opacity-65' : 'opacity-35'}`}
              />
              <div className="absolute inset-0 bg-[#12372A]/25" />
              {playing && (
                <div className="absolute inset-x-0 top-0 h-1 bg-[#C8A951]" aria-label="Flyover playing">
                  <span className="block h-full w-2/5 bg-[#F7F5EF]" />
                </div>
              )}
              <button
                onClick={() => setPlaying(!playing)}
                className="relative grid h-20 w-20 place-items-center rounded-full bg-[#C8A951] text-[#12372A] transition-transform hover:scale-105"
                data-testid={`button-play-hole-${hole.number}`}
                aria-label={playing ? 'Pause drone flyover' : 'Play drone flyover'}
              >
                {playing ? <span className="font-mono-club text-[10px] font-bold">PAUSE</span> : <Play size={24} fill="currentColor" />}
              </button>
              <span className="absolute bottom-4 left-4 font-mono-club text-[9px] tracking-[.16em] text-white/75">
                {playing ? 'FLYOVER PLAYING · 00:18' : 'DRONE FLYOVER · 01:42'}
              </span>
            </div>
            <p className="mt-3 font-mono-club text-[9px] tracking-[.14em] text-[#5d6b63]">AERIAL VIEW · HOLE {hole.number}</p>
          </div>
          <div className="md:col-span-4 md:col-start-9">
            <SectionLabel>THE PLAY</SectionLabel>
            <p className="mt-5 text-lg leading-8 text-[#12372A]">{hole.description}</p>
            <div className="mt-8 border-t border-[#12372A]/20 pt-6">
              <div className="flex justify-between py-2 font-mono-club text-[10px]">
                <span className="text-[#5d6b63]">PAR</span><span className="text-[#12372A]">{hole.par}</span>
              </div>
              <div className="flex justify-between py-2 font-mono-club text-[10px]">
                <span className="text-[#5d6b63]">YARDAGE</span><span className="text-[#12372A]">{hole.yards}</span>
              </div>
              <div className="flex justify-between py-2 font-mono-club text-[10px]">
                <span className="text-[#5d6b63]">STROKE INDEX</span><span className="text-[#12372A]">{hole.stroke}</span>
              </div>
            </div>
            <div className="mt-8">
              <p className="font-mono-club text-[9px] tracking-[.15em] text-[#2E6B4E]">WATCH FOR</p>
              <ul className="mt-3 grid gap-2 text-sm text-[#5d6b63]">
                {hole.hazards.map((h) => (
                  <li key={h} className="flex gap-2"><span className="text-[#C8A951]">—</span>{h}</li>
                ))}
              </ul>
            </div>
            <div className="mt-8 border border-[#C8A951]/40 bg-[#fbf3d8] p-5">
              <p className="font-mono-club text-[9px] tracking-[.15em] text-[#8b6e16]">PRO TIP</p>
              <p className="mt-2 text-sm leading-6 text-[#5d4a12]">{hole.proTip}</p>
            </div>
          </div>
        </section>
        <section className="bg-[#e8e9df] py-16 md:py-24">
          <div className="mx-auto max-w-[1480px] px-5 md:px-10">
            <div className="flex items-center justify-between gap-4">
              <Link href={`/course/hole/${previous.number}`} className="group flex items-center gap-2 text-[10px] font-bold tracking-[.15em] text-[#2E6B4E]" data-testid="link-previous-hole">
                <ChevronLeft size={17} /> <span className="hidden sm:inline">PREVIOUS</span>
                <span className="font-display text-xl normal-case tracking-normal text-[#12372A]">{previous.number}</span>
              </Link>
              <Link href="/course" className="font-mono-club text-[9px] tracking-[.15em] text-[#5d6b63]">
                <span className="hidden sm:inline">ALL HOLES</span>
                <select className="bg-transparent text-[#12372A] sm:hidden" aria-label="Select a hole" value={hole.number} onChange={() => {}} data-testid="select-hole-mobile">
                  {holes.map((item) => <option key={item.number} value={item.number}>{String(item.number).padStart(2, '0')} · {item.name}</option>)}
                </select>
              </Link>
              <Link href={`/course/hole/${next.number}`} className="group flex items-center gap-2 text-[10px] font-bold tracking-[.15em] text-[#2E6B4E]" data-testid="link-next-hole">
                <span className="font-display text-xl normal-case tracking-normal text-[#12372A]">{next.number}</span>
                <span className="hidden sm:inline">NEXT</span><ChevronRight size={17} />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
