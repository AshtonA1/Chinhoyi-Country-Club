import { Link } from 'wouter';
import { ArrowDownRight, ArrowUpRight, Car, Compass, Dumbbell, Quote, TreePine, Waves } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ButtonLink, LocationBand, SectionLabel, StatStrip, usePageMeta } from '@/components/layout/Shared';
import { club, images } from '@/data/club';

function EventRow({ day, month, title, meta }: { day: string; month: string; title: string; meta: string }) {
  return (
    <div className="flex items-center gap-5 border-b border-white/20 py-5">
      <div className="w-12 shrink-0 text-center">
        <span className="block font-display text-3xl leading-none">{day}</span>
        <span className="font-mono-club text-[9px] text-[#C8A951]">{month}</span>
      </div>
      <div>
        <h3 className="font-display text-2xl">{title}</h3>
        <p className="mt-1 text-xs text-white/50">{meta}</p>
      </div>
      <ArrowUpRight size={16} className="ml-auto text-[#C8A951]" />
    </div>
  );
}

function Story({ image, category, title, text }: { image: string; category: string; title: string; text: string }) {
  return (
    <article className="group">
      <div className="h-64 overflow-hidden">
        <img src={image} alt="" className="image-zoom h-full w-full object-cover" />
      </div>
      <SectionLabel>{category}</SectionLabel>
      <h3 className="font-display mt-3 text-3xl leading-none text-[#12372A]">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-[#5d6b63]">{text}</p>
      <button
        onClick={() => window.alert(`${title} will be added to the Chinhoyi Journal soon.`)}
        className="mt-5 flex items-center gap-2 text-[10px] font-bold tracking-[.15em] text-[#2E6B4E]"
        data-testid={`button-read-${category.toLowerCase().replaceAll(' ', '-')}`}
      >
        READ STORY <ArrowUpRight size={14} />
      </button>
    </article>
  );
}

export default function Home() {
  usePageMeta('Find your place in the day', `${club.name} in ${club.country} — open fairways, warm hospitality and the simple pleasure of making time for the game.`);
  return (
    <div className="bg-[#F7F5EF]">
      <section className="relative min-h-[760px] overflow-hidden bg-[#12372A] text-[#F7F5EF] md:min-h-[850px]">
        <Header />
        <img src={images.hero} alt="Aerial view of the fairway" className="absolute inset-0 h-full w-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#12372A] via-[#12372A]/20 to-[#12372A]/40" />
        <div className="relative mx-auto flex min-h-[760px] max-w-[1480px] items-end px-5 pb-20 md:min-h-[850px] md:px-10 md:pb-28">
          <div className="max-w-4xl reveal">
            <SectionLabel light>{club.city.toUpperCase()} · {club.country.toUpperCase()}</SectionLabel>
            <h1 className="font-display mt-5 max-w-4xl text-[clamp(4.5rem,13vw,11.5rem)] leading-[.78] tracking-[-.035em]">
              Play the<br /><em>long view.</em>
            </h1>
            <p className="mt-9 max-w-lg text-base leading-7 text-white/75 md:text-lg">
              A private club shaped by open skies, indigenous fairways and the simple pleasure of making time for the game.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonLink href="/tee-times">BOOK A TEE TIME</ButtonLink>
              <ButtonLink href="/course" dark className="border border-white/30 bg-transparent hover:bg-white/10">EXPLORE THE COURSE</ButtonLink>
            </div>
          </div>
          <div className="absolute bottom-8 right-5 hidden items-center gap-3 text-[10px] tracking-[.16em] text-white/60 md:flex">
            <ArrowDownRight size={15} className="text-[#C8A951]" /> SCROLL TO DISCOVER
          </div>
        </div>
      </section>
      <main>
        <section className="mx-auto max-w-[1480px] px-5 py-20 md:px-10 md:py-32">
          <div className="grid gap-12 md:grid-cols-12 md:items-end">
            <div className="md:col-span-7">
              <SectionLabel>THE CLUB, IN BRIEF</SectionLabel>
              <h2 className="font-display mt-5 max-w-3xl text-5xl leading-[.95] text-[#12372A] md:text-7xl">
                A little further<br /><em>from ordinary.</em>
              </h2>
            </div>
            <p className="max-w-md text-sm leading-7 text-[#5d6b63] md:col-span-4 md:col-start-9">
              {club.name.split(' ')[0]} is a members’ club with room to breathe. Come for the quality of the course; stay for the warmth of the welcome, the cold towel after nine, and the conversation that carries into dusk.
            </p>
          </div>
          <div className="mt-16"><StatStrip items={club.stats} /></div>
        </section>
        <section className="bg-[#e8e9df] py-20 md:py-28">
          <div className="mx-auto max-w-[1480px] px-5 md:px-10">
            <div className="grid gap-10 md:grid-cols-12 md:items-center">
              <div className="md:col-span-5">
                <SectionLabel>THE DAY AHEAD</SectionLabel>
                <h2 className="font-display mt-5 text-5xl leading-[.92] text-[#12372A] md:text-7xl">
                  Your best<br /><em>hours.</em>
                </h2>
                <p className="mt-7 max-w-md text-sm leading-7 text-[#5d6b63]">
                  From an early tee time to sundowners on the veranda, the rhythm here is unhurried, but never uneventful.
                </p>
                <ButtonLink href="/about" dark className="mt-8">MEET THE CLUB</ButtonLink>
              </div>
              <div className="group relative min-h-[430px] overflow-hidden md:col-span-7">
                <img src={images.clubhouse} alt="Clubhouse surrounded by trees" className="image-zoom absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#12372A]/65 to-transparent" />
                <div className="absolute bottom-6 left-6 text-[#F7F5EF]">
                  <p className="font-mono-club text-[9px] tracking-[.18em] text-[#C8A951]">THE VERANDA</p>
                  <p className="mt-2 font-display text-3xl">Where the round lingers.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="mx-auto max-w-[1480px] px-5 py-20 md:px-10 md:py-32">
          <div className="flex flex-col justify-between gap-7 md:flex-row md:items-end">
            <div>
              <SectionLabel>THE COURSE</SectionLabel>
              <h2 className="font-display mt-5 text-5xl leading-[.95] text-[#12372A] md:text-7xl">
                Eighteen ways<br /><em>to see the land.</em>
              </h2>
            </div>
            <Link href="/course" className="group flex items-center gap-3 text-[10px] font-bold tracking-[.16em] text-[#2E6B4E]" data-testid="link-home-course">
              VIEW ALL HOLES <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            <Link href="/course/hole/1" className="group relative min-h-[410px] overflow-hidden md:col-span-2" data-testid="link-home-hole-1">
              <img src={images.fairway} alt="Course fairway" className="image-zoom absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#12372A]/80 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 text-[#F7F5EF]">
                <span className="font-mono-club text-[10px] text-[#C8A951]">01 / PAR 4 / 374 M</span>
                <h3 className="font-display mt-2 text-4xl">The Invitation</h3>
              </div>
            </Link>
            <div className="flex flex-col justify-between bg-[#12372A] p-7 text-[#F7F5EF] md:p-9">
              <Compass className="text-[#C8A951]" size={26} strokeWidth={1.2} />
              <div>
                <p className="font-mono-club text-[9px] tracking-[.18em] text-[#C8A951]">COURSE NOTE</p>
                <p className="mt-4 font-display text-3xl leading-tight">"A course that gives you something new on every walk."</p>
                <p className="mt-6 text-xs leading-6 text-white/55">— ASHTON MBEDZI, course architect</p>
              </div>
              <Link href="/course" className="mt-10 flex items-center gap-2 text-[10px] font-bold tracking-[.14em] text-[#C8A951]" data-testid="link-course-note">
                READ THE COURSE NOTES <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>
        </section>
        <section className="bg-[#12372A] py-20 text-[#F7F5EF] md:py-28">
          <div className="mx-auto max-w-[1480px] px-5 md:px-10">
            <div className="grid gap-12 md:grid-cols-12">
              <div className="md:col-span-5">
                <SectionLabel light>WHAT'S ON</SectionLabel>
                <h2 className="font-display mt-5 text-5xl leading-[.92] md:text-7xl">
                  Good reasons<br /><em>to stay late.</em>
                </h2>
                <ButtonLink href="/events" className="mt-8">SEE ALL EVENTS</ButtonLink>
              </div>
              <div className="md:col-span-6 md:col-start-7">
                <div className="border-t border-white/20">
                  <EventRow day="14" month="JUN" title="Winter Solstice Supper" meta="Members & guests · 18:30" />
                  <EventRow day="22" month="JUN" title="Chinhoyi Cup — Final" meta="Club championship · From 07:10" />
                  <EventRow day="06" month="JUL" title="Sunday Sundowners" meta="The Veranda · 16:00" />
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="mx-auto grid max-w-[1480px] gap-12 px-5 py-20 md:grid-cols-12 md:items-center md:px-10 md:py-32">
          <div className="order-2 md:order-1 md:col-span-6">
            <div className="group relative h-[420px] overflow-hidden md:h-[580px]">
              <img src={images.dining} alt="Dining table" className="image-zoom h-full w-full object-cover" />
              <div className="absolute bottom-5 left-5 flex items-center gap-3 bg-[#F7F5EF]/90 px-4 py-3 text-[#12372A]">
                <span className="font-mono-club text-[9px] tracking-[.1em]">THE DINING ROOM</span>
              </div>
            </div>
          </div>
          <div className="order-1 md:order-2 md:col-span-5 md:col-start-8">
            <SectionLabel>MORE THAN GOLF</SectionLabel>
            <h2 className="font-display mt-5 text-5xl leading-[.92] text-[#12372A] md:text-7xl">
              The details<br /><em>make the day.</em>
            </h2>
            <p className="mt-7 text-sm leading-7 text-[#5d6b63]">
              A place for the whole day, thoughtfully made. Fresh lunches from our kitchen, a quiet gym, lots of games and sports for the family, and a team who remembers how you like your drink.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-y-4 text-xs text-[#2E6B4E]">
              <span className="flex items-center gap-2"><Waves size={15} /> SWIMMING POOL</span>
              <span className="flex items-center gap-2"><Dumbbell size={15} /> FITNESS STUDIO</span>
              <span className="flex items-center gap-2"><Car size={15} /> SQUASH</span>
              <span className="flex items-center gap-2"><Car size={15} /> BOWLING</span>
              <span className="flex items-center gap-2"><TreePine size={15} /> INDIGENOUS GARDENS</span>
              <span className="flex items-center gap-2"><Car size={15} /> PARKING</span>
              <span className="flex items-center gap-2"><Car size={15} /> CAR WASH</span>
            </div>
            <ButtonLink href="/facilities" dark className="mt-9">DISCOVER FACILITIES</ButtonLink>
          </div>
        </section>
        <section className="relative overflow-hidden bg-[#e8e9df] py-20 md:py-28">
          <div className="mx-auto grid max-w-[1480px] gap-10 px-5 md:grid-cols-12 md:px-10">
            <div className="md:col-span-4">
              <SectionLabel>MEMBERSHIP</SectionLabel>
              <h2 className="font-display mt-5 text-5xl leading-[.92] text-[#12372A] md:text-7xl">
                A club<br /><em>with a pulse.</em>
              </h2>
            </div>
            <div className="md:col-span-5 md:col-start-7">
              <Quote className="text-[#C8A951]" size={32} strokeWidth={1} />
              <p className="mt-5 font-display text-3xl leading-tight text-[#12372A]">
                "Chinhoyi is the place our family comes to exhale. Every visit feels like coming home."
              </p>
              <p className="mt-5 font-mono-club text-[9px] tracking-[.15em] text-[#5d6b63]">— ASHTON M., MEMBER SINCE 2012</p>
              <ButtonLink href="/membership" dark className="mt-9">MEMBERSHIP AT CHINHOYI</ButtonLink>
            </div>
          </div>
        </section>
        <section className="bg-[#F7F5EF] px-5 py-20 md:px-10 md:py-28">
          <div className="mx-auto max-w-[1480px]">
            <div className="grid gap-10 md:grid-cols-12 md:items-end">
              <div className="md:col-span-5">
                <SectionLabel>FROM THE JOURNAL</SectionLabel>
                <h2 className="font-display mt-5 text-5xl leading-[.92] text-[#12372A] md:text-7xl">
                  Small stories<br /><em>from the fairway.</em>
                </h2>
              </div>
              <p className="max-w-sm text-sm leading-7 text-[#5d6b63] md:col-span-4 md:col-start-9">
                Seasonal notes, course wisdom and the people who make the club what it is.
              </p>
            </div>
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              <Story image={images.sunset} category="ON THE COURSE" title="The light changes everything" text={`An afternoon walk through ${club.city}'s golden hour.`} />
              <Story image={images.detail} category="THE CLUBHOUSE" title="A table worth taking your time at" text="Inside our kitchen, where the day's best conversations begin." />
              <Story image={images.fairway} category="COURSE NOTES" title="The art of the second shot" text="A quiet guide to playing the course with intent." />
            </div>
          </div>
        </section>
        <LocationBand />
      </main>
      <Footer />
    </div>
  );
}
