import { Link } from 'wouter';
import { ArrowUpRight } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { PageIntro, SectionLabel, usePageMeta } from '@/components/layout/Shared';
import { club, images } from '@/data/club';
import { useCourseConfig, useHoles } from '@/lib/club-data';
import { formatNumber } from '@/lib/format';
import { teeTotals } from '@/lib/scorecard';

export default function Course() {
  usePageMeta('The Course', `Explore the 18-hole golf course at ${club.name}.`);
  const { items: holes } = useHoles();
  const { value: course } = useCourseConfig();
  const men = teeTotals(holes, course, 'men');
  return (
    <div className="bg-club-white">
      <PageIntro
        eyebrow="THE COURSE · 18 HOLES"
        title="Eighteen holes."
        copy={`${holes.length} holes, par ${men.par.total}, ${formatNumber(men.metres.total)} metres from the men’s tees.`}
        image={images.fairway}
      />
      <section className="on-gold py-16 md:py-24">
        <div className="mx-auto grid max-w-[1480px] gap-8 px-5 md:grid-cols-12 md:items-end md:px-10">
          <div className="md:col-span-7">
            <SectionLabel>THE ROUTE</SectionLabel>
            <h2 className="font-display mt-5 text-5xl leading-[.92] text-club-ink md:text-7xl">
              Hole by<br /><em>hole.</em>
            </h2>
          </div>
          <p className="max-w-md text-sm leading-7 text-club-ink/70 md:col-span-4 md:col-start-9">
            Select a hole for its par, distance and stroke index. Distances shown are from the men’s tees; the hole page also shows the ladies’ tees.
          </p>
        </div>
      </section>
      <main className="mx-auto max-w-[1480px] px-5 py-16 md:px-10 md:py-24">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {holes.map((hole) => (
            <Link
              href={`/course/hole/${hole.number}`}
              key={hole.id}
              className="group relative flex min-h-[220px] flex-col justify-between overflow-hidden bg-club-green p-5 text-club-white"
              data-testid={`link-hole-${hole.number}`}
            >
              <img src={hole.image} alt="" className="image-zoom absolute inset-0 h-full w-full object-cover opacity-55" />
              <div className="absolute inset-0 bg-club-green/50" />
              <div className="relative flex items-start justify-between">
                <span className="font-display text-5xl">{String(hole.number).padStart(2, '0')}</span>
                <span className="font-mono-club text-[10px] text-club-white/90">PAR {hole.men.par}</span>
              </div>
              <div className="relative flex items-end justify-between">
                <div>
                  <p className="font-display text-2xl">{hole.name || `Hole ${hole.number}`}</p>
                  <p className="mt-1 font-mono-club text-[9px] text-white/80">{hole.men.metres} M · SI {hole.men.stroke}</p>
                </div>
                <ArrowUpRight size={17} className="text-club-white" />
              </div>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
