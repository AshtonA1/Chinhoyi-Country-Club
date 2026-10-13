import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'wouter';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { PageIntro, SectionLabel, usePageMeta } from '@/components/layout/Shared';
import { TeeToggle } from '@/components/TeeToggle';
import type { Hole } from '@/data/club';
import { useHoles } from '@/lib/club-data';
import type { TeeKey } from '@/lib/scorecard';
import NotFound from '@/pages/not-found';

/** The hole's fly-over video when there is one, otherwise its photo. The video only downloads when pressed play. */
function HoleMedia({ hole }: { hole: Hole }) {
  const src = (hole.video ?? '').trim();
  const [error, setError] = useState('');
  useEffect(() => setError(''), [src]);
  const poster = (hole.videoPoster ?? '').trim();
  return (
    <>
      <div className="relative aspect-[16/9] overflow-hidden bg-club-ink">
        {src !== '' ? (
          <video
            key={src}
            poster={poster || undefined}
            controls
            playsInline
            preload="metadata"
            onError={(e) => {
              const code = e.currentTarget.error?.code ?? 0;
              setError(`code ${code}`);
              console.error('Hole video failed', src, e.currentTarget.error);
            }}
            aria-label={`Fly-over video of hole ${hole.number}`}
            className="absolute inset-0 h-full w-full bg-club-ink object-contain"
            data-testid="video-hole-flyover"
          >
            <source src={src} type="video/mp4" onError={() => setError('file not found or not an mp4')} />
          </video>
        ) : (
          <img src={hole.image} alt={`Hole ${hole.number}`} className="absolute inset-0 h-full w-full object-cover opacity-80" />
        )}
        {error && (
          <div className="absolute inset-x-0 bottom-0 bg-club-alert px-4 py-2 text-xs text-white">
            Video could not load ({error}). <a className="underline" href={src} target="_blank" rel="noreferrer">Open the file directly</a>
          </div>
        )}
      </div>
      <p className="mt-3 font-mono-club text-[9px] tracking-[.14em] text-club-ink/70">
        {src !== '' ? `FLY-OVER · HOLE ${hole.number}` : `HOLE ${hole.number}`}
      </p>
    </>
  );
}

export default function HoleDetail() {
  const params = useParams<{ holeNumber: string }>();
  const [, navigate] = useLocation();
  const [tee, setTee] = useState<TeeKey>('men');
  const { items: holes } = useHoles();
  const number = Number(params.holeNumber);
  const index = holes.findIndex((h) => h.number === number);
  const hole = index >= 0 ? holes[index] : undefined;
  usePageMeta(
    hole ? `Hole ${hole.number}${hole.name ? `: ${hole.name}` : ''}` : 'Hole not found',
    hole ? `Hole ${hole.number}: par ${hole.men.par}, ${hole.men.metres} metres from the men’s tees.` : '',
  );
  if (!hole) return <NotFound />;

  const previous = holes[(index + holes.length - 1) % holes.length];
  const next = holes[(index + 1) % holes.length];
  const t = hole[tee];
  const title = hole.name || `Hole ${hole.number}`;

  return (
    <div className="bg-club-white">
      <PageIntro
        eyebrow={`HOLE ${String(hole.number).padStart(2, '0')} · PAR ${t.par} · ${t.metres} METRES`}
        title={title}
        copy={hole.description || `Par ${t.par}, ${t.metres} metres, stroke index ${t.stroke}.`}
        image={hole.image}
      />
      <main>
        <section className="mx-auto grid max-w-[1480px] gap-12 px-5 py-16 md:grid-cols-12 md:px-10 md:py-24">
          <div className="md:col-span-7">
            <HoleMedia hole={hole} />
          </div>
          <div className="md:col-span-4 md:col-start-9">
            <TeeToggle value={tee} onChange={setTee} />
            <div className="mt-6 border-t border-club-ink/20 pt-4">
              {([['PAR', t.par], ['METRES', t.metres], ['STROKE INDEX', t.stroke]] as const).map(([label, value]) => (
                <div key={label} className="flex justify-between py-2 font-mono-club text-[10px]">
                  <span className="text-club-ink/70">{label}</span><span className="text-club-ink">{value}</span>
                </div>
              ))}
            </div>
            {hole.description && (
              <div className="mt-8">
                <SectionLabel>THE PLAY</SectionLabel>
                <p className="mt-4 text-lg leading-8 text-club-ink">{hole.description}</p>
              </div>
            )}
            {hole.hazards.length > 0 && (
              <div className="mt-8">
                <p className="font-mono-club text-[9px] tracking-[.15em] text-club-green">WATCH FOR</p>
                <ul className="mt-3 grid gap-2 text-sm text-club-ink/70">
                  {hole.hazards.map((h) => <li key={h} className="flex gap-2"><span className="text-club-gold">—</span>{h}</li>)}
                </ul>
              </div>
            )}
            {hole.proTip && (
              <div className="mt-8 border border-club-gold/40 bg-club-gold/15 p-5">
                <p className="font-mono-club text-[9px] tracking-[.15em] text-club-gold-deep">TIP</p>
                <p className="mt-2 text-sm leading-6 text-club-ink">{hole.proTip}</p>
              </div>
            )}
          </div>
        </section>
        <section className="on-gold py-16 md:py-24">
          <div className="mx-auto max-w-[1480px] px-5 md:px-10">
            <div className="flex items-center justify-between gap-4">
              <Link href={`/course/hole/${previous.number}`} className="flex items-center gap-2 text-[10px] font-bold tracking-[.15em] text-club-green" data-testid="link-previous-hole">
                <ChevronLeft size={17} /> <span className="hidden sm:inline">PREVIOUS</span>
                <span className="font-display text-xl normal-case tracking-normal text-club-ink">{previous.number}</span>
              </Link>
              <div className="font-mono-club text-[9px] tracking-[.15em] text-club-ink/70">
                <Link href="/course" className="hidden sm:inline">ALL HOLES</Link>
                <select
                  className="bg-transparent text-club-ink sm:hidden"
                  aria-label="Select a hole"
                  value={hole.number}
                  onChange={(e) => navigate(`/course/hole/${e.target.value}`)}
                  data-testid="select-hole-mobile"
                >
                  {holes.map((item) => <option key={item.id} value={item.number}>{String(item.number).padStart(2, '0')}{item.name ? ` · ${item.name}` : ''}</option>)}
                </select>
              </div>
              <Link href={`/course/hole/${next.number}`} className="flex items-center gap-2 text-[10px] font-bold tracking-[.15em] text-club-green" data-testid="link-next-hole">
                <span className="font-display text-xl normal-case tracking-normal text-club-ink">{next.number}</span>
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
