import { Link } from 'wouter';
import { ArrowUpRight } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { PageIntro, usePageMeta } from '@/components/layout/Shared';
import { FacilityIcon } from '@/components/FacilityIcon';
import { club, images } from '@/data/club';
import { useFacilities } from '@/lib/club-data';

export default function Facilities() {
  usePageMeta('Facilities', `Everything on the grounds at ${club.name}: pool, gym, courts, restaurant, bar and clubhouse.`);
  const { items } = useFacilities();
  const facilities = items.filter((f) => f.active);
  return (
    <div className="bg-club-white">
      <PageIntro eyebrow="THE CLUB GROUNDS" title="Make a day of it." copy="Golf is only part of the club. Here is everything else on the grounds." image={images.clubhouse} />
      <main className="mx-auto max-w-[1480px] px-5 py-20 md:px-10 md:py-28">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {facilities.map((f) => (
            <article key={f.id} className="on-gold flex flex-col overflow-hidden border border-club-ink/10" data-testid={`card-facility-${f.id}`}>
              {f.image && <img src={f.image} alt={f.title} className="h-48 w-full object-cover" />}
              <div className="flex flex-1 flex-col p-6">
                <FacilityIcon icon={f.icon} size={30} className="text-club-gold" />
                <h2 className="font-display mt-6 text-3xl text-club-ink">{f.title}</h2>
                <p className="mt-3 text-sm leading-6 text-club-ink/70">{f.text}</p>
                {f.access && <p className="mt-4 border-t border-club-ink/10 pt-3 font-mono-club text-[9px] tracking-[.12em] text-club-green">{f.access.toUpperCase()}</p>}
                <Link href="/contact" className="mt-auto inline-flex items-center gap-2 pt-6 text-[10px] font-bold tracking-[.14em] text-club-green" data-testid={`link-facility-${f.id}`}>
                  ENQUIRE <ArrowUpRight size={14} />
                </Link>
              </div>
            </article>
          ))}
        </div>
        {facilities.length === 0 && <p className="py-10 text-center text-sm text-club-ink/70">Facility details are coming soon.</p>}
      </main>
      <Footer />
    </div>
  );
}
