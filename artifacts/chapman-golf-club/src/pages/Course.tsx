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
    <div className="bg-[#F7F5EF]">
      <PageIntro
        eyebrow="THE COURSE · 18 HOLES"
        title="Eighteen holes."
        copy={`${holes.length} holes, par ${men.par.total}, ${formatNumber(men.metres.total)} metres from the men’s tees.`}
        image={images.fairway}
      />
      <main className="mx-auto max-w-[1480px] px-5 py-20 md:px-10 md:py-28">
        <div className="grid gap-8 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <SectionLabel>THE ROUTE</SectionLabel>
            <h2 className="font-display mt-5 text-5xl leading-[.92] text-[#12372A] md:text-7xl">
              Hole by<br /><em>hole.</em>
            </h2>
          </div>
          <p className="max-w-md text-sm leading-7 text-[#5d6b63] md:col-span-4 md:col-start-9">
            Select a hole for its par, distance and stroke index. Distances shown are from the men’s tees; the hole page also shows the ladies’ tees.
          </p>
        </div>
        <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {holes.map((hole) => (
            <Link
              href={`/course/hole/${hole.number}`}
              key={hole.id}
              className="group relative flex min-h-[220px] flex-col justify-between overflow-hidden bg-[#12372A] p-5 text-[#F7F5EF]"
              data-testid={`link-hole-${hole.number}`}
            >
              <img src={hole.image} alt="" className="image-zoom absolute inset-0 h-full w-full object-cover opacity-55" />
              <div className="absolute inset-0 bg-[#12372A]/45" />
              <div className="relative flex items-start justify-between">
                <span className="font-display text-5xl">{String(hole.number).padStart(2, '0')}</span>
                <span className="font-mono-club text-[10px] text-[#C8A951]">PAR {hole.men.par}</span>
              </div>
              <div className="relative flex items-end justify-between">
                <div>
                  <p className="font-display text-2xl">{hole.name || `Hole ${hole.number}`}</p>
                  <p className="mt-1 font-mono-club text-[9px] text-white/60">{hole.men.metres} M · SI {hole.men.stroke}</p>
                </div>
                <ArrowUpRight size={17} className="text-[#C8A951]" />
              </div>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
