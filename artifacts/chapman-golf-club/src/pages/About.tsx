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
  usePageMeta('Made for the long game', `Discover the heart, open-door spirit and quiet standards behind ${club.name}.`);
  return (
    <div className="bg-[#F7F5EF]">
      <PageIntro
        eyebrow="THE CLUB STORY"
        title="Made for the long game."
        copy={`A club with a ${club.country} heart, an open-door spirit and a deep respect for the game as it should be played.`}
        image={images.sunset}
      />
      <main>
        <section className="mx-auto grid max-w-[1480px] gap-12 px-5 py-20 md:grid-cols-12 md:px-10 md:py-32">
          <div className="md:col-span-5">
            <SectionLabel>OUR BEGINNING</SectionLabel>
            <h2 className="font-display mt-5 text-5xl leading-[.92] text-[#12372A] md:text-7xl">
              A good idea,<br /><em>carefully grown.</em>
            </h2>
          </div>
          <div className="md:col-span-5 md:col-start-8">
            <p className="text-xl leading-8 text-[#12372A]">
              In {club.establishedYear}, a handful of friends found a piece of open country and decided to make a
              place where golf could be taken seriously without taking itself too seriously.
            </p>
            <p className="mt-6 text-sm leading-7 text-[#5d6b63]">
              More than five decades later, the club remains true to that first instinct. The course is generous
              in spirit, the clubhouse is warm by design, and every member is encouraged to make the place their own.
            </p>
          </div>
        </section>
        <section className="bg-[#e8e9df] py-20 md:py-28">
          <div className="mx-auto max-w-[1480px] px-5 md:px-10">
            <div className="grid gap-5 md:grid-cols-3">
              <Value icon={<Compass />} title="The land comes first" text="We care for every tree, stream and horizon. A great course belongs to its landscape." />
              <Value icon={<Users />} title="Good company" text="New members are welcomed by name. There is always time for one more at the table." />
              <Value icon={<Star />} title="Quietly exacting" text="From the greens to the service, we sweat the details so you can enjoy the whole." />
            </div>
          </div>
        </section>
        <section className="mx-auto max-w-[1480px] px-5 py-20 md:px-10 md:py-28">
          <div className="group relative h-[470px] overflow-hidden md:h-[650px]">
            <img src={images.hero} alt="Course at dawn" className="image-zoom h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#12372A]/75 to-transparent" />
            <div className="absolute bottom-8 left-7 max-w-lg text-[#F7F5EF] md:bottom-12 md:left-12">
              <SectionLabel light>THE CLUB PROMISE</SectionLabel>
              <p className="font-display mt-4 text-4xl leading-none md:text-6xl">Leave with more than you arrived with.</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
