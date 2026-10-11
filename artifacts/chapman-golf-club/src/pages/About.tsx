import type { ReactNode } from 'react';
import { Compass, Star, Users } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { PageIntro, SectionLabel, usePageMeta } from '@/components/layout/Shared';
import { club, images } from '@/data/club';

function Value({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="border-t border-[#12372A]/20 pt-5">
      <div className="text-[#C8A951]">{icon}</div>
      <h3 className="mt-7 font-display text-3xl text-[#12372A]">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-[#5d6b63]">{text}</p>
    </div>
  );
}

export default function About() {
  usePageMeta('About the club', `About ${club.name} in ${club.city}, ${club.country}.`);
  return (
    <div className="bg-[#F7F5EF]">
      <PageIntro
        eyebrow="ABOUT THE CLUB"
        title="Golf and a whole lot more."
        copy={`${club.name} in ${club.city}: an 18-hole golf course and a country club for the whole family.`}
        image={images.sunset}
      />
      <main>
        <section className="mx-auto grid max-w-[1480px] gap-12 px-5 py-20 md:grid-cols-12 md:px-10 md:py-32">
          <div className="md:col-span-5">
            <SectionLabel>THE CLUB</SectionLabel>
            <h2 className="font-display mt-5 text-5xl leading-[.92] text-[#12372A] md:text-7xl">
              More than<br /><em>a golf course.</em>
            </h2>
          </div>
          <div className="md:col-span-5 md:col-start-8">
            <p className="text-xl leading-8 text-[#12372A]">
              {club.name} is a country club. Golf is its most prominent section, alongside a swimming pool, gym, squash, bowling, soccer, tennis, a restaurant, a bar and the clubhouse.
            </p>
            <p className="mt-6 text-sm leading-7 text-[#5d6b63]">
              Membership gives you the golf course and the use of the other facilities, so there is something for every member of the family.
            </p>
          </div>
        </section>
        <section className="bg-[#e8e9df] py-20 md:py-28">
          <div className="mx-auto max-w-[1480px] px-5 md:px-10">
            <div className="grid gap-5 md:grid-cols-3">
              <Value icon={<Compass />} title="Golf at the heart" text="An 18-hole, par 72 course, with regular club competitions and tournaments." />
              <Value icon={<Users />} title="Good company" text="A club for members, their families and their guests." />
              <Value icon={<Star />} title="Everything in one place" text="Sport, swimming, fitness, food and drink on the same grounds." />
            </div>
          </div>
        </section>
        <section className="mx-auto max-w-[1480px] px-5 py-20 md:px-10 md:py-28">
          <div className="group relative h-[470px] overflow-hidden md:h-[650px]">
            <img src={images.hero} alt="Course at dawn" className="image-zoom h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#12372A]/75 to-transparent" />
            <div className="absolute bottom-8 left-7 max-w-lg text-[#F7F5EF] md:bottom-12 md:left-12">
              <SectionLabel light>COME AND VISIT</SectionLabel>
              <p className="font-display mt-4 text-4xl leading-none md:text-6xl">See the club for yourself.</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
