import { Link } from 'wouter';
import { ArrowUpRight } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { PageIntro, usePageMeta } from '@/components/layout/Shared';
import { facilities, images } from '@/data/club';

export default function Facilities() {
  usePageMeta('Facilities', 'Every corner is designed to make the hours between golf feel just as considered.');
  return (
    <div className="bg-[#F7F5EF]">
      <PageIntro eyebrow="THE CLUBHOUSE & BEYOND" title="Make a day of it." copy="Every corner is designed to make the hours between golf feel just as considered." image={images.clubhouse} />
      <main className="mx-auto max-w-[1480px] px-5 py-20 md:px-10 md:py-28">
        <div className="grid gap-10">
          {facilities.map((f, i) => (
            <section key={f.id} className="grid gap-8 md:grid-cols-12 md:items-center">
              <div className={`group relative h-[340px] overflow-hidden md:col-span-7 ${i % 2 ? 'md:order-2' : ''}`}>
                <img src={f.image} alt={f.title} className="image-zoom h-full w-full object-cover" />
              </div>
              <div className={`md:col-span-4 ${i % 2 ? 'md:order-1 md:col-start-1' : 'md:col-start-9'}`}>
                <h2 className="font-display mt-5 text-4xl text-[#12372A] md:text-5xl">{f.title}</h2>
                <p className="mt-4 text-sm leading-7 text-[#5d6b63]">{f.text}</p>
                <Link href="/contact" className="mt-6 inline-flex items-center gap-2 text-[10px] font-bold tracking-[.14em] text-[#2E6B4E]" data-testid={`link-facility-${f.id}`}>
                  {f.cta.toUpperCase()} <ArrowUpRight size={14} />
                </Link>
              </div>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
